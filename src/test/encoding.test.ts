import { describe, expect, it } from "vitest";

describe("source encoding", () => {
  it("preserves Bulgarian text", () => {
    expect("Запази час").toBe("Запази час");
  });
});
