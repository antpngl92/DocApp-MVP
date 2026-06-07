import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const schemaPath = join(process.cwd(), "prisma", "schema.prisma");

describe("Prisma schema identity model", () => {
  it("models a local user with a unique Clerk user mapping", () => {
    const schema = readFileSync(schemaPath, "utf8");

    expect(schema).toContain("model User");
    expect(schema).toMatch(/clerkUserId\s+String\s+@unique/);
    expect(schema).toContain("@@index([email])");
  });
});
