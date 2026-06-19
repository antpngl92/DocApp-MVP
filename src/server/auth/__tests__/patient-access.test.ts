import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  getDefaultPatientProfileAccessDatabase,
  requirePatientProfileAccessForCurrentUser,
} from "../patient-access";

const prismaMock = vi.hoisted(() => ({
  prisma: {
    organizationMember: {
      findUnique: vi.fn(),
    },
    patientProfile: {
      create: vi.fn(),
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

const patientProfile = {
  email: "patient@example.com",
  id: "patient_123",
  name: "Patient User",
  phone: null,
  userId: "user_123",
};

const buildDatabase = ({
  membership = null,
  profile = patientProfile,
  user = localUser,
}: {
  membership?: { role: string; status: string } | null;
  profile?: typeof patientProfile | null;
  user?: typeof localUser | null;
} = {}) => ({
  organizationMember: {
    findUnique: vi.fn(async () => membership),
  },
  patientProfile: {
    create: vi.fn(async ({ data }) => ({
      email: data.email,
      id: "patient_created",
      name: data.name,
      phone: null,
      userId: data.userId,
    })),
    findUnique: vi.fn(async () => profile),
  },
  user: {
    findUnique: vi.fn(async () => user),
  },
});

describe("requirePatientProfileAccessForCurrentUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns the default patient profile access database", async () => {
    await expect(getDefaultPatientProfileAccessDatabase()).resolves.toBe(prismaMock.prisma);
  });

  it("returns an existing patient profile for a signed-in non-staff user", async () => {
    const database = buildDatabase();

    const result = await requirePatientProfileAccessForCurrentUser({
      authReader: async () => ({ userId: "clerk_123" }),
      database,
    });

    expect(result.patientProfile.id).toBe("patient_123");
    expect(result.user.id).toBe("user_123");
    expect(database.patientProfile.create).not.toHaveBeenCalled();
  });

  it("creates the minimal patient profile on first account access", async () => {
    const database = buildDatabase({ profile: null });

    const result = await requirePatientProfileAccessForCurrentUser({
      authReader: async () => ({ userId: "clerk_123" }),
      database,
    });

    expect(result.patientProfile.id).toBe("patient_created");
    expect(database.patientProfile.create).toHaveBeenCalledWith({
      data: {
        email: "patient@example.com",
        name: "Patient User",
        userId: "user_123",
      },
    });
  });

  it("blocks active staff users from patient account ownership access", async () => {
    const database = buildDatabase({
      membership: {
        role: "admin",
        status: "active",
      },
    });

    await expect(
      requirePatientProfileAccessForCurrentUser({
        authReader: async () => ({ userId: "clerk_123" }),
        database,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(database.patientProfile.findUnique).not.toHaveBeenCalled();
  });

  it("returns not found for signed-out or missing local users", async () => {
    await expect(
      requirePatientProfileAccessForCurrentUser({
        authReader: async () => ({ userId: null }),
        database: buildDatabase({ user: null }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    await expect(
      requirePatientProfileAccessForCurrentUser({
        authReader: async () => ({ userId: "clerk_missing" }),
        database: buildDatabase({ user: null }),
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });
});
