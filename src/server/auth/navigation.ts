import {
  PUBLIC_NAVIGATION,
  PUBLIC_SIGNED_IN_ADMIN_NAVIGATION,
  PUBLIC_SIGNED_IN_PATIENT_NAVIGATION,
} from "@/config/navigation";
import { ROUTES } from "@/config/routes";

import { hasOwnerAdminAccess } from "./admin-access";
import { CURRENT_AUTHENTICATED_USER_STATUS, STAFF_MEMBER_STATUS } from "./consts";
import { getCurrentAuthenticatedUser } from "./current-user";
import type { GetPublicNavigationForCurrentUserOptions, PublicNavigationDatabase } from "./type";

const getDefaultPublicNavigationDatabase = async (): Promise<PublicNavigationDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const getPublicNavigationForCurrentUser = async ({
  authReader,
  database,
}: GetPublicNavigationForCurrentUserOptions = {}) => {
  const publicNavigationDatabase = database ?? (await getDefaultPublicNavigationDatabase());
  const currentUser = await getCurrentAuthenticatedUser({
    authReader,
    database: publicNavigationDatabase,
  });

  if (currentUser.status === CURRENT_AUTHENTICATED_USER_STATUS.signedOut) {
    return PUBLIC_NAVIGATION;
  }

  if (currentUser.status === CURRENT_AUTHENTICATED_USER_STATUS.missingLocalUser) {
    return PUBLIC_SIGNED_IN_PATIENT_NAVIGATION;
  }

  const membership = await publicNavigationDatabase.organizationMember.findUnique({
    where: {
      userId: currentUser.user.id,
    },
  });

  return membership?.status === STAFF_MEMBER_STATUS.active
    ? PUBLIC_SIGNED_IN_ADMIN_NAVIGATION
    : PUBLIC_SIGNED_IN_PATIENT_NAVIGATION;
};

const getAuthenticatedHomeForCurrentUser = async ({
  authReader,
  database,
}: GetPublicNavigationForCurrentUserOptions = {}) => {
  const publicNavigationDatabase = database ?? (await getDefaultPublicNavigationDatabase());
  const currentUser = await getCurrentAuthenticatedUser({
    authReader,
    database: publicNavigationDatabase,
  });

  if (currentUser.status !== CURRENT_AUTHENTICATED_USER_STATUS.authenticated) {
    return ROUTES.patientAccount;
  }

  const membership = await publicNavigationDatabase.organizationMember.findUnique({
    where: {
      userId: currentUser.user.id,
    },
  });

  return hasOwnerAdminAccess(membership) ? ROUTES.admin : ROUTES.patientAccount;
};

export {
  getAuthenticatedHomeForCurrentUser,
  getDefaultPublicNavigationDatabase,
  getPublicNavigationForCurrentUser,
};
export type { GetPublicNavigationForCurrentUserOptions, PublicNavigationDatabase };
