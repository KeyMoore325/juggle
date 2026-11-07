import { describe, expect, it } from "vitest";
import { OG_PAGES, SITE_URL, ogImageUrl, resolveOgPage, type OgPage } from "./og-pages";

describe("Public share-image routing", () => {
  it.each(Object.keys(OG_PAGES) as OgPage[])("gives %s its own stable image", (page) => {
    const url = new URL(ogImageUrl(page));
    expect(url.origin).toBe(SITE_URL);
    expect(url.pathname).toBe(`/api/public/og/${page}.png`);
    expect(resolveOgPage(`${page}.png`)).toBe(page);
  });

  it.each(["__proto__", "constructor", "../../profile", "unknown", "home.png.png", "schedule/private-name"])("rejects non-allowlisted input %s", (value) => {
    expect(resolveOgPage(value)).toBeNull();
  });

  it("uses one generic saved-schedule image rather than exposing an account or schedule identifier", () => {
    expect(ogImageUrl("schedule")).toBe(`${SITE_URL}/api/public/og/schedule.png?v=1`);
  });
});