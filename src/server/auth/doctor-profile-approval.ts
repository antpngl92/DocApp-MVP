import {
  CURRENT_AUTHENTICATED_USER_STATUS,
  DOCTOR_PROFILE_APPROVAL_RESULT_STATUS,
  DOCTOR_PROFILE_APPROVED_AUDIT_ACTION,
  DOCTOR_PROFILE_APPROVED_AUDIT_SOURCE,
  DOCTOR_PROFILE_APPROVED_AUDIT_TARGET_TYPE,
  DOCTOR_PROFILE_ONBOARDING_STATUS,
} from "./consts";
import { getCurrentAuthenticatedUser } from "./current-user";
import type {
  AdminAccessMembership,
  ApproveDoctorProfileForCurrentAdminOptions,
  DoctorProfileApprovalDatabase,
  DoctorProfileApprovalResult,
  GetPendingDoctorApprovalsForCurrentAdminOptions,
  PendingDoctorApprovalRecord,
} from "./type";
import { hasOwnerAdminAccess } from "./admin-access";

type DoctorProfileApprovalAdminMembership = AdminAccessMembership & {
  organizationId: string;
};

const getDefaultDoctorProfileApprovalDatabase =
  async (): Promise<DoctorProfileApprovalDatabase> => {
    const { prisma } = await import("@/lib/prisma");

    return prisma;
  };

const getCurrentAdminApprovalContext = async ({
  authReader,
  database,
}: {
  authReader?: GetPendingDoctorApprovalsForCurrentAdminOptions["authReader"];
  database: DoctorProfileApprovalDatabase;
}) => {
  const currentUser = await getCurrentAuthenticatedUser({
    authReader,
    database,
  });

  if (currentUser.status !== CURRENT_AUTHENTICATED_USER_STATUS.authenticated) {
    return null;
  }

  const membership = await database.organizationMember.findUnique({
    where: {
      userId: currentUser.user.id,
    },
  });

  if (!membership || !hasOwnerAdminAccess(membership) || !membership.organizationId) {
    return null;
  }

  return {
    membership: membership as DoctorProfileApprovalAdminMembership,
    user: currentUser.user,
  };
};

const getPendingDoctorApprovalsForCurrentAdmin = async ({
  authReader,
  database,
}: GetPendingDoctorApprovalsForCurrentAdminOptions = {}): Promise<
  PendingDoctorApprovalRecord[]
> => {
  const doctorProfileApprovalDatabase =
    database ?? (await getDefaultDoctorProfileApprovalDatabase());
  const context = await getCurrentAdminApprovalContext({
    authReader,
    database: doctorProfileApprovalDatabase,
  });

  if (!context) {
    return [];
  }

  return doctorProfileApprovalDatabase.doctor.findMany({
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
      organizationId: context.membership.organizationId,
    },
  });
};

const approveDoctorProfileForCurrentAdmin = async ({
  authReader,
  database,
  doctorId,
}: ApproveDoctorProfileForCurrentAdminOptions): Promise<DoctorProfileApprovalResult> => {
  const normalizedDoctorId = doctorId.trim();

  if (!normalizedDoctorId) {
    return {
      doctorId: null,
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.notFound,
    };
  }

  const doctorProfileApprovalDatabase =
    database ?? (await getDefaultDoctorProfileApprovalDatabase());
  const context = await getCurrentAdminApprovalContext({
    authReader,
    database: doctorProfileApprovalDatabase,
  });

  if (!context) {
    return {
      doctorId: null,
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.unauthorized,
    };
  }

  const doctor = await doctorProfileApprovalDatabase.doctor.findFirst({
    where: {
      id: normalizedDoctorId,
      organizationId: context.membership.organizationId,
    },
  });

  if (!doctor) {
    return {
      doctorId: null,
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.notFound,
    };
  }

  if (
    doctor.onboardingStatus === DOCTOR_PROFILE_ONBOARDING_STATUS.approved &&
    doctor.isActive
  ) {
    return {
      doctorId: doctor.id,
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.alreadyApproved,
    };
  }

  if (doctor.onboardingStatus !== DOCTOR_PROFILE_ONBOARDING_STATUS.pendingAdminApproval) {
    return {
      doctorId: doctor.id,
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.notFound,
    };
  }

  const approvedDoctor = await doctorProfileApprovalDatabase.doctor.update({
    data: {
      isActive: true,
      isBookable: false,
      onboardingStatus: DOCTOR_PROFILE_ONBOARDING_STATUS.approved,
    },
    where: {
      id: doctor.id,
    },
  });

  await doctorProfileApprovalDatabase.auditEvent.create({
    data: {
      action: DOCTOR_PROFILE_APPROVED_AUDIT_ACTION,
      actorUserId: context.user.id,
      metadata: {
        source: DOCTOR_PROFILE_APPROVED_AUDIT_SOURCE,
      },
      organizationId: context.membership.organizationId,
      targetId: approvedDoctor.id,
      targetType: DOCTOR_PROFILE_APPROVED_AUDIT_TARGET_TYPE,
    },
  });

  return {
    doctorId: approvedDoctor.id,
    status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.approved,
  };
};

export {
  approveDoctorProfileForCurrentAdmin,
  getDefaultDoctorProfileApprovalDatabase,
  getPendingDoctorApprovalsForCurrentAdmin,
};
