import {
  CURRENT_AUTHENTICATED_USER_STATUS,
  ORGANIZATION_STATUS,
  STAFF_INVITATION_EMAIL_PATTERN,
  STAFF_INVITATION_RESULT_STATUS,
  STAFF_MEMBER_ROLE,
} from "./consts";
import { hasOwnerAdminAccess } from "./admin-access";
import { getCurrentAuthenticatedUser } from "./current-user";
import type {
  CreateStaffInvitationOptions,
  StaffInvitationDatabase,
  StaffInvitationResult,
  StaffInvitationResultStatus,
} from "./type";
import {
  createClerkStaffInvitation,
  getDefaultStaffInvitationDatabase,
  getStaffInvitationRedirectUrl,
  isStaffMemberRole,
  normalizeEmail,
} from "./utils";

const isValidStaffInvitationEmail = (email: string): boolean => {
  return STAFF_INVITATION_EMAIL_PATTERN.test(normalizeEmail(email));
};

const createStaffInvitation = async ({
  authReader,
  database,
  email,
  invitationCreator = createClerkStaffInvitation,
  role,
}: CreateStaffInvitationOptions): Promise<StaffInvitationResult> => {
  const staffInvitationDatabase: StaffInvitationDatabase =
    database ?? (await getDefaultStaffInvitationDatabase());
  const normalizedEmail = normalizeEmail(email);

  if (!isValidStaffInvitationEmail(normalizedEmail)) {
    return {
      clerkInvitationId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.invalidEmail,
    };
  }

  if (!isStaffMemberRole(role) || role === STAFF_MEMBER_ROLE.owner) {
    return {
      clerkInvitationId: null,
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
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.noActiveOrganization,
    };
  }

  const invitation = await invitationCreator({
    emailAddress: normalizedEmail,
    redirectUrl: getStaffInvitationRedirectUrl(),
  });

  return {
    clerkInvitationId: invitation.id ?? null,
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
