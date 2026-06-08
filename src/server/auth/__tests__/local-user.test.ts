import { describe, expect, it, vi } from "vitest";

import {
  findLocalUserByClerkUserId,
  type LocalUserLookupDatabase,
  type LocalUserRecord,
} from "../local-user";

const createLocalUser = (overrides: Partial<LocalUserRecord> = {}): LocalUserRecord => {
  const now = new Date("2026-06-08T09:00:00.000Z");

  return {
    clerkUserId: "user_clerk_123",
    createdAt: now,
    email: "patient@example.com",
    id: "user_local_123",
    name: "Test Patient",
    updatedAt: now,
    ...overrides,
  };
};

const createDatabase = (localUser: LocalUserRecord | null): LocalUserLookupDatabase => {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue(localUser),
    },
  };
};

describe("findLocalUserByClerkUserId", () => {
  it("looks up a local User by unique Clerk user ID", async () => {
    const localUser = createLocalUser();
    const database = createDatabase(localUser);

    await expect(findLocalUserByClerkUserId("user_clerk_123", database)).resolves.toEqual(
      localUser,
    );

    expect(database.user.findUnique).toHaveBeenCalledWith({
      where: {
        clerkUserId: "user_clerk_123",
      },
    });
  });

  it("returns null when the Clerk user ID has not been synced locally", async () => {
    const database = createDatabase(null);

    await expect(findLocalUserByClerkUserId("user_missing", database)).resolves.toBeNull();
  });
});
