import { describe, expect, it, vi } from "vitest";

import {
  CURRENT_AUTHENTICATED_USER_STATUS,
  getCurrentAuthenticatedUser,
  type AuthenticatedUserRecord,
  type CurrentUserDatabase,
} from "../current-user";

const createLocalUser = (
  overrides: Partial<AuthenticatedUserRecord> = {},
): AuthenticatedUserRecord => {
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

const createDatabase = (localUser: AuthenticatedUserRecord | null): CurrentUserDatabase => {
  return {
    user: {
      findUnique: vi.fn().mockResolvedValue(localUser),
    },
  };
};

describe("getCurrentAuthenticatedUser", () => {
  it("returns signed_out without querying the database when Clerk has no signed-in user", async () => {
    const database = createDatabase(createLocalUser());

    await expect(
      getCurrentAuthenticatedUser({
        authReader: async () => ({ userId: null }),
        database,
      }),
    ).resolves.toEqual({
      clerkUserId: null,
      status: CURRENT_AUTHENTICATED_USER_STATUS.signedOut,
      user: null,
    });

    expect(database.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns missing_local_user when Clerk is signed in but the local User is not synced", async () => {
    const database = createDatabase(null);

    await expect(
      getCurrentAuthenticatedUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database,
      }),
    ).resolves.toEqual({
      clerkUserId: "user_clerk_123",
      status: CURRENT_AUTHENTICATED_USER_STATUS.missingLocalUser,
      user: null,
    });

    expect(database.user.findUnique).toHaveBeenCalledWith({
      where: {
        clerkUserId: "user_clerk_123",
      },
    });
  });

  it("returns the local user when Clerk user ID maps to a local User record", async () => {
    const localUser = createLocalUser();
    const database = createDatabase(localUser);

    await expect(
      getCurrentAuthenticatedUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database,
      }),
    ).resolves.toEqual({
      clerkUserId: "user_clerk_123",
      status: CURRENT_AUTHENTICATED_USER_STATUS.authenticated,
      user: localUser,
    });
  });
});
