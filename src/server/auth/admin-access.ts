import { notFound } from "next/navigation";

import { OWNER_BOOTSTRAP_MEMBERSHIP_STATUS } from "./consts";
import type { AdminAccessMembership, RequireAdminAccessOptions } from "./type";
import { isOwnerBootstrapRole } from "./utils";

const hasOwnerAdminAccess = (membership: AdminAccessMembership | null): boolean => {
  return (
    membership?.status === OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active &&
    isOwnerBootstrapRole(membership.role)
  );
};

const requireOwnerAdminAccess = ({ membership }: RequireAdminAccessOptions) => {
  if (!hasOwnerAdminAccess(membership)) {
    notFound();
  }
};

export { hasOwnerAdminAccess, requireOwnerAdminAccess };
export type { AdminAccessMembership, RequireAdminAccessOptions };
