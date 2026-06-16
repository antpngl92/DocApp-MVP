import {
  CLERK_INVITATION_STATUS,
  CURRENT_AUTHENTICATED_USER_STATUS,
  ORGANIZATION_STATUS,
  STAFF_INVITATION_AUDIT_ACTION,
  STAFF_INVITATION_AUDIT_SOURCE,
  STAFF_INVITATION_AUDIT_TARGET_TYPE,
  STAFF_INVITATION_EMAIL_PATTERN,
  STAFF_INVITATION_RESULT_STATUS,
  STAFF_MEMBER_STATUS,
} from "./consts";
import { hasOwnerAdminAccess } from "./admin-access";
import { getCurrentAuthenticatedUser } from "./current-user";
import type {
  ClerkInvitationCreateResult,
  ClerkInvitationRevoker,
  CreateStaffInvitationOptions,
  StaffInvitationDatabase,
  StaffInvitationPendingMembership,
  StaffInvitationResult,
  StaffInvitationResultStatus,
} from "./type";
import {
  createClerkStaffInvitation,
  getDefaultStaffInvitationDatabase,
  getStaffInvitationRedirectUrl,
  isInvitableStaffMemberRole,
  isUniqueConstraintError,
  normalizeEmail,
  revokeClerkStaffInvitation,
} from "./utils";

const isValidStaffInvitationEmail = (email: string): boolean => {
  return STAFF_INVITATION_EMAIL_PATTERN.test(normalizeEmail(email));
};

const findExistingStaffInvitationMembership = async ({
  database,
  invitedEmail,
  organizationId,
}: {
  database: StaffInvitationDatabase;
  invitedEmail: string;
  organizationId: string;
}): Promise<StaffInvitationPendingMembership | null> => {
  return database.organizationMember.findFirst({
    where: {
      invitedEmail,
      organizationId,
      status: {
        in: [STAFF_MEMBER_STATUS.active, STAFF_MEMBER_STATUS.invited],
      },
    },
  });
};

const toAlreadyInvitedResult = ({
  membership,
  organizationId,
}: {
  membership: StaffInvitationPendingMembership;
  organizationId: string;
}): StaffInvitationResult => {
  return {
    clerkInvitationId: membership.clerkInvitationId,
    membershipId: membership.id,
    organizationId,
    status: STAFF_INVITATION_RESULT_STATUS.alreadyInvited,
  };
};

const rollbackPendingMembershipAfterClerkFailure = async ({
  database,
  membershipId,
}: {
  database: StaffInvitationDatabase;
  membershipId: string;
}): Promise<void> => {
  await database.organizationMember.delete({
    where: {
      id: membershipId,
    },
  });
};

const rollbackSentInvitationAfterTrackingFailure = async ({
  database,
  invitationId,
  invitationRevoker,
  membershipId,
}: {
  database: StaffInvitationDatabase;
  invitationId: string | null;
  invitationRevoker: ClerkInvitationRevoker;
  membershipId: string;
}): Promise<void> => {
  if (invitationId) {
    await invitationRevoker(invitationId);
  }

  await rollbackPendingMembershipAfterClerkFailure({
    database,
    membershipId,
  });
};

const createStaffInvitation = async ({
  authReader,
  database,
  email,
  invitationCreator = createClerkStaffInvitation,
  invitationRevoker = revokeClerkStaffInvitation,
  role,
}: CreateStaffInvitationOptions): Promise<StaffInvitationResult> => {
  const staffInvitationDatabase: StaffInvitationDatabase =
    database ?? (await getDefaultStaffInvitationDatabase());
  const normalizedEmail = normalizeEmail(email);

  if (!isValidStaffInvitationEmail(normalizedEmail)) {
    return {
      clerkInvitationId: null,
      membershipId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.invalidEmail,
    };
  }

  if (!isInvitableStaffMemberRole(role)) {
    return {
      clerkInvitationId: null,
      membershipId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.invalidRole,
    };
  }

  const currentUser = await getCurrentAuthenticatedUser({
    authReader,
    database: staffInvitationDatabase,
  });

  if (currentUser.status !== CURRENT_AUTHENTICATED_USER_STATUS.authenticated) {
    return {
      clerkInvitationId: null,
      membershipId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.unauthorized,
    };
  }

  const inviterMembership = await staffInvitationDatabase.organizationMember.findUnique({
    where: {
      userId: currentUser.user.id,
    },
  });

  if (!hasOwnerAdminAccess(inviterMembership)) {
    return {
      clerkInvitationId: null,
      membershipId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.unauthorized,
    };
  }

  const organization = await staffInvitationDatabase.organization.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    where: {
      status: ORGANIZATION_STATUS.active,
    },
  });

  if (!organization) {
    return {
      clerkInvitationId: null,
      membershipId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.noActiveOrganization,
    };
  }

  const existingMembership = await findExistingStaffInvitationMembership({
    database: staffInvitationDatabase,
    invitedEmail: normalizedEmail,
    organizationId: organization.id,
  });

  if (existingMembership) {
    return toAlreadyInvitedResult({
      membership: existingMembership,
      organizationId: organization.id,
    });
  }

  let pendingMembership: StaffInvitationPendingMembership;

  try {
    pendingMembership = await staffInvitationDatabase.organizationMember.create({
      data: {
        invitedEmail: normalizedEmail,
        organizationId: organization.id,
        role,
        status: STAFF_MEMBER_STATUS.invited,
      },
    });
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    const membershipCreatedByConcurrentRequest = await findExistingStaffInvitationMembership({
      database: staffInvitationDatabase,
      invitedEmail: normalizedEmail,
      organizationId: organization.id,
    });

    if (!membershipCreatedByConcurrentRequest) {
      throw error;
    }

    return toAlreadyInvitedResult({
      membership: membershipCreatedByConcurrentRequest,
      organizationId: organization.id,
    });
  }

  let invitation: ClerkInvitationCreateResult;

  try {
    invitation = await invitationCreator({
      emailAddress: normalizedEmail,
      redirectUrl: getStaffInvitationRedirectUrl(),
    });
  } catch (error) {
    // The Clerk email never went out, so the pending membership must not
    // keep blocking re-invites or staff activation by email match.
    await rollbackPendingMembershipAfterClerkFailure({
      database: staffInvitationDatabase,
      membershipId: pendingMembership.id,
    });

    throw error;
  }

  let trackedMembership: StaffInvitationPendingMembership;

  try {
    trackedMembership = await staffInvitationDatabase.organizationMember.update({
      data: {
        clerkInvitationId: invitation.id ?? null,
        clerkInvitationStatus: CLERK_INVITATION_STATUS.pending,
      },
      where: {
        id: pendingMembership.id,
      },
    });
  } catch (error) {
    // Clerk already created the external invitation. If local tracking fails,
    // revoke the external invitation when possible and remove the local
    // reservation so the admin can retry instead of leaving a broken invite.
    try {
      await rollbackSentInvitationAfterTrackingFailure({
        database: staffInvitationDatabase,
        invitationId: invitation.id ?? null,
        invitationRevoker,
        membershipId: pendingMembership.id,
      });
    } catch {
      // Preserve the original local tracking error; rollback failure needs
      // operational monitoring but should not hide the root failure.
    }

    throw error;
  }

  try {
    await staffInvitationDatabase.auditEvent.create({
      data: {
        action: STAFF_INVITATION_AUDIT_ACTION,
        actorUserId: currentUser.user.id,
        metadata: {
          email: normalizedEmail,
          role,
          source: STAFF_INVITATION_AUDIT_SOURCE,
        },
        organizationId: organization.id,
        targetId: trackedMembership.id,
        targetType: STAFF_INVITATION_AUDIT_TARGET_TYPE,
      },
    });
  } catch {
    // The invitation and local tracking are already complete. Audit failure
    // must be monitored, but it should not report a failed invite to the admin.
  }

  return {
    clerkInvitationId: trackedMembership.clerkInvitationId,
    membershipId: trackedMembership.id,
    organizationId: organization.id,
    status: STAFF_INVITATION_RESULT_STATUS.sent,
  };
};

export {
  STAFF_INVITATION_RESULT_STATUS,
  createStaffInvitation,
  getDefaultStaffInvitationDatabase,
  isValidStaffInvitationEmail,
};
export type {
  CreateStaffInvitationOptions,
  StaffInvitationDatabase,
  StaffInvitationResult,
  StaffInvitationResultStatus,
};
