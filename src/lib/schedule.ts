export type Whose = "me" | "kids" | "partner" | "family";
export type KidAge = "little" | "school" | "teen";
export type Plate = "school" | "work" | "family" | "fitness" | "side" | "home" | "selfcare" | "social";
export type Fixed = "school" | "work" | "shift" | "flexible";
export type Wake = 5 | 6 | 7 | 8 | 9;
export type Sleep = 21 | 22 | 23 | 24;
export type Peak = "morning" | "afternoon" | "evening";
export type Pace = "sprints" | "steady" | "deep";
export type More = "rest" | "movement" | "hobbies" | "people" | "learning" | "organized";
export type Span = "daily" | "weekly";

export interface Answers {
  whose: Whose;
  kidAge?: KidAge;
  plate: Plate[];
  fixed: Fixed;
  /** Shift start/end in minutes after midnight (shift work only). */
  shiftStart?: number;
  shiftEnd?: number;
  wake: Wake;
  sleep: Sleep;
  peak: Peak;
  pace: Pace;
  more: More;
  span: Span;
}

/** Times are minutes after midnight (0–1440). */
export interface Block {
  start: number;
  end: number;
  label: string;
  kind: "focus" | "break" | "meal" | "routine";
}

export const MAX_PLATE = 3;

/** Sensible fill-ins so a partly answered quiz can still be previewed. */
export const DEFAULT_ANSWERS: Answers = {
  whose: "me", plate: ["work"], fixed: "flexible", wake: 7, sleep: 23, peak: "morning", pace: "steady", more: "organized", span: "weekly",
};

export const PACE_TIMES: Record<Pace, { focus: number; rest: number }> = {
  sprints: { focus: 25, rest: 5 }, steady: { focus: 50, rest: 10 }, deep: { focus: 90, rest: 20 },
};

export const PLATE_LABELS: Record<Plate, string> = {
  school: "Homework / study", work: "Deep work", family: "Family time", fitness: "Workout",
  side: "Side project", home: "Chores", selfcare: "Self-care", social: "Social time",
};

const MORE_BLOCK: Record<More, { label: string; kind: Block["kind"] }> = {
  rest: { label: "Rest & recharge", kind: "break" }, movement: { label: "Movement", kind: "focus" },
  hobbies: { label: "Hobby time", kind: "focus" }, people: { label: "Time with loved ones", kind: "focus" },
  learning: { label: "Learning", kind: "focus" }, organized: { label: "Plan & organize", kind: "routine" },
};

export const WHOSE_TITLES: Record<Whose, string> = {
  me: "My Juggle Schedule",
  kids: "My Kids' Schedule",
  partner: "Our Couple Schedule",
  family: "Our Family Schedule",
};

export const fmt = (mins: number) => {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${m.toString().padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
};

type Span2 = [number, number];
const overlaps = (a: Span2, b: Span2) => a[0] < b[1] && b[0] < a[1];

/** Fixed commitment ranges clipped to the waking day. */
export function fixedRanges(a: Answers, dayStart: number, dayEnd: number): { range: Span2; label: string }[] {
  const clip = (s: number, e: number): Span2 | null => {
    const r: Span2 = [Math.max(s, dayStart), Math.min(e, dayEnd)];
    return r[1] - r[0] >= 15 ? r : null;
  };
  const out: { range: Span2; label: string }[] = [];
  const add = (s: number, e: number, label: string) => { const r = clip(s, e); if (r) out.push({ range: r, label }); };
  if (a.fixed === "school") add(480, 900, a.whose === "kids" && a.kidAge === "little" ? "Preschool / daycare" : "School");
  else if (a.fixed === "work") add(540, 1020, "Work");
  else if (a.fixed === "shift" && a.shiftStart !== undefined && a.shiftEnd !== undefined) {
    if (a.shiftEnd > a.shiftStart) add(a.shiftStart, a.shiftEnd, "Shift");
    else { add(0, a.shiftEnd, "Shift"); add(a.shiftStart, 1440, "Shift"); }
  }
  return out;
}

/** Builds one weekday: wake → lights out, fixed commitments first, then focus sessions in your sharpest time. */
export function buildDay(a: Answers): Block[] {
  const dayStart = a.wake * 60;
  const dayEnd = a.sleep * 60;
  const anchors: Block[] = [];
  const free = (r: Span2) => r[0] >= dayStart && r[1] <= dayEnd && !anchors.some((b) => overlaps(r, [b.start, b.end]));
  const anchor = (s: number, e: number, label: string, kind: Block["kind"]) => { if (free([s, e])) anchors.push({ start: s, end: e, label, kind }); };

  for (const f of fixedRanges(a, dayStart, dayEnd)) anchors.push({ start: f.range[0], end: f.range[1], label: f.label, kind: "focus" });
  anchor(dayStart, dayStart + 30, "Morning routine", "routine");
  anchor(dayEnd - 30, dayEnd, "Wind down", "routine");
  anchor(720, 780, "Lunch", "meal");
  anchor(1080, 1140, "Dinner", "meal");
  if (a.whose === "kids" && a.kidAge === "little") anchor(780, 840, "Nap / quiet time", "break");
  anchors.sort((x, y) => x.start - y.start);

  // Free gaps between anchors.
  const gaps: Span2[] = [];
  let t = dayStart;
  for (const b of anchors) { if (b.start > t) gaps.push([t, b.start]); t = Math.max(t, b.end); }
  if (dayEnd > t) gaps.push([t, dayEnd]);

  // Fill the sharpest part of the day first.
  const peakRange: Record<Peak, Span2> = { morning: [0, 720], afternoon: [720, 1020], evening: [1020, 1440] };
  const pr = peakRange[a.peak];
  const score = (g: Span2) => Math.max(0, Math.min(g[1], pr[1]) - Math.max(g[0], pr[0]));
  const ordered = [...gaps].sort((x, y) => score(y) - score(x) || x[0] - y[0]);

  const { focus, rest } = PACE_TIMES[a.pace];
  const plate = a.plate.length ? a.plate : DEFAULT_ANSWERS.plate;
  const queue: { label: string; kind: Block["kind"]; len: number; rest: boolean }[] = [];
  for (let round = 0; round < 2; round++) for (const p of plate) queue.push({ label: PLATE_LABELS[p], kind: "focus", len: focus, rest: true });
  const more = MORE_BLOCK[a.more];
  queue.splice(Math.min(plate.length, queue.length), 0, { ...more, len: 45, rest: false });

  const placed: Block[] = [];
  for (const g of ordered) {
    let c = g[0];
    while (queue.length && c + queue[0]!.len <= g[1]) {
      const q = queue.shift()!;
      placed.push({ start: c, end: c + q.len, label: q.label, kind: q.kind });
      c += q.len;
      if (q.rest && c + rest <= g[1]) { placed.push({ start: c, end: c + rest, label: "Break", kind: "break" }); c += rest; }
    }
    if (g[1] - c >= 15) placed.push({ start: c, end: g[1], label: "Free time", kind: "break" });
    else if (g[1] > c && placed.length && placed.at(-1)!.end === c) placed.at(-1)!.end = g[1];
  }
  return [...anchors, ...placed].sort((x, y) => x.start - y.start);
}

/** Lighter weekend day: starts 1 hour later, no work activities. */
export function buildWeekendDay(a: Answers, day: "Sat" | "Sun"): Block[] {
  const blocks: Block[] = [];
  let t = (a.wake + 1) * 60;
  const has = (p: Plate) => a.plate.includes(p);
  const push = (len: number, label: string, kind: Block["kind"]) => { blocks.push({ start: t, end: t + len, label, kind }); t += len; };
  push(60, "Slow morning", "routine");
  if (has("selfcare")) push(45, day === "Sat" ? "Self-care" : "Journaling", "routine");
  if (day === "Sat") push(60, "Errands", "focus");
  push(60, "Movement / outdoors", "focus");
  push(60, "Lunch", "meal");
  if (has("school") && day === "Sun") push(60, "Light study / review", "focus");
  if (has("family") && day === "Sat") push(120, "Family outing", "focus");
  else push(120, "Family / friends time", "focus");
  push(60, "Hobby time", "focus");
  if (has("selfcare") && day === "Sun") push(45, "Self-care", "routine");
  push(60, "Rest", "break");
  if (day === "Sun") push(30, "Plan next week", "routine");
  return blocks.filter((b) => b.end <= 1440);
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
