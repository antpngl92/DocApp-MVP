import { describe, expect, it, vi } from "vitest";

import {
  PUBLIC_NAVIGATION,
  PUBLIC_SIGNED_IN_ADMIN_NAVIGATION,
  PUBLIC_SIGNED_IN_PATIENT_NAVIGATION,
} from "@/config/navigation";
import { ROUTES } from "@/config/routes";

import { OWNER_BOOTSTRAP_MEMBERSHIP_STATUS, OWNER_BOOTSTRAP_ROLE } from "../consts";
import {
  getAuthenticatedHomeForCurrentUser,
  getDefaultPublicNavigationDatabase,
  getPublicNavigationForCurrentUser,
} from "../navigation";
import type { LocalUserRecord, PublicNavigationDatabase } from "../type";

const prismaMock = vi.hoisted(() => ({
  prisma: {
    organizationMember: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => prismaMock);

const createLocalUser = (): LocalUserRecord => ({
  clerkUserId: "user_clerk_123",
  createdAt: new Date("2026-06-13T08:00:00.000Z"),
  email: "user@example.com",
  id: "user_local_123",
  name: "Current User",
  updatedAt: new Date("2026-06-13T08:00:00.000Z"),
});

const createDatabase = ({
  localUser = createLocalUser(),
  membership = null,
}: {
  localUser?: LocalUserRecord | null;
  membership?: { role: string; status: string } | null;
} = {}): PublicNavigationDatabase => ({
  organizationMember: { findUnique: vi.fn().mockResolvedValue(membership) },
  user: { findUnique: vi.fn().mockResolvedValue(localUser) },
});

describe("public navigation", () => {
  it("returns public navigation for signed-out users", async () => {
    await expect(
      getPublicNavigationForCurrentUser({
        authReader: async () => ({ userId: null }),
        database: createDatabase(),
      }),
    ).resolves.toBe(PUBLIC_NAVIGATION);
  });

  it("returns patient navigation without active staff access", async () => {
    await expect(
      getPublicNavigationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase(),
      }),
    ).resolves.toBe(PUBLIC_SIGNED_IN_PATIENT_NAVIGATION);
  });

  it("returns patient navigation while local user synchronization is pending", async () => {
    await expect(
      getPublicNavigationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({ localUser: null }),
      }),
    ).resolves.toBe(PUBLIC_SIGNED_IN_PATIENT_NAVIGATION);
  });

  it.each([OWNER_BOOTSTRAP_ROLE.admin, "receptionist"])(
    "returns dashboard navigation for active %s staff",
    async (role) => {
      await expect(
        getPublicNavigationForCurrentUser({
          authReader: async () => ({ userId: "user_clerk_123" }),
          database: createDatabase({
            membership: { role, status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active },
          }),
        }),
      ).resolves.toBe(PUBLIC_SIGNED_IN_ADMIN_NAVIGATION);
    },
  );

  it("returns the default database", async () => {
    await expect(getDefaultPublicNavigationDatabase()).resolves.toBe(prismaMock.prisma);
  });

  it("uses the default database for public navigation", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      getPublicNavigationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
      }),
    ).resolves.toBe(PUBLIC_SIGNED_IN_PATIENT_NAVIGATION);
  });
});

describe("authenticated home", () => {
  it("returns the patient account without an authenticated local staff user", async () => {
    await expect(
      getAuthenticatedHomeForCurrentUser({
        authReader: async () => ({ userId: null }),
        database: createDatabase(),
      }),
    ).resolves.toBe(ROUTES.patientAccount);
  });

  it.each([OWNER_BOOTSTRAP_ROLE.admin, "receptionist"])(
    "returns the dashboard for active %s staff",
    async (role) => {
      await expect(
        getAuthenticatedHomeForCurrentUser({
          authReader: async () => ({ userId: "user_clerk_123" }),
          database: createDatabase({
            membership: { role, status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active },
          }),
        }),
      ).resolves.toBe(ROUTES.dashboard);
    },
  );

  it("returns the patient account for a local user without active staff access", async () => {
    await expect(
      getAuthenticatedHomeForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase(),
      }),
    ).resolves.toBe(ROUTES.patientAccount);
  });

  it("uses the default database", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValueOnce(null);
    await expect(
      getAuthenticatedHomeForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
      }),
    ).resolves.toBe(ROUTES.patientAccount);
  });
});
