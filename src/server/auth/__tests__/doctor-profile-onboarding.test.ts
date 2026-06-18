import { describe, expect, it, vi } from "vitest";

import {
  DOCTOR_PROFILE_CREATED_AUDIT_ACTION,
  DOCTOR_PROFILE_CREATED_AUDIT_SOURCE,
  DOCTOR_PROFILE_CREATED_AUDIT_TARGET_TYPE,
  DOCTOR_PROFILE_CREATION_RESULT_STATUS,
  DOCTOR_PROFILE_ONBOARDING_STATUS,
  PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE,
  STAFF_MEMBER_ROLE,
  STAFF_MEMBER_STATUS,
} from "../consts";
import {
  createDoctorProfileForCurrentUser,
  normalizeDoctorProfileName,
  normalizeOptionalProfileField,
} from "../doctor-profile-onboarding";
import type {
  AdminAccessMembership,
  DoctorProfileCreationDatabase,
  DoctorProfileRecord,
  LocalUserRecord,
} from "../type";

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
} = {}): DoctorProfileCreationDatabase => ({
  auditEvent: {
    create: vi.fn().mockResolvedValue({ id: "audit_123" }),
  },
  doctor: {
    create: vi.fn().mockResolvedValue(createDoctorProfile()),
    findFirst: vi.fn().mockResolvedValue(doctor),
  },
  organizationMember: {
    findUnique: vi.fn().mockResolvedValue(membership),
  },
  user: {
    findUnique: vi.fn().mockResolvedValue(localUser),
  },
});

describe("doctor profile field normalization", () => {
  it("normalizes display names and optional fields", () => {
    expect(normalizeDoctorProfileName("  Dr.   Elena   Petrova  ")).toBe("Dr. Elena Petrova");
    expect(normalizeOptionalProfileField("  Cardiology  ")).toBe("Cardiology");
    expect(normalizeOptionalProfileField("   ")).toBeNull();
    expect(normalizeOptionalProfileField(null)).toBeNull();
  });
});

describe("createDoctorProfileForCurrentUser", () => {
  it("rejects empty display names before querying the database", async () => {
    const database = createDatabase();

    await expect(
      createDoctorProfileForCurrentUser({
        database,
        name: "   ",
      }),
    ).resolves.toEqual({
      doctorId: null,
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.invalidName,
    });

    expect(database.user.findUnique).not.toHaveBeenCalled();
    expect(database.doctor.create).not.toHaveBeenCalled();
  });

  it("rejects users who are not active doctor staff needing profile onboarding", async () => {
    await expect(
      createDoctorProfileForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({
          membership: createDoctorMembership({
            role: STAFF_MEMBER_ROLE.receptionist,
          }),
        }),
        name: "Dr. Example",
      }),
    ).resolves.toEqual({
      doctorId: null,
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.unauthorized,
    });
  });

  it("returns already exists when a doctor profile is already linked", async () => {
    await expect(
      createDoctorProfileForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: createDatabase({
          doctor: createDoctorProfile({
            id: "doctor_existing",
          }),
        }),
        name: "Dr. Example",
      }),
    ).resolves.toEqual({
      doctorId: "doctor_existing",
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.alreadyExists,
    });
  });

  it("creates an inactive non-bookable pending doctor profile linked to the current user and membership", async () => {
    const database = createDatabase();

    await expect(
      createDoctorProfileForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database,
        name: "  Dr.   Elena   Petrova  ",
        phone: "  +359 2 000 0000  ",
        specialty: "  Cardiology  ",
      }),
    ).resolves.toEqual({
      doctorId: "doctor_123",
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.created,
    });

    expect(database.doctor.create).toHaveBeenCalledWith({
      data: {
        email: "doctor@example.com",
        isActive: false,
        isBookable: false,
        name: "Dr. Elena Petrova",
        onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.pendingAdminApproval,
        organizationId: "org_123",
        organizationMemberId: "member_123",
        phone: "+359 2 000 0000",
        specialty: "Cardiology",
        userId: "user_local_123",
      },
    });
    expect(database.auditEvent.create).toHaveBeenCalledWith({
      data: {
        action: DOCTOR_PROFILE_CREATED_AUDIT_ACTION,
        actorUserId: "user_local_123",
        metadata: {
          source: DOCTOR_PROFILE_CREATED_AUDIT_SOURCE,
        },
        organizationId: "org_123",
        targetId: "doctor_123",
        targetType: DOCTOR_PROFILE_CREATED_AUDIT_TARGET_TYPE,
      },
    });
  });

  it("treats a concurrent unique conflict as an existing profile", async () => {
    const database = createDatabase();
    database.doctor.create = vi.fn().mockRejectedValue({
      code: PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE,
    });

    await expect(
      createDoctorProfileForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database,
        name: "Dr. Example",
      }),
    ).resolves.toEqual({
      doctorId: null,
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.alreadyExists,
    });

    expect(database.auditEvent.create).not.toHaveBeenCalled();
  });

  it("does not fail profile creation when audit logging fails", async () => {
    const database = createDatabase();
    database.auditEvent.create = vi.fn().mockRejectedValue(new Error("audit unavailable"));

    await expect(
      createDoctorProfileForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database,
        name: "Dr. Example",
      }),
    ).resolves.toEqual({
      doctorId: "doctor_123",
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.created,
    });
  });
});
