import { describe, expect, it } from "vitest";
import { ACCEPT_ALL, REJECT_ALL, canLoadAnalytics, makeConsent, parseConsent } from "./cookie-consent";

describe("cookie consent", () => {
  it("no stored choice means no analytics and the banner shows", () => {
    expect(parseConsent(null)).toBeNull();
    expect(canLoadAnalytics(null)).toBe(false);
  });
  it("reject non-essential blocks analytics", () => {
    expect(canLoadAnalytics(makeConsent(REJECT_ALL))).toBe(false);
  });
  it("accept all allows analytics", () => {
    expect(canLoadAnalytics(makeConsent(ACCEPT_ALL))).toBe(true);
  });
  it("round-trips through storage and essential is always on", () => {
    const c = parseConsent(JSON.stringify(makeConsent({ analytics: false, preferences: true })));
    expect(c).toMatchObject({ essential: true, analytics: false, preferences: true });
  });
  it("ignores corrupt storage", () => {
    expect(parseConsent("{bad")).toBeNull();
  });
});
