import { EMAIL_PATTERN } from "@/lib/validation";

const CURRENT_AUTHENTICATED_USER_STATUS = {
  authenticated: "authenticated",
  missingLocalUser: "missing_local_user",
  signedOut: "signed_out",
} as const;

const PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

const OWNER_BOOTSTRAP_METADATA_NAMESPACE = "docapp";
const OWNER_BOOTSTRAP_METADATA_ROLE_KEY = "bootstrapRole";
const OWNER_BOOTSTRAP_AUDIT_ACTION = "owner_admin_bootstrapped";
const OWNER_BOOTSTRAP_AUDIT_SOURCE = "clerk_private_metadata";
const OWNER_BOOTSTRAP_AUDIT_TARGET_TYPE = "OrganizationMember";

const OWNER_BOOTSTRAP_ROLE = {
  admin: "admin",
} as const;

const OWNER_BOOTSTRAP_MEMBERSHIP_STATUS = {
  active: "active",
} as const;

const OWNER_BOOTSTRAP_STATUS = {
  bootstrapped: "bootstrapped",
  existingMembership: "existing_membership",
  invalidClerkUser: "invalid_clerk_user",
  invalidRole: "invalid_role",
  noActiveOrganization: "no_active_organization",
  noBootstrapMetadata: "no_bootstrap_metadata",
  signedOut: "signed_out",
} as const;

const STAFF_MEMBER_ROLE = {
  admin: "admin",
  receptionist: "receptionist",
} as const;

const STAFF_MEMBER_ROLE_VALUES = [STAFF_MEMBER_ROLE.admin, STAFF_MEMBER_ROLE.receptionist] as const;

const STAFF_INVITABLE_ROLE_VALUES = [
  STAFF_MEMBER_ROLE.admin,
  STAFF_MEMBER_ROLE.receptionist,
] as const;

const STAFF_OWNER_ADMIN_ROLE_VALUES = [STAFF_MEMBER_ROLE.admin] as const;

const STAFF_DASHBOARD_ROLE_VALUES = [
  STAFF_MEMBER_ROLE.admin,
  STAFF_MEMBER_ROLE.receptionist,
] as const;

const STAFF_APPOINTMENT_OPERATOR_ROLE_VALUES = [
  STAFF_MEMBER_ROLE.admin,
  STAFF_MEMBER_ROLE.receptionist,
] as const;

const STAFF_MEMBER_STATUS = {
  active: "active",
  disabled: "disabled",
  invited: "invited",
  removed: "removed",
} as const;

const STAFF_ONBOARDING_AUDIT_ACTION = "staff_membership_activated";
const STAFF_ONBOARDING_AUDIT_SOURCE = "clerk_invitation";
const STAFF_ONBOARDING_AUDIT_TARGET_TYPE = "OrganizationMember";

const STAFF_ONBOARDING_STATUS = {
  activated: "activated",
  alreadyActive: "already_active",
  disabledOrRemoved: "disabled_or_removed",
  emailMismatch: "email_mismatch",
  missingLocalUser: "missing_local_user",
  noPendingInvitation: "no_pending_invitation",
  signedOut: "signed_out",
} as const;

const ORGANIZATION_STATUS = {
  active: "active",
} as const;

const STAFF_INVITATION_EMAIL_PATTERN = EMAIL_PATTERN;

const STAFF_INVITATION_RESULT_STATUS = {
  alreadyInvited: "already_invited",
  invalidEmail: "invalid_email",
  invalidRole: "invalid_role",
  noActiveOrganization: "no_active_organization",
  sent: "sent",
  unauthorized: "unauthorized",
} as const;

const CLERK_INVITATION_STATUS = {
  accepted: "accepted",
  expired: "expired",
  pending: "pending",
  revoked: "revoked",
} as const;

const STAFF_INVITATION_AUDIT_ACTION = "staff_invitation_created";
const STAFF_INVITATION_AUDIT_SOURCE = "admin_staff_invitation";
const STAFF_INVITATION_AUDIT_TARGET_TYPE = "OrganizationMember";

export {
  CLERK_INVITATION_STATUS,
  CURRENT_AUTHENTICATED_USER_STATUS,
  OWNER_BOOTSTRAP_AUDIT_ACTION,
  OWNER_BOOTSTRAP_AUDIT_SOURCE,
  OWNER_BOOTSTRAP_AUDIT_TARGET_TYPE,
  OWNER_BOOTSTRAP_MEMBERSHIP_STATUS,
  OWNER_BOOTSTRAP_METADATA_NAMESPACE,
  OWNER_BOOTSTRAP_METADATA_ROLE_KEY,
  ORGANIZATION_STATUS,
  OWNER_BOOTSTRAP_ROLE,
  OWNER_BOOTSTRAP_STATUS,
  PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE,
  STAFF_MEMBER_ROLE,
  STAFF_INVITABLE_ROLE_VALUES,
  STAFF_MEMBER_STATUS,
  STAFF_MEMBER_ROLE_VALUES,
  STAFF_OWNER_ADMIN_ROLE_VALUES,
  STAFF_INVITATION_AUDIT_ACTION,
  STAFF_INVITATION_AUDIT_SOURCE,
  STAFF_INVITATION_AUDIT_TARGET_TYPE,
  STAFF_INVITATION_EMAIL_PATTERN,
  STAFF_INVITATION_RESULT_STATUS,
  STAFF_APPOINTMENT_OPERATOR_ROLE_VALUES,
  STAFF_DASHBOARD_ROLE_VALUES,
  STAFF_ONBOARDING_AUDIT_ACTION,
  STAFF_ONBOARDING_AUDIT_SOURCE,
  STAFF_ONBOARDING_AUDIT_TARGET_TYPE,
  STAFF_ONBOARDING_STATUS,
};
