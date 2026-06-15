import {
  CLERK_INVITATION_STATUS,
  CURRENT_AUTHENTICATED_USER_STATUS,
  STAFF_MEMBER_STATUS,
  STAFF_ONBOARDING_AUDIT_ACTION,
  STAFF_ONBOARDING_AUDIT_SOURCE,
  STAFF_ONBOARDING_AUDIT_TARGET_TYPE,
  STAFF_ONBOARDING_STATUS,
} from "./consts";
import { getCurrentAuthenticatedUser } from "./current-user";
import type {
  ActivateStaffInvitationOptions,
  LocalUserRecord,
  StaffOnboardingDatabase,
  StaffOnboardingResult,
} from "./type";
import {
  isStaffMemberRole,
  normalizeEmail,
  readClerkBootstrapProfile,
  upsertLocalUserFromClerkProfile,
} from "./utils";

const getDefaultStaffOnboardingDatabase = async (): Promise<StaffOnboardingDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const activateStaffInvitationForCurrentUser = async ({
  authReader,
  clerkProfileReader = readClerkBootstrapProfile,
  database,
}: ActivateStaffInvitationOptions = {}): Promise<StaffOnboardingResult> => {
  const staffOnboardingDatabase = database ?? (await getDefaultStaffOnboardingDatabase());
  const currentUser = await getCurrentAuthenticatedUser({
    authReader,
    database: staffOnboardingDatabase,
  });

  if (currentUser.status === CURRENT_AUTHENTICATED_USER_STATUS.signedOut) {
    return {
      membership: null,
      status: STAFF_ONBOARDING_STATUS.signedOut,
    };
  }

  let localUser: LocalUserRecord | null =
    currentUser.status === CURRENT_AUTHENTICATED_USER_STATUS.authenticated
      ? currentUser.user
      : null;

  if (currentUser.status === CURRENT_AUTHENTICATED_USER_STATUS.missingLocalUser) {
    const clerkProfile = await clerkProfileReader(currentUser.clerkUserId);

    if (!clerkProfile.localUserInput) {
      return {
        membership: null,
        status: STAFF_ONBOARDING_STATUS.missingLocalUser,
      };
    }

    localUser = await upsertLocalUserFromClerkProfile(
      staffOnboardingDatabase,
      clerkProfile.localUserInput,
    );
  }

  if (!localUser) {
    return {
      membership: null,
      status: STAFF_ONBOARDING_STATUS.missingLocalUser,
    };
  }

  const existingMembership = await staffOnboardingDatabase.organizationMember.findUnique({
    where: {
      userId: localUser.id,
    },
  });

  if (existingMembership?.status === STAFF_MEMBER_STATUS.active) {
    return {
      membership: existingMembership,
      status: STAFF_ONBOARDING_STATUS.alreadyActive,
    };
  }

  if (
    existingMembership?.status === STAFF_MEMBER_STATUS.disabled ||
    existingMembership?.status === STAFF_MEMBER_STATUS.removed
  ) {
    return {
      membership: existingMembership,
      status: STAFF_ONBOARDING_STATUS.disabledOrRemoved,
    };
  }

  const normalizedEmail = normalizeEmail(localUser.email);
  const pendingInvitation = await staffOnboardingDatabase.organizationMember.findFirst({
    where: {
      invitedEmail: normalizedEmail,
      status: STAFF_MEMBER_STATUS.invited,
    },
  });

  if (!pendingInvitation) {
    return {
      membership: null,
      status: STAFF_ONBOARDING_STATUS.noPendingInvitation,
    };
  }

  if (
    !pendingInvitation.invitedEmail ||
    normalizeEmail(pendingInvitation.invitedEmail) !== normalizedEmail
  ) {
    return {
      membership: pendingInvitation,
      status: STAFF_ONBOARDING_STATUS.emailMismatch,
    };
  }

  if (!isStaffMemberRole(pendingInvitation.role)) {
    return {
      membership: pendingInvitation,
      status: STAFF_ONBOARDING_STATUS.noPendingInvitation,
    };
  }

  const activatedMembership = await staffOnboardingDatabase.organizationMember.update({
    data: {
      clerkInvitationStatus: CLERK_INVITATION_STATUS.accepted,
      status: STAFF_MEMBER_STATUS.active,
      userId: localUser.id,
    },
    where: {
      id: pendingInvitation.id,
    },
  });

  await staffOnboardingDatabase.auditEvent.create({
    data: {
      action: STAFF_ONBOARDING_AUDIT_ACTION,
      actorUserId: localUser.id,
      metadata: {
        email: normalizedEmail,
        role: pendingInvitation.role,
        source: STAFF_ONBOARDING_AUDIT_SOURCE,
      },
      organizationId: pendingInvitation.organizationId,
      targetId: pendingInvitation.id,
      targetType: STAFF_ONBOARDING_AUDIT_TARGET_TYPE,
    },
  });

  return {
    membership: activatedMembership,
    status: STAFF_ONBOARDING_STATUS.activated,
  };
};

export { activateStaffInvitationForCurrentUser, getDefaultStaffOnboardingDatabase };
export type { ActivateStaffInvitationOptions, StaffOnboardingDatabase, StaffOnboardingResult };
