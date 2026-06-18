import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DOCTOR_PROFILE_ACCESS_STATUS,
  DOCTOR_PROFILE_ONBOARDING_STATUS,
  STAFF_MEMBER_ROLE,
  STAFF_MEMBER_STATUS,
} from "../consts";
import {
  getDefaultDoctorProfileAccessDatabase,
  getDoctorProfileAccessForCurrentUser,
} from "../doctor-profile";
import type {
  AdminAccessMembership,
  DoctorProfileAccessDatabase,
  DoctorProfileRecord,
  LocalUserRecord,
} from "../type";

const prismaMock = vi.hoisted(() => ({
  prisma: {
    doctor: {
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

vi.mock("@/lib/prisma", () => prismaMock);

const createLocalUser = (overrides: Partial<LocalUserRecord> = {}): LocalUserRecord => {
  const now = new Date("2026-06-18T08:00:00.000Z");

  return {
    clerkUserId: "user_clerk_123",
    createdAt: now,
    email: "doctor@example.com",
    id: "user_local_123",
    name: "Dr. Example",
    updatedAt: now,
    ...overrides,
  };
};

const createDoctorMembership = (
  overrides: Partial<AdminAccessMembership> = {},
): AdminAccessMembership => ({
  id: "member_123",
  organizationId: "org_123",
  role: STAFF_MEMBER_ROLE.doctor,
  status: STAFF_MEMBER_STATUS.active,
  ...overrides,
});

const createDoctorProfile = (
  overrides: Partial<DoctorProfileRecord> = {},
): DoctorProfileRecord => ({
  id: "doctor_123",
  isActive: false,
  isBookable: false,
  onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.pendingAdminApproval,
  organizationId: "org_123",
  organizationMemberId: "member_123",
  userId: "user_local_123",
  ...overrides,
});

const createDatabase = ({
  doctor = null,
  localUser = createLocalUser(),
  membership = createDoctorMembership(),
}: {
  doctor?: DoctorProfileRecord | null;
  localUser?: LocalUserRecord | null;
  membership?: AdminAccessMembership | null;
} = {}): DoctorProfileAccessDatabase => ({
  doctor: {
    findFirst: vi.fn().mockResolvedValue(doctor),
  },
  organizationMember: {
    findUnique: vi.fn().mockResolvedValue(membership),
  },
  user: {
    findUnique: vi.fn().mockResolvedValue(localUser),
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getDoctorProfileAccessForCurrentUser", () => {
  it("returns signed out state without querying doctor membership", async () => {
    const database = createDatabase();

    await expect(
      getDoctorProfileAccessForCurrentUser({
        authReader: async () => ({ userId: null }),
        database,
      }),
    ).resolves.toEqual({
      doctor: null,
      membership: null,
      status: DOCTOR_PROFILE_ACCESS_STATUS.signedOut,
      user: null,
    });

    expect(database.organizationMember.findUnique).not.toHaveBeenCalled();
    expect(database.doctor.findFirst).not.toHaveBeenCalled();
  });

  it("returns missing local user state before Clerk sync creates the local user", async () => {
    await expect(
      getDoctorProfileAccessForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({ localUser: null }),
      }),
    ).resolves.toMatchObject({
      doctor: null,
      membership: null,
      status: DOCTOR_PROFILE_ACCESS_STATUS.missingLocalUser,
      user: null,
    });
  });

  it("returns not-doctor-staff for users without an active doctor membership", async () => {
    const user = createLocalUser();
    const membership = createDoctorMembership({
      role: STAFF_MEMBER_ROLE.receptionist,
    });
    const database = createDatabase({ localUser: user, membership });

    await expect(
      getDoctorProfileAccessForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database,
      }),
    ).resolves.toEqual({
      doctor: null,
      membership,
      status: DOCTOR_PROFILE_ACCESS_STATUS.notDoctorStaff,
      user,
    });

    expect(database.doctor.findFirst).not.toHaveBeenCalled();
  });

  it("requires doctor profile onboarding for active doctors without a linked profile", async () => {
    const user = createLocalUser();
    const membership = createDoctorMembership();
    const database = createDatabase({ doctor: null, localUser: user, membership });

    await expect(
      getDoctorProfileAccessForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database,
      }),
    ).resolves.toEqual({
      doctor: null,
      membership,
      status: DOCTOR_PROFILE_ACCESS_STATUS.profileRequired,
      user,
    });

    expect(database.doctor.findFirst).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            organizationMemberId: "member_123",
          },
          {
            userId: "user_local_123",
          },
        ],
        organizationId: "org_123",
      },
    });
  });

  it("returns pending approval while a linked doctor profile waits for admin approval", async () => {
    const doctor = createDoctorProfile();

    await expect(
      getDoctorProfileAccessForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({ doctor }),
      }),
    ).resolves.toMatchObject({
      doctor,
      status: DOCTOR_PROFILE_ACCESS_STATUS.pendingAdminApproval,
    });
  });

  it("returns rejected when the linked doctor profile was rejected", async () => {
    const doctor = createDoctorProfile({
      onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.rejected,
    });

    await expect(
      getDoctorProfileAccessForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({ doctor }),
      }),
    ).resolves.toMatchObject({
      doctor,
      status: DOCTOR_PROFILE_ACCESS_STATUS.rejected,
    });
  });

  it("returns inactive when an approved doctor profile is not active yet", async () => {
    const doctor = createDoctorProfile({
      onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.approved,
    });

    await expect(
      getDoctorProfileAccessForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({ doctor }),
      }),
    ).resolves.toMatchObject({
      doctor,
      status: DOCTOR_PROFILE_ACCESS_STATUS.inactive,
    });
  });

  it("returns ready when the linked approved doctor profile is active", async () => {
    const doctor = createDoctorProfile({
      isActive: true,
      onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.approved,
    });

    await expect(
      getDoctorProfileAccessForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({ doctor }),
      }),
    ).resolves.toMatchObject({
      doctor,
      status: DOCTOR_PROFILE_ACCESS_STATUS.ready,
    });
  });

  it("uses the default database when no explicit database is provided", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValueOnce(null);

    await expect(
      getDoctorProfileAccessForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
      }),
    ).resolves.toMatchObject({
      status: DOCTOR_PROFILE_ACCESS_STATUS.missingLocalUser,
    });
  });
});

describe("getDefaultDoctorProfileAccessDatabase", () => {
  it("loads the shared Prisma client", async () => {
    await expect(getDefaultDoctorProfileAccessDatabase()).resolves.toBe(prismaMock.prisma);
  });
});
