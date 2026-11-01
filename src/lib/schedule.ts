export type Focus = "school" | "work" | "family" | "selfcare";
export type Span = "daily" | "weekly";
export type Start = 6 | 8 | 10;
export type Pace = "sprints" | "deep";

export interface Answers {
  focus: Focus;
  span: Span;
  start: Start;
  priorities: 2 | 3 | 4;
  pace: Pace;
}

export interface Block {
  start: string;
  end: string;
  label: string;
  kind: "focus" | "break" | "meal" | "routine";
}

const FOCUS_LABELS: Record<Focus, string[]> = {
  school: ["Class / lecture", "Homework", "Study session", "Reading", "Project work"],
  work: ["Deep work", "Meetings", "Email & admin", "Planning", "Creative work"],
  family: ["School run", "Household tasks", "Family time", "Errands", "Kids' activities"],
  selfcare: ["Movement", "Journaling", "Hobby time", "Learning", "Rest & recharge"],
};

export const fmt = (mins: number) => {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${m.toString().padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
};

/** Builds one day of blocks. Day starts at `start` with a 30-min morning routine. */
export function buildDay(a: Answers): Block[] {
  const blocks: Block[] = [];
  let t = a.start * 60;
  const push = (len: number, label: string, kind: Block["kind"]) => {
    blocks.push({ start: fmt(t), end: fmt(t + len), label, kind });
    t += len;
  };
  push(30, "Morning routine", "routine");
  const focusLen = a.pace === "sprints" ? 45 : 90;
  const breakLen = a.pace === "sprints" ? 10 : 20;
  const labels = FOCUS_LABELS[a.focus];
  for (let i = 0; i < a.priorities; i++) {
    if (i === Math.ceil(a.priorities / 2)) push(60, "Lunch", "meal");
    push(focusLen, labels[i % labels.length] ?? "Focus time", "focus");
    push(breakLen, "Break", "break");
  }
  push(60, "Flex / catch-up", "focus");
  push(30, "Wind down & plan tomorrow", "routine");
  return blocks;
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function toCsv(a: Answers): string {
  const day = buildDay(a);
  const cols = a.span === "weekly" ? DAYS : ["Today"];
  const rows = [["Time", ...cols].join(",")];
  day.forEach((b) => rows.push([`${b.start} - ${b.end}`, ...cols.map(() => `"${b.label}"`)].join(",")));
  return rows.join("\n");
}
