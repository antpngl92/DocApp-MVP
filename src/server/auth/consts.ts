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

export {
  CURRENT_AUTHENTICATED_USER_STATUS,
  OWNER_BOOTSTRAP_AUDIT_ACTION,
  OWNER_BOOTSTRAP_AUDIT_SOURCE,
  OWNER_BOOTSTRAP_AUDIT_TARGET_TYPE,
  OWNER_BOOTSTRAP_MEMBERSHIP_STATUS,
  OWNER_BOOTSTRAP_METADATA_NAMESPACE,
  OWNER_BOOTSTRAP_METADATA_ROLE_KEY,
  OWNER_BOOTSTRAP_ROLE,
  OWNER_BOOTSTRAP_STATUS,
};
