import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getDefaultCurrentClinicAccessDatabase,
  requireCurrentClinicForCurrentUser,
  requireCurrentClinicMembershipForCurrentUser,
} from "../current-clinic";

const prismaMock = vi.hoisted(() => ({
  prisma: {
    organization: {
      findFirst: vi.fn(),
    },
    organizationMember: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

const navigationState = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/lib/prisma", () => prismaMock);

vi.mock("next/navigation", () => ({
  notFound: navigationState.notFound,
}));

const localUser = {
  clerkUserId: "clerk_123",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  email: "patient@example.com",
  id: "user_123",
  name: "Patient User",
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

const buildDatabase = ({
  clinic = {
    id: "org_123",
    name: "Sofia Care Clinic",
    status: "active",
  },
  membership = null,
  user = localUser,
}: {
  clinic?: { id: string; name: string; status: string } | null;
  membership?: { organizationId?: string; role: string; status: string } | null;
  user?: typeof localUser | null;
} = {}) => ({
  organization: {
    findFirst: vi.fn(async () => clinic),
  },
  organizationMember: {
    findUnique: vi.fn(async () => membership),
  },
  user: {
    findUnique: vi.fn(async () => user),
  },
});

describe("current clinic access", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the default current clinic access database", async () => {
    await expect(getDefaultCurrentClinicAccessDatabase()).resolves.toBe(prismaMock.prisma);
  });

  it("returns the active clinic for a signed-in patient account", async () => {
    const database = buildDatabase();

    const result = await requireCurrentClinicForCurrentUser({
      authReader: async () => ({ userId: "clerk_123" }),
      database,
    });

    expect(result.clinic.id).toBe("org_123");
    expect(result.membership).toBeNull();
    expect(result.user.id).toBe("user_123");
    expect(database.organization.findFirst).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "asc",
      },
      where: {
        status: "active",
      },
    });
  });

  it("scopes staff clinic lookup to the active membership organization", async () => {
    const database = buildDatabase({
      membership: {
        organizationId: "org_staff",
        role: "receptionist",
        status: "active",
      },
    });

    const result = await requireCurrentClinicMembershipForCurrentUser({
      authReader: async () => ({ userId: "clerk_123" }),
      database,
    });

    expect(result.membership?.organizationId).toBe("org_staff");
    expect(database.organization.findFirst).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "asc",
      },
      where: {
        id: "org_staff",
        status: "active",
      },
    });
  });

  it("requires local active staff membership for membership-only access", async () => {
    const database = buildDatabase();

    await expect(
      requireCurrentClinicMembershipForCurrentUser({
        authReader: async () => ({ userId: "clerk_123" }),
        database,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(navigationState.notFound).toHaveBeenCalledTimes(1);
  });

  it("returns not found when the local user or active clinic is missing", async () => {
    await expect(
      requireCurrentClinicForCurrentUser({
        authReader: async () => ({ userId: "clerk_missing" }),
        database: buildDatabase({ user: null }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    await expect(
      requireCurrentClinicForCurrentUser({
        authReader: async () => ({ userId: "clerk_123" }),
        database: buildDatabase({ clinic: null }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
