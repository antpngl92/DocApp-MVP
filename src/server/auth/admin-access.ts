import { notFound } from "next/navigation";

import { STAFF_MEMBER_STATUS, STAFF_OWNER_ADMIN_ROLE_VALUES } from "./consts";
import type { AdminAccessMembership, RequireAdminAccessOptions } from "./type";
import { isStaffMemberRole } from "./utils";

const hasActiveStaffAccess = (
  membership: AdminAccessMembership | null,
): membership is AdminAccessMembership => {
  return membership?.status === STAFF_MEMBER_STATUS.active && isStaffMemberRole(membership.role);
};

const hasOwnerAdminAccess = (membership: AdminAccessMembership | null): boolean => {
  if (!hasActiveStaffAccess(membership)) {
    return false;
  }

  return STAFF_OWNER_ADMIN_ROLE_VALUES.includes(
    membership.role as (typeof STAFF_OWNER_ADMIN_ROLE_VALUES)[number],
  );
};

const requireActiveStaffAccess = ({ membership }: RequireAdminAccessOptions) => {
  if (!hasActiveStaffAccess(membership)) {
    notFound();
  }
};

const requireOwnerAdminAccess = ({ membership }: RequireAdminAccessOptions) => {
  if (!hasOwnerAdminAccess(membership)) {
    notFound();
  }
};

export {
  hasActiveStaffAccess,
  hasOwnerAdminAccess,
  requireActiveStaffAccess,
  requireOwnerAdminAccess,
};
export type { AdminAccessMembership, RequireAdminAccessOptions };
