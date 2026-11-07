import { describe, expect, it } from "vitest";
import { buildDay, buildWeekendDay, DEFAULT_ANSWERS, type Answers } from "./schedule";

const a = (p: Partial<Answers>): Answers => ({ ...DEFAULT_ANSWERS, ...p });
const labels = (p: Partial<Answers>) => buildDay(a(p)).map((b) => b.label);

describe("buildDay", () => {
  it("runs from wake-up to lights out", () => {
    const d = buildDay(a({ wake: 6, sleep: 22 }));
    expect(d[0]?.start).toBe(360);
    expect(d.at(-1)?.end).toBe(1320);
  });
  it("supports midnight lights out", () => {
    expect(buildDay(a({ sleep: 24 })).at(-1)?.end).toBe(1440);
  });
  it("never overlaps blocks", () => {
    for (const fixed of ["school", "work", "flexible"] as const) {
      const d = buildDay(a({ fixed, plate: ["work", "fitness", "side"], pace: "sprints" }));
      for (let i = 1; i < d.length; i++) expect(d[i]!.start).toBeGreaterThanOrEqual(d[i - 1]!.end);
    }
  });
  it("blocks school hours 8 AM–3 PM and work 9–5", () => {
    expect(buildDay(a({ fixed: "school" })).find((b) => b.label === "School")).toMatchObject({ start: 480, end: 900 });
    expect(buildDay(a({ fixed: "work" })).find((b) => b.label === "Work")).toMatchObject({ start: 540, end: 1020 });
  });
  it("uses the chosen shift times", () => {
    expect(buildDay(a({ fixed: "shift", shiftStart: 600, shiftEnd: 960 })).find((b) => b.label === "Shift")).toMatchObject({ start: 600, end: 960 });
  });
  it("uses the focus rhythm: sprints 25/5, steady 50/10, deep 90/20", () => {
    for (const [pace, len] of [["sprints", 25], ["steady", 50], ["deep", 90]] as const) {
      const f = buildDay(a({ pace, plate: ["side"] })).find((b) => b.label === "Side project");
      expect(f!.end - f!.start).toBe(len);
    }
  });
  it("includes everything on your plate and what you want more time for", () => {
    const l = labels({ plate: ["fitness", "home", "social"], more: "hobbies" });
    for (const x of ["Workout", "Chores", "Social time", "💜 Hobby time"]) expect(l).toContain(x);
  });
  it("puts focus time in your sharpest part of the day", () => {
    const first = (peak: Answers["peak"]) => buildDay(a({ peak, plate: ["side"] })).find((b) => b.label === "Side project")!.start;
    expect(first("morning")).toBeLessThan(720);
    expect(first("evening")).toBeGreaterThanOrEqual(1020);
  });
});

describe("schedule rules (new quiz)", () => {
  const find = (d: ReturnType<typeof buildDay>, l: string) => d.find((b) => b.label === l);
  it("locks fixed commitments", () => {
    expect(find(buildDay(a({ fixed: "work" })), "Work")?.locked).toBe(true);
  });
  it("30-min wake-up routine at wake time and 45-min wind-down before lights out", () => {
    const d = buildDay(a({ wake: 6, sleep: 22 }));
    expect(find(d, "Wake-up routine")).toMatchObject({ start: 360, end: 390 });
    expect(find(d, "Wind-down routine")).toMatchObject({ start: 1275, end: 1320 });
  });
  it("places breakfast, lunch and dinner around fixed blocks", () => {
    const d = buildDay(a({ fixed: "work" }));
    for (const m of ["Breakfast", "Dinner"]) expect(find(d, m)).toBeDefined();
    const dinner = find(d, "Dinner")!;
    expect(dinner.start).toBeGreaterThanOrEqual(1020);
  });
  it("one protected 💜 block for what you want more time for", () => {
    const d = buildDay(a({ more: "movement" }));
    expect(d.filter((b) => b.label === "💜 Movement time")).toHaveLength(1);
  });
  it("adds 10-min transitions and turns leftovers into Flex / catch-up", () => {
    const d = buildDay(a({}));
    expect(d.some((b) => b.label === "Transition" && b.end - b.start === 10)).toBe(true);
    expect(d.some((b) => b.label === "Flex / catch-up")).toBe(true);
    expect(d.some((b) => b.label === "Free time")).toBe(false);
  });
  it("covers wake → lights out with no gaps", () => {
    const d = buildDay(a({ fixed: "school", plate: ["side", "home"] }));
    for (let i = 1; i < d.length; i++) expect(d[i]!.start).toBe(d[i - 1]!.end);
  });
  it("weekends: no work/school, start 1 hour later, Sunday ends with Plan next week", () => {
    const sat = buildWeekendDay(a({ fixed: "work", wake: 7, plate: ["family", "home"] }), "Sat");
    const sun = buildWeekendDay(a({ fixed: "school", wake: 7 }), "Sun");
    expect(sat[0]!.start).toBe(480);
    for (const day of [sat, sun]) expect(day.some((b) => /^(Work|School|Deep work)$/.test(b.label))).toBe(false);
    expect(sat.map((b) => b.label)).toContain("Family outing");
    expect(sat.map((b) => b.label)).toContain("Errands");
    expect(sun.at(-1)!.label).toBe("Plan next week");
  });
  it("little ones get routine sections", () => {
    const d = buildDay(a({ whose: "kids", kidAge: "little", sleep: 21 }));
    expect(d.every((b) => b.section)).toBe(true);
    expect(new Set(d.map((b) => b.section))).toEqual(new Set(["Morning", "Play", "Rest", "Bedtime"]));
  });
  it("school age and teens get homework and screen time", () => {
    for (const kidAge of ["school", "teen"] as const) {
      const l = labels({ whose: "kids", kidAge, fixed: "school" });
      expect(l).toContain("📚 Homework");
      expect(l).toContain("📱 Screen time");
    }
  });
});
