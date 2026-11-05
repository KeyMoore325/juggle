import { describe, expect, it } from "vitest";
import { QUESTION_COUNT, isStepValid, questionNumber, togglePlate, visibleSteps } from "./quiz-flow";

describe("quiz flow", () => {
  it("has 7 questions", () => expect(QUESTION_COUNT).toBe(7));
  it("asks 'How old?' only when the schedule is for kids", () => {
    expect(visibleSteps({ whose: "kids" })).toContain("kidAge");
    expect(visibleSteps({ whose: "me" })).not.toContain("kidAge");
    expect(questionNumber("kidAge")).toBe(1);
  });
  it("lets you pick at most 3 things on your plate", () => {
    let p = togglePlate(undefined, "work");
    p = togglePlate(p, "school"); p = togglePlate(p, "fitness"); p = togglePlate(p, "social");
    expect(p).toEqual(["work", "school", "fitness"]);
    expect(togglePlate(p, "work")).toEqual(["school", "fitness"]);
    expect(isStepValid("plate", { plate: [] })).toBe(false);
  });
  it("needs both wake-up and lights-out", () => {
    expect(isStepValid("day", { wake: 7 })).toBe(false);
    expect(isStepValid("day", { wake: 7, sleep: 23 })).toBe(true);
  });
  it("needs shift times for shift work", () => {
    expect(isStepValid("fixed", { fixed: "shift" })).toBe(false);
    expect(isStepValid("fixed", { fixed: "shift", shiftStart: 420, shiftEnd: 900 })).toBe(true);
  });
});
