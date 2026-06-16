import { describe, expect, it, vi } from "vitest";

import {
  mapClerkUserToLocalUserInput,
  syncClerkUserToLocalUser,
  type ClerkUserPayload,
  type LocalUserSyncRecord,
  type UserSyncDatabase,
} from "../user-sync";

const prismaAuditEventCreate = vi.fn();
const prismaAuditEventFindFirst = vi.fn();
const prismaOrganizationFindFirst = vi.fn();
const prismaOrganizationMemberFindFirst = vi.fn();
const prismaUpsert = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditEvent: {
      create: prismaAuditEventCreate,
      findFirst: prismaAuditEventFindFirst,
    },
    organization: {
      findFirst: prismaOrganizationFindFirst,
    },
    organizationMember: {
      findFirst: prismaOrganizationMemberFindFirst,
    },
    user: {
      upsert: prismaUpsert,
    },
  },
}));

const createClerkUserPayload = (overrides: Partial<ClerkUserPayload> = {}): ClerkUserPayload => {
  return {
    email_addresses: [
      {
        email_address: "secondary@example.com",
        id: "email_secondary",
      },
      {
        email_address: " Patient@Example.COM ",
        id: "email_primary",
      },
    ],
    first_name: "Mila",
    id: "user_clerk_123",
    last_name: "Ivanova",
    primary_email_address_id: "email_primary",
    ...overrides,
  };
};

const createFakeDatabase = (): UserSyncDatabase & {
  auditEvents: Array<{
    action: string;
    actorUserId: string;
    metadata: {
      clerkUserId: string;
      email: string;
      source: string;
    };
    organizationId: string;
    targetId: string;
    targetType: string;
  }>;
  pendingStaffInvitation: { id: string } | null;
  records: Map<string, LocalUserSyncRecord>;
} => {
  const auditEvents: Array<{
    action: string;
    actorUserId: string;
    metadata: {
      clerkUserId: string;
      email: string;
      source: string;
    };
    organizationId: string;
    targetId: string;
    targetType: string;
  }> = [];
  const records = new Map<string, LocalUserSyncRecord>();

  const database: UserSyncDatabase & {
    auditEvents: typeof auditEvents;
    pendingStaffInvitation: { id: string } | null;
    records: typeof records;
  } = {
    auditEvent: {
      create: async ({ data }) => {
        auditEvents.push(data);

        return {
          id: `audit_${auditEvents.length}`,
        };
      },
      findFirst: async ({ where }) => {
        const existingAuditEvent = auditEvents.find((auditEvent) => {
          return (
            auditEvent.action === where.action &&
            auditEvent.organizationId === where.organizationId &&
            auditEvent.targetId === where.targetId &&
            auditEvent.targetType === where.targetType
          );
        });

        return existingAuditEvent
          ? {
              id: "audit_existing",
            }
          : null;
      },
    },
    auditEvents,
    organization: {
      findFirst: async () => {
        return {
          id: "org_123",
        };
      },
    },
    organizationMember: {
      findFirst: async () => {
        return database.pendingStaffInvitation;
      },
    },
    pendingStaffInvitation: null,
    records,
    user: {
      upsert: async ({ create, update, where }) => {
        const existingRecord = records.get(where.clerkUserId);
        const nextRecord = existingRecord
          ? {
              ...existingRecord,
              ...update,
            }
          : {
              ...create,
              id: `user_local_${records.size + 1}`,
            };

        records.set(where.clerkUserId, nextRecord);

        return nextRecord;
      },
    },
  };

  return database;
};

describe("mapClerkUserToLocalUserInput", () => {
  it("maps the primary Clerk email and display name to the local user shape", () => {
    expect(mapClerkUserToLocalUserInput(createClerkUserPayload())).toEqual({
      clerkUserId: "user_clerk_123",
      email: "patient@example.com",
      name: "Mila Ivanova",
    });
  });

  it("falls back to the first email and username when primary values are missing", () => {
    expect(
      mapClerkUserToLocalUserInput(
        createClerkUserPayload({
          first_name: null,
          last_name: null,
          primary_email_address_id: null,
          username: "patient-user",
        }),
      ),
    ).toEqual({
      clerkUserId: "user_clerk_123",
      email: "secondary@example.com",
      name: "patient-user",
    });
  });

  it("returns null display name when Clerk names and username are missing", () => {
    expect(
      mapClerkUserToLocalUserInput(
        createClerkUserPayload({
          first_name: null,
          last_name: null,
          username: null,
        }),
      ),
    ).toMatchObject({
      name: null,
    });
  });

  it("rejects malformed Clerk user payloads without a user ID or email", () => {
    expect(() => mapClerkUserToLocalUserInput(createClerkUserPayload({ id: "" }))).toThrow(
      "missing a user ID",
    );

    expect(() =>
      mapClerkUserToLocalUserInput(
        createClerkUserPayload({
          email_addresses: [],
        }),
      ),
    ).toThrow("missing an email address");

    expect(() =>
      mapClerkUserToLocalUserInput(
        createClerkUserPayload({
          email_addresses: null,
        }),
      ),
    ).toThrow("missing an email address");
  });
});

describe("syncClerkUserToLocalUser", () => {
  it("upserts by clerkUserId so repeated webhook deliveries update one local user", async () => {
    const database = createFakeDatabase();

    await syncClerkUserToLocalUser(createClerkUserPayload(), database);
    await syncClerkUserToLocalUser(
      createClerkUserPayload({
        email_addresses: [
          {
            email_address: "updated@example.com",
            id: "email_primary",
          },
        ],
        first_name: "Updated",
        last_name: "Patient",
      }),
      database,
    );

    expect(database.records.size).toBe(1);
    expect(database.records.get("user_clerk_123")).toEqual({
      clerkUserId: "user_clerk_123",
      email: "updated@example.com",
      id: "user_local_1",
      name: "Updated Patient",
    });
  });

  it("uses the default Prisma database when no database is passed", async () => {
    prismaUpsert.mockResolvedValueOnce({
      clerkUserId: "user_clerk_123",
      email: "patient@example.com",
      id: "user_local_123",
      name: "Mila Ivanova",
    });

    await expect(syncClerkUserToLocalUser(createClerkUserPayload())).resolves.toEqual({
      clerkUserId: "user_clerk_123",
      email: "patient@example.com",
      id: "user_local_123",
      name: "Mila Ivanova",
    });

    expect(prismaUpsert).toHaveBeenCalledWith({
      create: {
        clerkUserId: "user_clerk_123",
        email: "patient@example.com",
        name: "Mila Ivanova",
      },
      update: {
        email: "patient@example.com",
        name: "Mila Ivanova",
      },
      where: {
        clerkUserId: "user_clerk_123",
      },
    });
  });

  it("audits a public account registration once for a Clerk user.created sync", async () => {
    const database = createFakeDatabase();

    await syncClerkUserToLocalUser(createClerkUserPayload(), database, {
      auditPublicRegistration: true,
    });
    await syncClerkUserToLocalUser(createClerkUserPayload(), database, {
      auditPublicRegistration: true,
    });

    expect(database.auditEvents).toEqual([
      {
        action: "public_account_registered",
        actorUserId: "user_local_1",
        metadata: {
          clerkUserId: "user_clerk_123",
          email: "patient@example.com",
          source: "clerk_user_created",
        },
        organizationId: "org_123",
        targetId: "user_local_1",
        targetType: "User",
      },
    ]);
  });

  it("does not audit ordinary Clerk user updates as public registrations", async () => {
    const database = createFakeDatabase();

    await syncClerkUserToLocalUser(createClerkUserPayload(), database);

    expect(database.auditEvents).toEqual([]);
  });

  it("does not audit invited staff registration as public account registration", async () => {
    const database = createFakeDatabase();
    database.pendingStaffInvitation = {
      id: "member_invited_123",
    };

    await syncClerkUserToLocalUser(createClerkUserPayload(), database, {
      auditPublicRegistration: true,
    });

    expect(database.auditEvents).toEqual([]);
  });
});
