import { describe, expect, it } from "vitest";
import { privateHeadMarkup, privatePageHead } from "./private-page-head";
import { ogImageUrl } from "./og-pages";

describe("Safe private-page share metadata", () => {
  it.each(["/dashboard", "/profile", "/schedules/sample-plan"])("provides only public metadata for %s", (path) => {
    expect(privatePageHead(path)).not.toBeNull();
  });
  it.each(["/", "/quiz", "/api/public/og/home.png", "/schedules", "/schedules/id/other"])("does not intercept %s", (path) => {
    expect(privatePageHead(path)).toBeNull();
  });
  it("keeps the private ID out of the image URL", () => {
    const head = privatePageHead("/schedules/private-id");
    expect(head?.meta.find((tag) => tag.property === "og:image")?.content).toBe(ogImageUrl("schedule"));
  });
  it("escapes URL attributes in server-rendered metadata", () => {
    const markup = privateHeadMarkup('/schedules/a"<b>&');
    expect(markup).toContain('/schedules/a&quot;&lt;b&gt;&amp;');
    expect(markup).not.toContain('<b>');
  });
});