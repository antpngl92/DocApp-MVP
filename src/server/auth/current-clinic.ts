import { notFound } from "next/navigation";

import { hasActiveStaffAccess } from "./admin-access";
import { CURRENT_AUTHENTICATED_USER_STATUS, ORGANIZATION_STATUS } from "./consts";
import { getCurrentAuthenticatedUser } from "./current-user";
import type {
  CurrentClinicAccessDatabase,
  CurrentClinicAccessResult,
  RequireCurrentClinicAccessOptions,
} from "./type";

const getDefaultCurrentClinicAccessDatabase = async (): Promise<CurrentClinicAccessDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const requireCurrentClinicForCurrentUser = async ({
  authReader,
  database,
}: RequireCurrentClinicAccessOptions = {}): Promise<CurrentClinicAccessResult> => {
  const currentClinicDatabase = database ?? (await getDefaultCurrentClinicAccessDatabase());
  const currentUser = await getCurrentAuthenticatedUser({
    authReader,
    database: currentClinicDatabase,
  });

  if (currentUser.status !== CURRENT_AUTHENTICATED_USER_STATUS.authenticated) {
    notFound();
  }

  const membership = await currentClinicDatabase.organizationMember.findUnique({
    where: {
      userId: currentUser.user.id,
    },
  });
  const activeMembership = hasActiveStaffAccess(membership) ? membership : null;

  const clinic = await currentClinicDatabase.organization.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    where: {
      ...(activeMembership?.organizationId ? { id: activeMembership.organizationId } : {}),
      status: ORGANIZATION_STATUS.active,
    },
  });

  if (!clinic) {
    notFound();
  }

  return {
    clinic,
    membership: activeMembership,
    user: currentUser.user,
  };
};

const requireCurrentClinicMembershipForCurrentUser = async (
  options: RequireCurrentClinicAccessOptions = {},
): Promise<CurrentClinicAccessResult> => {
  const clinicAccess = await requireCurrentClinicForCurrentUser(options);

  if (!clinicAccess.membership) {
    notFound();
  }

  return clinicAccess;
};

export {
  getDefaultCurrentClinicAccessDatabase,
  requireCurrentClinicForCurrentUser,
  requireCurrentClinicMembershipForCurrentUser,
};
export type {
  CurrentClinicAccessDatabase,
  CurrentClinicAccessResult,
  RequireCurrentClinicAccessOptions,
};
