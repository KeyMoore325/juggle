import { describe, expect, it } from "vitest";
import { getPersonality } from "./personality";
import type { Answers } from "./schedule";

const base: Answers = { whose: "me", focus: "work", span: "daily", start: 8, priorities: 3, pace: "sprints" };
const name = (p: Partial<Answers>) => getPersonality({ ...base, ...p }).name;

describe("getPersonality", () => {
  it("6 AM + sprints is Early Bird", () => {
    expect(name({ start: 6 })).toBe("Early Bird Daily");
    expect(name({ start: 6, span: "weekly" })).toBe("Early Bird Weekly");
  });
  it("10 AM + deep is Night Owl", () => {
    expect(name({ start: 10, pace: "deep", span: "weekly" })).toBe("Night Owl Weekly");
    expect(name({ start: 10, pace: "deep" })).toBe("Night Owl Daily");
  });
  it("family focus or family/kids schedule is Family Week", () => {
    expect(name({ focus: "family" })).toBe("Family Week");
    expect(name({ whose: "kids", pace: "deep" })).toBe("Family Week");
    expect(name({ whose: "family" })).toBe("Family Week");
  });
  it("other deep dives are Deep Work Sprint", () => {
    expect(name({ pace: "deep" })).toBe("Deep Work Sprint");
    expect(name({ pace: "deep", start: 6 })).toBe("Deep Work Sprint");
  });
  it("everything else is Balanced Blend", () => {
    expect(name({})).toBe("Balanced Blend");
    expect(name({ start: 10, whose: "spouse" })).toBe("Balanced Blend");
  });
});
