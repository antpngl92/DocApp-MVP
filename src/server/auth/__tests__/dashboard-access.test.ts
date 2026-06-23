import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getDefaultDashboardRoleAccessDatabase,
  requireDashboardRoleAccess,
} from "../dashboard-access";

const navigationState = vi.hoisted(() => ({
  notFound: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  prisma: {
    organizationMember: { findUnique: vi.fn() },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => prismaMock);

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

  it("returns the default dashboard access database", async () => {
    await expect(getDefaultDashboardRoleAccessDatabase()).resolves.toBe(prismaMock.prisma);
  });

  it("uses the default database when no database is supplied", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValueOnce({
      clerkUserId: "clerk_123",
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      email: "admin@example.com",
      id: "user_123",
      name: "Admin User",
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    prismaMock.prisma.organizationMember.findUnique.mockResolvedValueOnce({
      role: "admin",
      status: "active",
    });

    await expect(
      requireDashboardRoleAccess({
        allowedRoles: ["admin"],
        authReader: async () => ({ userId: "clerk_123" }),
      }),
    ).resolves.toMatchObject({
      membership: { role: "admin" },
      user: { id: "user_123" },
    });
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
        role: "receptionist",
        status: "active",
      },
      user: {
        clerkUserId: "clerk_123",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        email: "receptionist@example.com",
        id: "user_123",
        name: "Receptionist User",
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
