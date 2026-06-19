import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireDashboardRoleAccess } from "../dashboard-access";

const navigationState = vi.hoisted(() => ({
  notFound: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: navigationState.notFound,
}));

const buildDatabase = ({
  membership,
  user,
}: {
  membership: { role: string; status: string } | null;
  user: {
    clerkUserId: string;
    createdAt: Date;
    email: string;
    id: string;
    name: string | null;
    updatedAt: Date;
  } | null;
}) => ({
  organizationMember: {
    findUnique: vi.fn(async () => membership),
  },
  user: {
    findUnique: vi.fn(async () => user),
  },
});

describe("requireDashboardRoleAccess", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active staff membership when the role is allowed", async () => {
    const database = buildDatabase({
      membership: {
        role: "admin",
        status: "active",
      },
      user: {
        clerkUserId: "clerk_123",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        email: "admin@example.com",
        id: "user_123",
        name: "Admin User",
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    });

    const result = await requireDashboardRoleAccess({
      allowedRoles: ["admin"],
      authReader: async () => ({ userId: "clerk_123" }),
      database,
    });

    expect(result.membership.role).toBe("admin");
    expect(navigationState.notFound).not.toHaveBeenCalled();
  });

  it("returns not found when the role is not allowed", async () => {
    const database = buildDatabase({
      membership: {
        role: "doctor",
        status: "active",
      },
      user: {
        clerkUserId: "clerk_123",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        email: "doctor@example.com",
        id: "user_123",
        name: "Doctor User",
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    });
    navigationState.notFound.mockImplementationOnce(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      requireDashboardRoleAccess({
        allowedRoles: ["admin"],
        authReader: async () => ({ userId: "clerk_123" }),
        database,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("returns not found when the visitor is signed out", async () => {
    const database = buildDatabase({
      membership: null,
      user: null,
    });
    navigationState.notFound.mockImplementationOnce(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      requireDashboardRoleAccess({
        allowedRoles: ["admin"],
        authReader: async () => ({ userId: null }),
        database,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("returns not found when the local user is missing", async () => {
    const database = buildDatabase({
      membership: null,
      user: null,
    });
    navigationState.notFound.mockImplementationOnce(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      requireDashboardRoleAccess({
        allowedRoles: ["admin"],
        authReader: async () => ({ userId: "clerk_missing" }),
        database,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("returns not found when active staff membership is missing", async () => {
    const database = buildDatabase({
      membership: null,
      user: {
        clerkUserId: "clerk_123",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        email: "admin@example.com",
        id: "user_123",
        name: "Admin User",
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      },
    });
    navigationState.notFound.mockImplementationOnce(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      requireDashboardRoleAccess({
        allowedRoles: ["admin"],
        authReader: async () => ({ userId: "clerk_123" }),
        database,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
