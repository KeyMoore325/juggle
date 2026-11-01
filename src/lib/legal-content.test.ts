import { describe, expect, it } from "vitest";
import { legalContactEmail } from "./legal-content";

describe("Legal contact", () => {
  it("uses the owner-provided public contact address", () => {
    expect(legalContactEmail).toBe("info@juggle.com");
  });
});