import { EMAIL_PATTERN } from "@/lib/validation";

const CURRENT_AUTHENTICATED_USER_STATUS = {
  authenticated: "authenticated",
  missingLocalUser: "missing_local_user",
  signedOut: "signed_out",
} as const;

const OWNER_BOOTSTRAP_METADATA_NAMESPACE = "docapp";
const OWNER_BOOTSTRAP_METADATA_ROLE_KEY = "bootstrapRole";
const OWNER_BOOTSTRAP_AUDIT_ACTION = "owner_admin_bootstrapped";
const OWNER_BOOTSTRAP_AUDIT_SOURCE = "clerk_private_metadata";
const OWNER_BOOTSTRAP_AUDIT_TARGET_TYPE = "OrganizationMember";

const OWNER_BOOTSTRAP_ROLE = {
  admin: "admin",
  owner: "owner",
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
  doctor: "doctor",
  manager: "manager",
  owner: "owner",
  receptionist: "receptionist",
} as const;

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
  invalidEmail: "invalid_email",
  invalidRole: "invalid_role",
  noActiveOrganization: "no_active_organization",
  sent: "sent",
  unauthorized: "unauthorized",
} as const;

export {
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
  STAFF_MEMBER_ROLE,
  STAFF_MEMBER_STATUS,
  STAFF_INVITATION_EMAIL_PATTERN,
  STAFF_INVITATION_RESULT_STATUS,
  STAFF_ONBOARDING_AUDIT_ACTION,
  STAFF_ONBOARDING_AUDIT_SOURCE,
  STAFF_ONBOARDING_AUDIT_TARGET_TYPE,
  STAFF_ONBOARDING_STATUS,
};
