import { describe, expect, it } from "vitest";
import { buildDay } from "./schedule";

describe("buildDay", () => {
  it("starts the day at the chosen start time", () => {
    const d = buildDay({ focus: "work", span: "daily", start: 8, priorities: 3, pace: "deep" });
    expect(d[0]?.start).toBe("8:00 AM");
  });
  it("creates one focus block per priority plus a flex block", () => {
    const d = buildDay({ focus: "school", span: "daily", start: 6, priorities: 4, pace: "sprints" });
    expect(d.filter((b) => b.kind === "focus").length).toBe(5);
  });
});
