import { describe, expect, it } from "vitest";

import { EMAIL_PATTERN } from "../validation";

describe("EMAIL_PATTERN", () => {
  it("matches plausible email addresses", () => {
    expect(EMAIL_PATTERN.test("staff@example.com")).toBe(true);
    expect(EMAIL_PATTERN.test("first.last+tag@clinic.example.org")).toBe(true);
  });

  it("rejects values without a user, domain, or top-level domain", () => {
    expect(EMAIL_PATTERN.test("not-an-email")).toBe(false);
    expect(EMAIL_PATTERN.test("@example.com")).toBe(false);
    expect(EMAIL_PATTERN.test("staff@example")).toBe(false);
    expect(EMAIL_PATTERN.test("staff name@example.com")).toBe(false);
  });
});
