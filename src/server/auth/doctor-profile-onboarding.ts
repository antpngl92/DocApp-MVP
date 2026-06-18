import {
  DOCTOR_PROFILE_ACCESS_STATUS,
  DOCTOR_PROFILE_CREATED_AUDIT_ACTION,
  DOCTOR_PROFILE_CREATED_AUDIT_SOURCE,
  DOCTOR_PROFILE_CREATED_AUDIT_TARGET_TYPE,
  DOCTOR_PROFILE_CREATION_RESULT_STATUS,
  DOCTOR_PROFILE_ONBOARDING_STATUS,
} from "./consts";
import { getDoctorProfileAccessForCurrentUser } from "./doctor-profile";
import type {
  CreateDoctorProfileForCurrentUserOptions,
  DoctorProfileCreationDatabase,
  DoctorProfileCreationResult,
} from "./type";
import { isUniqueConstraintError } from "./utils";

const getDefaultDoctorProfileCreationDatabase =
  async (): Promise<DoctorProfileCreationDatabase> => {
    const { prisma } = await import("@/lib/prisma");

    return prisma;
  };

const normalizeOptionalProfileField = (value: string | null | undefined): string | null => {
  const normalizedValue = value?.trim();

  return normalizedValue || null;
};

const normalizeDoctorProfileName = (name: string): string => {
  return name.trim().replace(/\s+/g, " ");
};

const createDoctorProfileForCurrentUser = async ({
  authReader,
  database,
  name,
  phone,
  specialty,
}: CreateDoctorProfileForCurrentUserOptions): Promise<DoctorProfileCreationResult> => {
  const normalizedName = normalizeDoctorProfileName(name);

  if (!normalizedName) {
    return {
      doctorId: null,
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.invalidName,
    };
  }

  const doctorProfileCreationDatabase =
    database ?? (await getDefaultDoctorProfileCreationDatabase());
  const doctorProfileAccess = await getDoctorProfileAccessForCurrentUser({
    authReader,
    database: doctorProfileCreationDatabase,
  });

  if (doctorProfileAccess.status !== DOCTOR_PROFILE_ACCESS_STATUS.profileRequired) {
    return {
      doctorId: doctorProfileAccess.doctor?.id ?? null,
      status:
        doctorProfileAccess.doctor || doctorProfileAccess.status === DOCTOR_PROFILE_ACCESS_STATUS.ready
          ? DOCTOR_PROFILE_CREATION_RESULT_STATUS.alreadyExists
          : DOCTOR_PROFILE_CREATION_RESULT_STATUS.unauthorized,
    };
  }

  const membership = doctorProfileAccess.membership;
  const user = doctorProfileAccess.user;

  if (!membership?.id || !membership.organizationId || !user) {
    return {
      doctorId: null,
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.unauthorized,
    };
  }

  let doctor;

  try {
    doctor = await doctorProfileCreationDatabase.doctor.create({
      data: {
        email: user.email,
        isActive: false,
        isBookable: false,
        name: normalizedName,
        onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.pendingAdminApproval,
        organizationId: membership.organizationId,
        organizationMemberId: membership.id,
        phone: normalizeOptionalProfileField(phone),
        specialty: normalizeOptionalProfileField(specialty),
        userId: user.id,
      },
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    return {
      doctorId: null,
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.alreadyExists,
    };
  }

  try {
    await doctorProfileCreationDatabase.auditEvent.create({
      data: {
        action: DOCTOR_PROFILE_CREATED_AUDIT_ACTION,
        actorUserId: user.id,
        metadata: {
          source: DOCTOR_PROFILE_CREATED_AUDIT_SOURCE,
        },
        organizationId: membership.organizationId,
        targetId: doctor.id,
        targetType: DOCTOR_PROFILE_CREATED_AUDIT_TARGET_TYPE,
      },
    });
  } catch {
    // The doctor profile exists; audit failure should be monitored but should
    // not make the doctor resubmit and risk duplicate profile creation.
  }

  return {
    doctorId: doctor.id,
    status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.created,
  };
};

export {
  DOCTOR_PROFILE_CREATION_RESULT_STATUS,
  createDoctorProfileForCurrentUser,
  getDefaultDoctorProfileCreationDatabase,
  normalizeDoctorProfileName,
  normalizeOptionalProfileField,
};
export type {
  CreateDoctorProfileForCurrentUserOptions,
  DoctorProfileCreationDatabase,
  DoctorProfileCreationResult,
};
