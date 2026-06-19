import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  DOCTOR_PROFILE_APPROVAL_RESULT_STATUS,
  DOCTOR_PROFILE_APPROVED_AUDIT_ACTION,
  DOCTOR_PROFILE_APPROVED_AUDIT_SOURCE,
  DOCTOR_PROFILE_APPROVED_AUDIT_TARGET_TYPE,
  DOCTOR_PROFILE_ONBOARDING_STATUS,
  STAFF_MEMBER_ROLE,
  STAFF_MEMBER_STATUS,
} from "../consts";
import {
  approveDoctorProfileForCurrentAdmin,
  getDefaultDoctorProfileApprovalDatabase,
  getPendingDoctorApprovalsForCurrentAdmin,
} from "../doctor-profile-approval";
import type {
  AdminAccessMembership,
  DoctorProfileApprovalDatabase,
  DoctorProfileRecord,
  LocalUserRecord,
  PendingDoctorApprovalRecord,
} from "../type";

const prismaMock = vi.hoisted(() => ({
  prisma: {
    auditEvent: {
      create: vi.fn(),
    },
    doctor: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
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
    clerkUserId: "user_clerk_admin",
    createdAt: now,
    email: "admin@example.com",
    id: "user_admin",
    name: "Admin User",
    updatedAt: now,
    ...overrides,
  };
};

const createAdminMembership = (
  overrides: Partial<AdminAccessMembership> = {},
): AdminAccessMembership => ({
  id: "member_admin",
  organizationId: "org_123",
  role: STAFF_MEMBER_ROLE.admin,
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
  organizationMemberId: "member_doctor",
  userId: "user_doctor",
  ...overrides,
});

const createPendingDoctorApproval = (
  overrides: Partial<PendingDoctorApprovalRecord> = {},
): PendingDoctorApprovalRecord => ({
  createdAt: new Date("2026-06-18T09:00:00.000Z"),
  email: "doctor@example.com",
  id: "doctor_123",
  name: "Dr. Example",
  phone: null,
  specialty: "Cardiology",
  ...overrides,
});

const createDatabase = ({
  doctor = createDoctorProfile(),
  localUser = createLocalUser(),
  membership = createAdminMembership(),
  pendingDoctors = [createPendingDoctorApproval()],
}: {
  doctor?: DoctorProfileRecord | null;
  localUser?: LocalUserRecord | null;
  membership?: AdminAccessMembership | null;
  pendingDoctors?: PendingDoctorApprovalRecord[];
} = {}): DoctorProfileApprovalDatabase => ({
  auditEvent: {
    create: vi.fn().mockResolvedValue({ id: "audit_123" }),
  },
  doctor: {
    findFirst: vi.fn().mockResolvedValue(doctor),
    findMany: vi.fn().mockResolvedValue(pendingDoctors),
    update: vi.fn().mockResolvedValue(
      createDoctorProfile({
        isActive: true,
        onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.approved,
      }),
    ),
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

describe("getPendingDoctorApprovalsForCurrentAdmin", () => {
  it("lists pending doctor approvals scoped to the current admin organization", async () => {
    const database = createDatabase();

    await expect(
      getPendingDoctorApprovalsForCurrentAdmin({
        authReader: async () => ({ userId: "user_clerk_admin" }),
        database,
      }),
    ).resolves.toEqual([createPendingDoctorApproval()]);

    expect(database.doctor.findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: "asc",
      },
      select: {
        createdAt: true,
        email: true,
        id: true,
        name: true,
        phone: true,
        specialty: true,
      },
      where: {
        onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.pendingAdminApproval,
        organizationId: "org_123",
      },
    });
  });

  it("returns an empty list for non-admin staff", async () => {
    const database = createDatabase({
      membership: createAdminMembership({
        role: STAFF_MEMBER_ROLE.doctor,
      }),
    });

    await expect(
      getPendingDoctorApprovalsForCurrentAdmin({
        authReader: async () => ({ userId: "user_clerk_admin" }),
        database,
      }),
    ).resolves.toEqual([]);

    expect(database.doctor.findMany).not.toHaveBeenCalled();
  });

  it("returns an empty list for signed-out users and admins without an organization", async () => {
    const signedOutDatabase = createDatabase();

    await expect(
      getPendingDoctorApprovalsForCurrentAdmin({
        authReader: async () => ({ userId: null }),
        database: signedOutDatabase,
      }),
    ).resolves.toEqual([]);

    const missingOrganizationDatabase = createDatabase({
      membership: createAdminMembership({
        organizationId: undefined,
      }),
    });

    await expect(
      getPendingDoctorApprovalsForCurrentAdmin({
        authReader: async () => ({ userId: "user_clerk_admin" }),
        database: missingOrganizationDatabase,
      }),
    ).resolves.toEqual([]);
  });

  it("uses the default database when listing pending doctor approvals", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValueOnce(createLocalUser());
    prismaMock.prisma.organizationMember.findUnique.mockResolvedValueOnce(createAdminMembership());
    prismaMock.prisma.doctor.findMany.mockResolvedValueOnce([createPendingDoctorApproval()]);

    await expect(
      getPendingDoctorApprovalsForCurrentAdmin({
        authReader: async () => ({ userId: "user_clerk_admin" }),
      }),
    ).resolves.toEqual([createPendingDoctorApproval()]);
  });
});

describe("approveDoctorProfileForCurrentAdmin", () => {
  it("approves a pending doctor profile, keeps it non-bookable, and writes an audit event", async () => {
    const database = createDatabase();

    await expect(
      approveDoctorProfileForCurrentAdmin({
        authReader: async () => ({ userId: "user_clerk_admin" }),
        database,
        doctorId: " doctor_123 ",
      }),
    ).resolves.toEqual({
      doctorId: "doctor_123",
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.approved,
    });

    expect(database.doctor.update).toHaveBeenCalledWith({
      data: {
        isActive: true,
        isBookable: false,
        onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.approved,
      },
      where: {
        id: "doctor_123",
      },
    });
    expect(database.auditEvent.create).toHaveBeenCalledWith({
      data: {
        action: DOCTOR_PROFILE_APPROVED_AUDIT_ACTION,
        actorUserId: "user_admin",
        metadata: {
          source: DOCTOR_PROFILE_APPROVED_AUDIT_SOURCE,
        },
        organizationId: "org_123",
        targetId: "doctor_123",
        targetType: DOCTOR_PROFILE_APPROVED_AUDIT_TARGET_TYPE,
      },
    });
  });

  it("returns already approved for an active approved profile", async () => {
    const database = createDatabase({
      doctor: createDoctorProfile({
        isActive: true,
        onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.approved,
      }),
    });

    await expect(
      approveDoctorProfileForCurrentAdmin({
        authReader: async () => ({ userId: "user_clerk_admin" }),
        database,
        doctorId: "doctor_123",
      }),
    ).resolves.toEqual({
      doctorId: "doctor_123",
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.alreadyApproved,
    });

    expect(database.doctor.update).not.toHaveBeenCalled();
    expect(database.auditEvent.create).not.toHaveBeenCalled();
  });

  it("does not approve rejected or missing profiles", async () => {
    const database = createDatabase({
      doctor: createDoctorProfile({
        onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.rejected,
      }),
    });

    await expect(
      approveDoctorProfileForCurrentAdmin({
        authReader: async () => ({ userId: "user_clerk_admin" }),
        database,
        doctorId: "doctor_123",
      }),
    ).resolves.toEqual({
      doctorId: "doctor_123",
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.notFound,
    });

    expect(database.doctor.update).not.toHaveBeenCalled();

    const missingDoctorDatabase = createDatabase({
      doctor: null,
    });

    await expect(
      approveDoctorProfileForCurrentAdmin({
        authReader: async () => ({ userId: "user_clerk_admin" }),
        database: missingDoctorDatabase,
        doctorId: "doctor_missing",
      }),
    ).resolves.toEqual({
      doctorId: null,
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.notFound,
    });
  });

  it("rejects unauthorized users and blank doctor IDs", async () => {
    const database = createDatabase({
      membership: null,
    });

    await expect(
      approveDoctorProfileForCurrentAdmin({
        authReader: async () => ({ userId: "user_clerk_admin" }),
        database,
        doctorId: "doctor_123",
      }),
    ).resolves.toEqual({
      doctorId: null,
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.unauthorized,
    });

    await expect(
      approveDoctorProfileForCurrentAdmin({
        database,
        doctorId: "   ",
      }),
    ).resolves.toEqual({
      doctorId: null,
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.notFound,
    });
  });

  it("uses the default database when approving doctor profiles", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValueOnce(createLocalUser());
    prismaMock.prisma.organizationMember.findUnique.mockResolvedValueOnce(createAdminMembership());
    prismaMock.prisma.doctor.findFirst.mockResolvedValueOnce(createDoctorProfile());
    prismaMock.prisma.doctor.update.mockResolvedValueOnce(
      createDoctorProfile({
        isActive: true,
        onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.approved,
      }),
    );
    prismaMock.prisma.auditEvent.create.mockResolvedValueOnce({ id: "audit_123" });

    await expect(
      approveDoctorProfileForCurrentAdmin({
        authReader: async () => ({ userId: "user_clerk_admin" }),
        doctorId: "doctor_123",
      }),
    ).resolves.toEqual({
      doctorId: "doctor_123",
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.approved,
    });
  });
});

describe("getDefaultDoctorProfileApprovalDatabase", () => {
  it("loads the shared Prisma client", async () => {
    await expect(getDefaultDoctorProfileApprovalDatabase()).resolves.toBe(prismaMock.prisma);
  });
});
