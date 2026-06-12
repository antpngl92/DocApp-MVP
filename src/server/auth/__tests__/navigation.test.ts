import { describe, expect, it, vi } from "vitest";

import {
  PUBLIC_NAVIGATION,
  PUBLIC_SIGNED_IN_ADMIN_NAVIGATION,
  PUBLIC_SIGNED_IN_PATIENT_NAVIGATION,
} from "@/config/navigation";

import { OWNER_BOOTSTRAP_MEMBERSHIP_STATUS, OWNER_BOOTSTRAP_ROLE } from "../consts";
import {
  getDefaultPublicNavigationDatabase,
  getPublicNavigationForCurrentUser,
} from "../navigation";
import type { LocalUserRecord, PublicNavigationDatabase } from "../type";

const prismaMock = vi.hoisted(() => ({
  prisma: {
    organizationMember: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => prismaMock);

const createLocalUser = (overrides: Partial<LocalUserRecord> = {}): LocalUserRecord => {
  const now = new Date("2026-06-13T08:00:00.000Z");

  return {
    clerkUserId: "user_clerk_123",
    createdAt: now,
    email: "user@example.com",
    id: "user_local_123",
    name: "Current User",
    updatedAt: now,
    ...overrides,
  };
};

const createDatabase = ({
  localUser = createLocalUser(),
  membership = null,
}: {
  localUser?: LocalUserRecord | null;
  membership?: { role: string; status: string } | null;
} = {}): PublicNavigationDatabase => {
  return {
    organizationMember: {
      findUnique: vi.fn().mockResolvedValue(membership),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(localUser),
    },
  };
};

describe("getPublicNavigationForCurrentUser", () => {
  it("returns public navigation for signed-out users", async () => {
    await expect(
      getPublicNavigationForCurrentUser({
        authReader: async () => ({ userId: null }),
        database: createDatabase(),
      }),
    ).resolves.toBe(PUBLIC_NAVIGATION);
  });

  it("returns account navigation for signed-in users without local admin access", async () => {
    await expect(
      getPublicNavigationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase(),
      }),
    ).resolves.toBe(PUBLIC_SIGNED_IN_PATIENT_NAVIGATION);
  });

  it("returns account navigation for signed-in users before local user sync completes", async () => {
    await expect(
      getPublicNavigationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({ localUser: null }),
      }),
    ).resolves.toBe(PUBLIC_SIGNED_IN_PATIENT_NAVIGATION);
  });

  it("returns admin navigation for signed-in users with active non-admin staff access", async () => {
    await expect(
      getPublicNavigationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({
          membership: {
            role: "doctor",
            status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
          },
        }),
      }),
    ).resolves.toBe(PUBLIC_SIGNED_IN_ADMIN_NAVIGATION);
  });

  it("returns admin navigation for signed-in users with active owner/admin access", async () => {
    await expect(
      getPublicNavigationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({
          membership: {
            role: OWNER_BOOTSTRAP_ROLE.admin,
            status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
          },
        }),
      }),
    ).resolves.toBe(PUBLIC_SIGNED_IN_ADMIN_NAVIGATION);
  });

  it("returns the default database", async () => {
    await expect(getDefaultPublicNavigationDatabase()).resolves.toBe(prismaMock.prisma);
  });
});
