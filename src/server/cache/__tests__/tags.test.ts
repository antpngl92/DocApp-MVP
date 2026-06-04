import { describe, expect, it } from "vitest";

import { CACHE_TAGS, createScopedCacheTag } from "../tags";

describe("cache tags", () => {
  it("creates organization-scoped cache tags", () => {
    expect(createScopedCacheTag(CACHE_TAGS.appointments, "clinic-1")).toBe("appointments:clinic-1");
  });
});
