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
  it("models organizations as the single-clinic deployment profile with stable lookup fields", () => {
    const schema = readFileSync(schemaPath, "utf8");

    expect(schema).toContain("enum OrganizationStatus");
    expect(schema).toContain("model Organization");
    expect(schema).toMatch(/slug\s+String\s+@unique/);
    expect(schema).toMatch(/timezone\s+String\s+@default\("Europe\/Sofia"\)/);
    expect(schema).toMatch(/defaultCurrency\s+String\s+@default\("BGN"\)/);
    expect(schema).toMatch(/status\s+OrganizationStatus\s+@default\(active\)/);
    expect(schema).toContain("@@index([status])");
  });

  it("keeps Google account identity out of the organization tenant model", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const organizationModel = schema.match(/model Organization \{[\s\S]*?\n\}/)?.[0];

    expect(organizationModel).toBeDefined();
    expect(organizationModel).not.toMatch(/google/i);
    expect(organizationModel).not.toMatch(/calendar/i);
    expect(organizationModel).not.toMatch(/provider/i);
  });
});

describe("Prisma schema organization membership model", () => {
  it("models clinic-side membership roles and statuses", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const memberRoleEnum = schema.match(/enum OrganizationMemberRole \{[\s\S]*?\n\}/)?.[0];

    expect(schema).toContain("enum OrganizationMemberRole");
    expect(memberRoleEnum).toBeDefined();
    expect(memberRoleEnum).toContain("admin");
    expect(memberRoleEnum).toContain("receptionist");
    expect(memberRoleEnum).toContain("doctor");
    expect(memberRoleEnum).not.toContain("owner");
    expect(memberRoleEnum).not.toContain("manager");
    expect(memberRoleEnum).not.toContain("patient");

    expect(schema).toContain("enum OrganizationMemberStatus");
    expect(schema).toContain("invited");
    expect(schema).toContain("active");
    expect(schema).toContain("disabled");
    expect(schema).toContain("removed");
  });

  it("links one local user to at most one clinic-side membership in this deployment", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const memberModel = schema.match(/model OrganizationMember \{[\s\S]*?\n\}/)?.[0];

    expect(memberModel).toBeDefined();
    expect(memberModel).toMatch(/organizationId\s+String/);
    expect(memberModel).toMatch(/userId\s+String\?/);
    expect(memberModel).toMatch(/invitedEmail\s+String\?/);
    expect(memberModel).toMatch(/role\s+OrganizationMemberRole/);
    expect(memberModel).toMatch(/status\s+OrganizationMemberStatus\s+@default\(invited\)/);
    expect(memberModel).toContain("@@unique([userId])");
    expect(memberModel).not.toContain("@@unique([organizationId, userId])");
  });

  it("keeps membership tied to the local clinic profile and optional local user", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const memberModel = schema.match(/model OrganizationMember \{[\s\S]*?\n\}/)?.[0];

    expect(memberModel).toBeDefined();
    expect(memberModel).toMatch(
      /organization\s+Organization\s+@relation\(fields: \[organizationId\], references: \[id\], onDelete: Cascade\)/,
    );
    expect(memberModel).toMatch(
      /user\s+User\?\s+@relation\(fields: \[userId\], references: \[id\], onDelete: SetNull\)/,
    );
    expect(schema).toMatch(/organizationMember\s+OrganizationMember\?/);
    expect(schema).toMatch(/members\s+OrganizationMember\[\]/);
  });

  it("indexes membership checks and clinic staff lists", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const memberModel = schema.match(/model OrganizationMember \{[\s\S]*?\n\}/)?.[0];

    expect(memberModel).toBeDefined();
    expect(memberModel).toContain("@@index([organizationId, userId])");
    expect(memberModel).toContain("@@index([organizationId, status])");
    expect(memberModel).toContain("@@index([organizationId, role])");
  });
});

describe("Prisma schema patient profile model", () => {
  it("models a minimal patient-owned contact profile", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const patientProfileModel = schema.match(/model PatientProfile \{[\s\S]*?\n\}/)?.[0];

    expect(patientProfileModel).toBeDefined();
    expect(patientProfileModel).toMatch(/userId\s+String\s+@unique/);
    expect(patientProfileModel).toMatch(/email\s+String/);
    expect(patientProfileModel).toMatch(/name\s+String\?/);
    expect(patientProfileModel).toMatch(/phone\s+String\?/);
    expect(patientProfileModel).toMatch(
      /user\s+User\s+@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/,
    );
    expect(patientProfileModel).toContain("@@index([email])");
    expect(patientProfileModel).toContain("@@index([phone])");
    expect(schema).toMatch(/patientProfile\s+PatientProfile\?/);
  });

  it("keeps patients separate from clinic-side membership roles", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const memberRoleEnum = schema.match(/enum OrganizationMemberRole \{[\s\S]*?\n\}/)?.[0];

    expect(memberRoleEnum).toBeDefined();
    expect(memberRoleEnum).not.toContain("patient");
    expect(schema).toContain("model PatientProfile");
  });

  it("does not add medical-record fields to patient profiles", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const patientProfileModel = schema.match(/model PatientProfile \{[\s\S]*?\n\}/)?.[0];

    expect(patientProfileModel).toBeDefined();
    expect(patientProfileModel).not.toMatch(/symptom/i);
    expect(patientProfileModel).not.toMatch(/diagnos/i);
    expect(patientProfileModel).not.toMatch(/prescription/i);
    expect(patientProfileModel).not.toMatch(/treatment/i);
    expect(patientProfileModel).not.toMatch(/medical/i);
    expect(patientProfileModel).not.toMatch(/insurance/i);
    expect(patientProfileModel).not.toMatch(/document/i);
  });
});

describe("Prisma schema audit event model", () => {
  it("models clinic-owned audit events for identity, membership, and role changes", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const auditEventModel = schema.match(/model AuditEvent \{[\s\S]*?\n\}/)?.[0];

    expect(auditEventModel).toBeDefined();
    expect(auditEventModel).toMatch(/organizationId\s+String/);
    expect(auditEventModel).toMatch(/actorUserId\s+String\?/);
    expect(auditEventModel).toMatch(/action\s+String/);
    expect(auditEventModel).toMatch(/targetType\s+String/);
    expect(auditEventModel).toMatch(/targetId\s+String\?/);
    expect(auditEventModel).toMatch(/metadata\s+Json\?/);
    expect(auditEventModel).toMatch(/createdAt\s+DateTime\s+@default\(now\(\)\)/);
  });

  it("ties audit events to the local clinic and optional actor user", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const auditEventModel = schema.match(/model AuditEvent \{[\s\S]*?\n\}/)?.[0];

    expect(auditEventModel).toBeDefined();
    expect(auditEventModel).toMatch(
      /organization\s+Organization\s+@relation\(fields: \[organizationId\], references: \[id\], onDelete: Cascade\)/,
    );
    expect(auditEventModel).toMatch(
      /actorUser\s+User\?\s+@relation\("AuditEventActor", fields: \[actorUserId\], references: \[id\], onDelete: SetNull\)/,
    );
    expect(schema).toMatch(/auditEvents\s+AuditEvent\[\]/);
    expect(schema).toMatch(/auditEvents\s+AuditEvent\[\]\s+@relation\("AuditEventActor"\)/);
  });

  it("indexes audit events for clinic timelines and target lookup", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const auditEventModel = schema.match(/model AuditEvent \{[\s\S]*?\n\}/)?.[0];

    expect(auditEventModel).toBeDefined();
    expect(auditEventModel).toContain("@@index([organizationId, createdAt])");
    expect(auditEventModel).toContain("@@index([actorUserId])");
    expect(auditEventModel).toContain("@@index([action])");
    expect(auditEventModel).toContain("@@index([targetType, targetId])");
  });
});

describe("Prisma schema cleanup", () => {
  it("does not keep temporary starter setup models in the live schema", () => {
    const schema = readFileSync(schemaPath, "utf8");
    const removedModelNames = ["Starter" + "Clinic", "Starter" + "Note"];

    for (const modelName of removedModelNames) {
      expect(schema).not.toContain(`model ${modelName}`);
    }
  });
});
