import { describe, expect, it } from "vitest";
import { setWeekendMode, canFullyCustomize, createSchedule, reorderActivities, resizeTimeFrame, scheduleCsv, scheduleSchema } from "./custom-schedule";

const answers = { whose: "me", focus: "work", span: "weekly", start: 8, priorities: 3, pace: "sprints" } as const;
describe("custom schedules", () => {
  it("requires an account for full customization and saving", () => { expect(canFullyCustomize(null)).toBe(false); expect(canFullyCustomize("signed-in-user")).toBe(true); });
  it("titles the schedule for whoever it belongs to", () => {
    expect(createSchedule({ ...answers, whose: "kids" }).title).toBe("My Kids' Schedule");
    expect(createSchedule({ ...answers, whose: "spouse" }).title).toBe("My Spouse's Schedule");
    expect(createSchedule({ ...answers, whose: "family" }).title).toBe("Our Family Schedule");
  });
  it("allows independently named activities and times for every weekday", () => {
    const doc = createSchedule(answers);
    const first = doc.days["Mon"]?.[0];
    if (!first) throw new Error("Missing Monday");
    first.label = "School run"; first.start = 400; first.end = 430;
    expect(doc.days["Tue"]?.[0]?.label).toBe("Morning routine");
    expect(doc.days["Tue"]?.[0]?.start).toBe(480);
    expect(scheduleSchema.safeParse(doc).success).toBe(true);
  });
  it("changes the overall time frame to the user's exact start and end", () => {
    const doc = resizeTimeFrame(createSchedule(answers), 600, 1080);
    expect(doc.days["Mon"]?.[0]?.start).toBe(600); expect(doc.days["Mon"]?.at(-1)?.end).toBe(1080);
  });
  it("rejects backwards and overlapping activity times", () => {
    const doc = createSchedule(answers); const first = doc.days["Mon"]?.[0];
    if (!first) throw new Error("Missing Monday");
    first.end = first.start;
    expect(scheduleSchema.safeParse(doc).success).toBe(false);
    first.end = 800;
    expect(scheduleSchema.safeParse(doc).success).toBe(false);
  });
  it("reorders activities while keeping their durations and preventing overlap", () => {
    const blocks = createSchedule(answers).days["Mon"] ?? [];
    const reordered = reorderActivities(blocks, 1, -1);
    expect(reordered[0]?.label).toBe("Deep work"); expect(reordered[0]?.end).toBe(525); expect(reordered[1]?.start).toBe(525);
  });
  it("exports the edited title, name and individual weekday content", () => {
    const doc = createSchedule(answers); doc.title = "Key's week"; doc.name = "Key Moore";
    const block = doc.days["Wed"]?.[0]; if (!block) throw new Error("Missing Wednesday"); block.label = "Client, planning";
    expect(scheduleCsv(doc)).toContain('"Key\'s week","Key Moore","Wed","08:00","08:30","Client, planning"');
  });
  it("gives weekends a relaxed plan starting an hour later with no work activities", () => {
    const doc = createSchedule(answers);
    const labels = [...(doc.days["Sat"] ?? []), ...(doc.days["Sun"] ?? [])].map((b) => b.label);
    expect(doc.days["Sat"]?.[0]?.start).toBe(540);
    for (const w of ["Meetings", "Email & admin", "Deep work"]) expect(labels).not.toContain(w);
    expect(doc.days["Sun"]?.map((b) => b.label)).toContain("Plan next week");
    expect(doc.days["Sat"]?.map((b) => b.label)).not.toContain("Plan next week");
    expect(scheduleSchema.safeParse(doc).success).toBe(true);
  });
  it("adapts weekends to what the user is juggling", () => {
    expect(createSchedule({ ...answers, focus: "school" }).days["Sun"]?.map((b) => b.label)).toContain("Light study / review");
    expect(createSchedule({ ...answers, focus: "family" }).days["Sat"]?.map((b) => b.label)).toContain("Family outing");
    const me = createSchedule({ ...answers, focus: "selfcare" });
    const all = [...(me.days["Sat"] ?? []), ...(me.days["Sun"] ?? [])].map((b) => b.label);
    expect(all).toContain("Self-care"); expect(all).toContain("Journaling");
  });
  it("switches weekends to match weekdays and back", () => {
    const doc = createSchedule(answers);
    const same = setWeekendMode(doc, "same");
    expect(same.days["Sat"]?.map((b) => b.label)).toEqual(doc.days["Mon"]?.map((b) => b.label));
    expect(scheduleSchema.safeParse(same).success).toBe(true);
    expect(setWeekendMode(same, "relaxed").days["Sat"]).toEqual(doc.days["Sat"]);
  });
});
