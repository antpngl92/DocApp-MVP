import { describe, expect, it } from "vitest";

import {
  mapClerkUserToLocalUserInput,
  syncClerkUserToLocalUser,
  type ClerkUserPayload,
  type UserSyncDatabase,
} from "../user-sync";

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
  records: Map<string, { clerkUserId: string; email: string; name: string | null }>;
} => {
  const records = new Map<string, { clerkUserId: string; email: string; name: string | null }>();

  return {
    records,
    user: {
      upsert: async ({ create, update, where }) => {
        const existingRecord = records.get(where.clerkUserId);
        const nextRecord = existingRecord
          ? {
              ...existingRecord,
              ...update,
            }
          : create;

        records.set(where.clerkUserId, nextRecord);

        return nextRecord;
      },
    },
  };
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
      name: "Updated Patient",
    });
  });
});
