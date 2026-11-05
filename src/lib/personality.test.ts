import { describe, expect, it } from "vitest";
import { getPersonality } from "./personality";
import type { Answers } from "./schedule";

const base: Answers = { whose: "me", plate: ["work"], fixed: "flexible", wake: 8, sleep: 23, peak: "morning", pace: "sprints", more: "rest", span: "daily" };
const name = (p: Partial<Answers>) => getPersonality({ ...base, ...p }).name;

describe("getPersonality", () => {
  it("6 AM + sprints is Early Bird", () => {
    expect(name({ wake: 6 })).toBe("Early Bird Daily");
    expect(name({ wake: 6, span: "weekly" })).toBe("Early Bird Weekly");
  });
  it("10 AM + deep is Night Owl", () => {
    expect(name({ wake: 9, pace: "deep", span: "weekly" })).toBe("Night Owl Weekly");
    expect(name({ wake: 9, pace: "deep" })).toBe("Night Owl Daily");
  });
  it("family focus or family/kids schedule is Family Week", () => {
    expect(name({ plate: ["family"] })).toBe("Family Week");
    expect(name({ whose: "kids", pace: "deep" })).toBe("Family Week");
    expect(name({ whose: "family" })).toBe("Family Week");
  });
  it("other deep dives are Deep Work Sprint", () => {
    expect(name({ pace: "deep" })).toBe("Deep Work Sprint");
    expect(name({ pace: "deep", wake: 6 })).toBe("Deep Work Sprint");
  });
  it("everything else is Balanced Blend", () => {
    expect(name({})).toBe("Balanced Blend");
    expect(name({ wake: 9, whose: "partner" })).toBe("Balanced Blend");
  });
});
