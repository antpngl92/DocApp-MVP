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

describe("Prisma schema organization model", () => {
  it("models organizations as local clinic tenants with stable lookup fields", () => {
    const schema = readFileSync(schemaPath, "utf8");

    expect(schema).toContain("enum OrganizationStatus");
    expect(schema).toContain("model Organization");
    expect(schema).toMatch(/slug\s+String\s+@unique/);
    expect(schema).toMatch(/timezone\s+String\s+@default\("Europe\/Sofia"\)/);
    expect(schema).toMatch(/defaultCurrency\s+String\s+@default\("BGN"\)/);
    expect(schema).toMatch(/status\s+OrganizationStatus\s+@default\(active\)/);
    expect(schema).toContain("@@index([status])");
  });
});
