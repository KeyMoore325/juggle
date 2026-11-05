export type Whose = "me" | "kids" | "spouse" | "family";
export type Focus = "school" | "work" | "family" | "selfcare";
export type Span = "daily" | "weekly";
export type Start = 6 | 8 | 10;
export type Pace = "sprints" | "deep";

export interface Answers {
  whose: Whose;
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

export const WHOSE_TITLES: Record<Whose, string> = {
  me: "My Juggle Schedule",
  kids: "My Kids' Schedule",
  spouse: "My Spouse's Schedule",
  family: "Our Family Schedule",
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

/** Lighter weekend day: starts 1 hour later, no work activities. */
export function buildWeekendDay(a: Answers, day: "Sat" | "Sun"): Block[] {
  const blocks: Block[] = [];
  let t = (a.start + 1) * 60;
  const push = (len: number, label: string, kind: Block["kind"]) => { blocks.push({ start: fmt(t), end: fmt(t + len), label, kind }); t += len; };
  push(60, "Slow morning", "routine");
  if (a.focus === "selfcare") push(45, day === "Sat" ? "Self-care" : "Journaling", "routine");
  if (day === "Sat") push(60, "Errands", "focus");
  push(60, "Movement / outdoors", "focus");
  push(60, "Lunch", "meal");
  if (a.focus === "school" && day === "Sun") push(60, "Light study / review", "focus");
  if (a.focus === "family" && day === "Sat") push(120, "Family outing", "focus");
  else push(120, "Family / friends time", "focus");
  push(60, "Hobby time", "focus");
  if (a.focus === "selfcare" && day === "Sun") push(45, "Self-care", "routine");
  push(60, "Rest", "break");
  if (day === "Sun") push(30, "Plan next week", "routine");
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
