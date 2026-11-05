import { z } from "zod";
import { buildDay, buildWeekendDay, DAYS, WHOSE_TITLES, type Answers, type Block } from "./schedule";

export const themeSchema = z.enum(["playful", "minimal", "soft"]);
export const colorSchema = z.enum(["pink", "blue", "gold", "mint"]);
export const activitySchema = z.object({
  id: z.string().min(1), label: z.string().trim().min(1, "Give every activity a name.").max(120),
  start: z.number().int().min(0).max(1439), end: z.number().int().min(1).max(1440),
  kind: z.enum(["focus", "break", "meal", "routine"]),
}).refine((b) => b.end > b.start, { message: "Activities must end after they start." });
export const scheduleSchema = z.object({
  version: z.literal(1), title: z.string().trim().min(1, "Add a schedule title.").max(100),
  name: z.string().max(80), span: z.enum(["daily", "weekly"]),
  theme: themeSchema, color: colorSchema,
  days: z.record(z.array(activitySchema).max(100)),
  weekends: z.enum(["relaxed", "same"]).optional(),
  stash: z.record(z.array(activitySchema).max(100)).optional(),
}).superRefine((doc, ctx) => {
  for (const key of doc.span === "weekly" ? DAYS : ["Today"]) {
    if (!doc.days[key]) ctx.addIssue({ code: "custom", message: `Missing ${key} plan.` });
  }
  for (const [key, blocks] of Object.entries(doc.days)) {
    const sorted = [...blocks].sort((a, b) => a.start - b.start);
    for (let i = 1; i < sorted.length; i++) {
      const previous = sorted[i - 1], current = sorted[i];
      if (previous && current && current.start < previous.end) {
        ctx.addIssue({ code: "custom", message: `${key}: ${current.label} overlaps ${previous.label}.` });
      }
    }
    if (new Set(blocks.map((b) => b.id)).size !== blocks.length) ctx.addIssue({ code: "custom", message: `${key}: duplicate activity.` });
  }
});
export type Activity = z.infer<typeof activitySchema>;
export type ScheduleDocument = z.infer<typeof scheduleSchema>;
export type Theme = z.infer<typeof themeSchema>;
export type Color = z.infer<typeof colorSchema>;
export const THEMES: { value: Theme; label: string }[] = [
  { value: "playful", label: "Playful" }, { value: "minimal", label: "Minimal" }, { value: "soft", label: "Soft" },
];
export const COLORS: { value: Color; label: string }[] = [
  { value: "pink", label: "Pink" }, { value: "blue", label: "Blue" }, { value: "gold", label: "Gold" }, { value: "mint", label: "Mint" },
];
export function canFullyCustomize(userId: string | null | undefined) { return Boolean(userId); }
export function minutesFromLabel(label: string) {
  const match = /^(\d+):(\d+) (AM|PM)$/.exec(label);
  if (!match) return 0;
  return (Number(match[1]) % 12 + (match[3] === "PM" ? 12 : 0)) * 60 + Number(match[2]);
}
export function timeInput(minutes: number) {
  return `${Math.floor(minutes / 60).toString().padStart(2, "0")}:${(minutes % 60).toString().padStart(2, "0")}`;
}
export function inputMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return (hours ?? 0) * 60 + (minutes ?? 0);
}
export function createSchedule(answers: Answers, preferences?: { theme: Theme; color: Color }): ScheduleDocument {
  const convert = (list: Block[], prefix: string) => list.map((b, i) => ({ ...b, id: `${prefix}-${i}`, start: minutesFromLabel(b.start), end: minutesFromLabel(b.end) }));
  const day = convert(buildDay(answers), "activity");
  const days: Record<string, Activity[]> = Object.fromEntries(["Today", ...DAYS].map((key) => [key, day.map((b) => ({ ...b }))]));
  days["Sat"] = convert(buildWeekendDay(answers, "Sat"), "sat"); days["Sun"] = convert(buildWeekendDay(answers, "Sun"), "sun");
  return { version: 1, title: WHOSE_TITLES[answers.whose], name: "", span: answers.span, theme: preferences?.theme ?? "playful", color: preferences?.color ?? "pink", weekends: "relaxed", days };
}
/** Switch weekends between the relaxed plan and a copy of Monday, keeping the other version to switch back. */
export function setWeekendMode(doc: ScheduleDocument, mode: "relaxed" | "same"): ScheduleDocument {
  if ((doc.weekends ?? "relaxed") === mode) return doc;
  const current = { Sat: doc.days["Sat"] ?? [], Sun: doc.days["Sun"] ?? [] };
  const mon = doc.days["Mon"] ?? [];
  const next = mode === "same"
    ? { Sat: mon.map((b) => ({ ...b, id: `sat-${b.id}` })), Sun: mon.map((b) => ({ ...b, id: `sun-${b.id}` })) }
    : { Sat: doc.stash?.["Sat"] ?? current.Sat, Sun: doc.stash?.["Sun"] ?? current.Sun };
  return { ...doc, weekends: mode, stash: current, days: { ...doc.days, ...next } };
}
export function resizeTimeFrame(doc: ScheduleDocument, start: number, end: number): ScheduleDocument {
  if (end <= start) throw new Error("The end time must be later than the start time.");
  const days = Object.fromEntries(Object.entries(doc.days).map(([key, blocks]) => {
    if (!blocks.length) return [key, blocks];
    const oldStart = Math.min(...blocks.map((b) => b.start)), oldEnd = Math.max(...blocks.map((b) => b.end));
    if (end - start < blocks.length) throw new Error("Choose a longer time frame for these activities.");
    const scale = (value: number) => Math.round(start + (value - oldStart) * (end - start) / (oldEnd - oldStart));
    return [key, blocks.map((b) => ({ ...b, start: scale(b.start), end: scale(b.end) }))];
  }));
  const next = { ...doc, days };
  const result = scheduleSchema.safeParse(next);
  if (!result.success) throw new Error("Choose a longer time frame for these activities.");
  return next;
}
export function reorderActivities(blocks: Activity[], index: number, direction: -1 | 1) {
  const target = index + direction;
  if (target < 0 || target >= blocks.length) return blocks;
  const result = [...blocks];
  const item = result[index], other = result[target];
  if (!item || !other) return blocks;
  result[index] = other; result[target] = item;
  let cursor = Math.min(...blocks.map((b) => b.start));
  return result.map((b) => { const length = b.end - b.start; const next = { ...b, start: cursor, end: cursor + length }; cursor += length; return next; });
}
export function scheduleCsv(doc: ScheduleDocument) {
  const quote = (s: string) => `"${(/^[=+@\-\t\r]/.test(s) ? "'" : "") + s.replace(/"/g, '""')}"`;
  const rows = [["Schedule", "Name", "Day", "Start", "End", "Activity", "Type"]];
  for (const key of doc.span === "weekly" ? DAYS : ["Today"]) {
    for (const b of doc.days[key] ?? []) rows.push([doc.title, doc.name, key, timeInput(b.start), timeInput(b.end), b.label, b.kind]);
  }
  return rows.map((row) => row.map(quote).join(",")).join("\r\n");
}