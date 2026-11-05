import { describe, expect, it } from "vitest";
import { buildDay, DEFAULT_ANSWERS, type Answers } from "./schedule";

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
    for (const x of ["Workout", "Chores", "Social time", "Hobby time"]) expect(l).toContain(x);
  });
  it("puts focus time in your sharpest part of the day", () => {
    const first = (peak: Answers["peak"]) => buildDay(a({ peak, plate: ["side"] })).find((b) => b.label === "Side project")!.start;
    expect(first("morning")).toBeLessThan(720);
    expect(first("evening")).toBeGreaterThanOrEqual(1020);
  });
});
