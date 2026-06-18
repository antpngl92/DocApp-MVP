import {
  CURRENT_AUTHENTICATED_USER_STATUS,
  DOCTOR_PROFILE_ACCESS_STATUS,
  DOCTOR_PROFILE_ONBOARDING_STATUS,
  STAFF_MEMBER_ROLE,
  STAFF_MEMBER_STATUS,
} from "./consts";
import { getCurrentAuthenticatedUser } from "./current-user";
import type {
  DoctorProfileAccessDatabase,
  DoctorProfileAccessResult,
  GetDoctorProfileAccessForCurrentUserOptions,
} from "./type";

const getDefaultDoctorProfileAccessDatabase = async (): Promise<DoctorProfileAccessDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const getDoctorProfileAccessForCurrentUser = async ({
  authReader,
  database,
}: GetDoctorProfileAccessForCurrentUserOptions = {}): Promise<DoctorProfileAccessResult> => {
  const doctorProfileAccessDatabase = database ?? (await getDefaultDoctorProfileAccessDatabase());
  const currentUser = await getCurrentAuthenticatedUser({
    authReader,
    database: doctorProfileAccessDatabase,
  });

  if (currentUser.status === CURRENT_AUTHENTICATED_USER_STATUS.signedOut) {
    return {
      doctor: null,
      membership: null,
      status: DOCTOR_PROFILE_ACCESS_STATUS.signedOut,
      user: null,
    };
  }

  if (currentUser.status === CURRENT_AUTHENTICATED_USER_STATUS.missingLocalUser) {
    return {
      doctor: null,
      membership: null,
      status: DOCTOR_PROFILE_ACCESS_STATUS.missingLocalUser,
      user: null,
    };
  }

  const membership = await doctorProfileAccessDatabase.organizationMember.findUnique({
    where: {
      userId: currentUser.user.id,
    },
  });

  if (
    !membership?.id ||
    !membership.organizationId ||
    membership.role !== STAFF_MEMBER_ROLE.doctor ||
    membership.status !== STAFF_MEMBER_STATUS.active
  ) {
    return {
      doctor: null,
      membership,
      status: DOCTOR_PROFILE_ACCESS_STATUS.notDoctorStaff,
      user: currentUser.user,
    };
  }

  const doctor = await doctorProfileAccessDatabase.doctor.findFirst({
    where: {
      OR: [
        {
          organizationMemberId: membership.id,
        },
        {
          userId: currentUser.user.id,
        },
      ],
      organizationId: membership.organizationId,
    },
  });

  if (!doctor) {
    return {
      doctor: null,
      membership,
      status: DOCTOR_PROFILE_ACCESS_STATUS.profileRequired,
      user: currentUser.user,
    };
  }

  if (doctor.onboardingStatus === DOCTOR_PROFILE_ONBOARDING_STATUS.pendingAdminApproval) {
    return {
      doctor,
      membership,
      status: DOCTOR_PROFILE_ACCESS_STATUS.pendingAdminApproval,
      user: currentUser.user,
    };
  }

  if (doctor.onboardingStatus === DOCTOR_PROFILE_ONBOARDING_STATUS.rejected) {
    return {
      doctor,
      membership,
      status: DOCTOR_PROFILE_ACCESS_STATUS.rejected,
      user: currentUser.user,
    };
  }

  if (!doctor.isActive) {
    return {
      doctor,
      membership,
      status: DOCTOR_PROFILE_ACCESS_STATUS.inactive,
      user: currentUser.user,
    };
  }

  return {
    doctor,
    membership,
    status: DOCTOR_PROFILE_ACCESS_STATUS.ready,
    user: currentUser.user,
  };
};

export { getDefaultDoctorProfileAccessDatabase, getDoctorProfileAccessForCurrentUser };
export type {
  DoctorProfileAccessDatabase,
  DoctorProfileAccessResult,
  GetDoctorProfileAccessForCurrentUserOptions,
};
