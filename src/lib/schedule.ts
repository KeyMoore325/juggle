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

/** Little-ones routine sections shown instead of exact times. */
export type Section = "Morning" | "Play" | "Rest" | "Bedtime";

/** Times are minutes after midnight (0–1440). */
export interface Block {
  start: number;
  end: number;
  label: string;
  kind: "focus" | "break" | "meal" | "routine";
  /** Fixed commitment from the quiz (school, work, shift). */
  locked?: boolean;
  section?: Section;
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

/** The protected daily block for "What do you want more time for?". */
export const MORE_LABELS: Record<More, string> = {
  rest: "💜 Rest time", movement: "💜 Movement time", hobbies: "💜 Hobby time",
  people: "💜 People time", learning: "💜 Learning time", organized: "💜 Planning time",
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

/** Collects non-overlapping blocks inside one waking day and finds free slots. */
class DayPlan {
  blocks: Block[] = [];
  constructor(readonly start: number, readonly end: number) {}
  isFree(s: number, e: number) {
    return s >= this.start && e <= this.end && e > s && !this.blocks.some((b) => overlaps([s, e], [b.start, b.end]));
  }
  add(s: number, e: number, label: string, kind: Block["kind"], extra: Partial<Block> = {}) {
    if (!this.isFree(s, e)) return false;
    this.blocks.push({ start: s, end: e, label, kind, ...extra });
    return true;
  }
  /** Free start time for `len` minutes within [lo, hi], closest to `prefer`. */
  find(len: number, lo: number, hi: number, prefer = lo): number | null {
    let best: number | null = null;
    for (let t = Math.max(lo, this.start); t + len <= Math.min(hi, this.end); t += 5) {
      if (this.isFree(t, t + len) && (best === null || Math.abs(t - prefer) < Math.abs(best - prefer))) best = t;
    }
    return best;
  }
  place(len: number, lo: number, hi: number, prefer: number, label: string, kind: Block["kind"], extra: Partial<Block> = {}) {
    const t = this.find(len, lo, hi, prefer);
    if (t === null) return false;
    return this.add(t, t + len, label, kind, extra);
  }
  /** Gaps get a 10-minute transition where they fit; the rest becomes flex time. */
  fill(opts: { transitions: boolean; flex: string; section?: (t: number) => Section | undefined }) {
    const sorted = [...this.blocks].sort((x, y) => x.start - y.start);
    const out: Block[] = [];
    let t = this.start;
    const extra = (s: number) => { const sec = opts.section ? out.at(-1)?.section ?? opts.section(s) : undefined; return sec ? { section: sec } : {}; };
    for (const b of [...sorted, null]) {
      const gapEnd = b ? b.start : this.end;
      let g = gapEnd - t;
      if (g > 0) {
        const prev = out.at(-1);
        if (g < 10 || (!opts.transitions && g < 15)) {
          if (prev && !prev.locked) prev.end = gapEnd; else if (b && !b.locked) b.start = t; else out.push({ start: t, end: gapEnd, label: "Transition", kind: "break", ...extra(t) });
        } else {
          let c = t;
          if (opts.transitions && prev) {
            const len = g < 25 ? g : 10;
            out.push({ start: c, end: c + len, label: "Transition", kind: "break", ...extra(c) });
            c += len; g -= len;
          }
          if (gapEnd > c) out.push({ start: c, end: gapEnd, label: opts.flex, kind: "break", ...extra(c) });
        }
      }
      if (b) { out.push(b); t = Math.max(t, b.end); }
    }
    return out;
  }
}

const isLittle = (a: Answers) => a.whose === "kids" && a.kidAge === "little";
const isOlderKid = (a: Answers) => a.whose === "kids" && (a.kidAge === "school" || a.kidAge === "teen");
const PEAK_WINDOW: Record<Peak, Span2> = { morning: [0, 720], afternoon: [720, 1020], evening: [1020, 1440] };

/**
 * Weekday order: fixed commitments (locked) → wake-up & wind-down routines → meals →
 * kids' homework/screen time → 💜 protected block → focus sessions in the sharpest window → buffers & flex.
 */
export function buildDay(a: Answers): Block[] {
  if (isLittle(a)) return buildLittleDay(a, false);
  const plan = new DayPlan(a.wake * 60, a.sleep * 60);
  const { start, end } = plan;

  for (const f of fixedRanges(a, start, end)) plan.add(f.range[0], f.range[1], f.label, "focus", { locked: true });

  plan.add(start, start + 30, "Wake-up routine", "routine") || plan.place(30, start, start + 120, start, "Wake-up routine", "routine");
  plan.add(end - 45, end, "Wind-down routine", "routine");

  plan.place(30, start + 30, start + 180, start + 30, "Breakfast", "meal");
  plan.place(30, 690, 840, 720, "Lunch", "meal");
  plan.place(45, 1050, 1230, 1110, "Dinner", "meal");

  const teen = a.kidAge === "teen";
  if (isOlderKid(a)) {
    plan.place(teen ? 60 : 45, 900, end, 930, "📚 Homework", "focus");
    plan.place(teen ? 60 : 30, 900, end - 45, 1170, "📱 Screen time", "break");
  }

  plan.place(45, start, end, a.more === "movement" && a.peak !== "morning" ? start + 60 : 1020, MORE_LABELS[a.more], "focus");

  const { focus, rest } = PACE_TIMES[a.pace];
  const plate = (a.plate.length ? a.plate : DEFAULT_ANSWERS.plate).filter((p) => !(isOlderKid(a) && p === "school"));
  const rounds = plate.length === 1 ? 3 : 2;
  const [peakLo, peakHi] = PEAK_WINDOW[a.peak];
  for (let r = 0; r < rounds; r++) {
    for (const p of plate) {
      const t = plan.find(focus + rest, peakLo, peakHi, peakLo) ?? plan.find(focus + rest, start, end, peakLo) ?? plan.find(focus, start, end, peakLo);
      if (t === null) continue;
      plan.add(t, t + focus, PLATE_LABELS[p], "focus");
      plan.add(t + focus, t + focus + rest, "Break", "break");
    }
  }
  return plan.fill({ transitions: true, flex: "Flex / catch-up" });
}

/** Lighter weekend: no work or school, starts 1 hour later, activities from what's on your plate. */
export function buildWeekendDay(a: Answers, day: "Sat" | "Sun"): Block[] {
  if (isLittle(a)) return buildLittleDay(a, true);
  const end = a.sleep * 60;
  const plan = new DayPlan(Math.min((a.wake + 1) * 60, end - 240), end);
  const { start } = plan;
  const has = (p: Plate) => a.plate.includes(p);

  plan.add(start, start + 60, "Slow morning", "routine");
  if (day === "Sun") { plan.add(end - 30, end, "Plan next week", "routine"); plan.add(end - 75, end - 30, "Wind-down routine", "routine"); }
  else plan.add(end - 45, end, "Wind-down routine", "routine");
  plan.place(45, 690, 840, 720, "Lunch", "meal");
  plan.place(60, 1050, 1230, 1110, "Dinner", "meal");
  plan.place(45, start, end, 1020, MORE_LABELS[a.more], "focus");

  const acts: [number, string, Block["kind"]][] = [];
  if (day === "Sat") acts.push([60, "Errands", "focus"]);
  acts.push([60, has("fitness") ? "Workout / outdoors" : "Movement / outdoors", "focus"]);
  if (day === "Sun" && has("school")) acts.push([60, "Light study / review", "focus"]);
  if (day === "Sun" && has("home")) acts.push([45, "Home reset", "focus"]);
  acts.push([120, has("family") || a.whose === "family" || a.whose === "kids" ? (day === "Sat" ? "Family outing" : "Family time") : has("social") ? "Friends time" : "Family / friends time", "focus"]);
  acts.push([60, has("side") ? "Side project (just for fun)" : "Hobby time", "focus"]);
  if (has("selfcare")) acts.push([45, day === "Sat" ? "Self-care" : "Journaling", "routine"]);
  if (isOlderKid(a)) acts.push([60, "📱 Screen time", "break"]);
  acts.push([60, "Rest", "break"]);

  let cursor = start + 60;
  for (const [len, label, kind] of acts) {
    const t = plan.find(len, cursor, end, cursor) ?? plan.find(len, start, end, cursor);
    if (t === null) continue;
    plan.add(t, t + len, label, kind);
    cursor = t + len;
  }
  return plan.fill({ transitions: true, flex: "Flex / catch-up" });
}

/** Little ones (3–5): gentle routine grouped into Morning / Play / Rest / Bedtime sections. */
function buildLittleDay(a: Answers, weekend: boolean): Block[] {
  const end = a.sleep * 60;
  const plan = new DayPlan(Math.min(a.wake * 60 + (weekend ? 60 : 0), end - 240), end);
  const { start } = plan;
  const sectionAt = (t: number): Section => t < 660 ? "Morning" : t < 720 ? "Play" : t < 900 ? "Rest" : "Play";

  if (!weekend) for (const f of fixedRanges(a, start, end)) plan.add(f.range[0], f.range[1], f.label, "focus", { locked: true, section: "Play" });

  let t = start;
  for (const [len, label, kind] of [[15, "Wake up & cuddle", "routine"], [15, "Get dressed", "routine"], [30, "Breakfast", "meal"], [15, "Brush teeth", "routine"]] as const) {
    if (plan.add(t, t + len, label, kind, { section: "Morning" })) t += len;
  }
  plan.place(30, 660, 780, 690, "Lunch", "meal", { section: "Rest" });
  plan.place(60, 720, 960, 780, "Nap / quiet time", "break", { section: "Rest" });
  plan.place(30, 1020, end - 60, 1050, "Dinner", "meal", { section: "Bedtime" });
  let b = end;
  for (const [len, label] of [[15, "Story & lights out"], [15, "Pajamas & teeth"], [20, "Bath time"]] as const) {
    if (plan.add(b - len, b, label, "routine", { section: "Bedtime" })) b -= len;
  }
  plan.place(45, start, end, 600, "Outdoor play", "focus", { section: "Play" });
  plan.place(15, start, end, 930, "Snack", "meal", { section: "Play" });
  plan.place(30, start, end, 960, MORE_LABELS[a.more], "focus", { section: "Play" });
  plan.place(30, start, end, 990, "Creative play", "focus", { section: "Play" });
  return plan.fill({ transitions: false, flex: "Free play", section: sectionAt });
}

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
