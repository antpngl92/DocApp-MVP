import { notFound } from "next/navigation";

import { CURRENT_AUTHENTICATED_USER_STATUS } from "./consts";
import { getCurrentAuthenticatedUser } from "./current-user";
import type {
  DashboardRoleAccessDatabase,
  RequireDashboardRoleAccessOptions,
  StaffMemberRole,
} from "./type";
import { hasActiveStaffAccess } from "./admin-access";

const getDefaultDashboardRoleAccessDatabase = async (): Promise<DashboardRoleAccessDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const requireDashboardRoleAccess = async ({
  allowedRoles,
  authReader,
  database,
}: RequireDashboardRoleAccessOptions) => {
  const dashboardDatabase = database ?? (await getDefaultDashboardRoleAccessDatabase());
  const currentUser = await getCurrentAuthenticatedUser({
    authReader,
    database: dashboardDatabase,
  });

  if (currentUser.status !== CURRENT_AUTHENTICATED_USER_STATUS.authenticated) {
    notFound();
  }

  const membership = await dashboardDatabase.organizationMember.findUnique({
    where: {
      userId: currentUser.user.id,
    },
  });

  if (!hasActiveStaffAccess(membership)) {
    notFound();
  }

  if (!allowedRoles.includes(membership.role as StaffMemberRole)) {
    notFound();
  }

  return {
    membership,
    user: currentUser.user,
  };
};

export { getDefaultDashboardRoleAccessDatabase, requireDashboardRoleAccess };
