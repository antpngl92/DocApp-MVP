import { notFound } from "next/navigation";

import { hasActiveStaffAccess } from "./admin-access";
import { CURRENT_AUTHENTICATED_USER_STATUS } from "./consts";
import { getCurrentAuthenticatedUser } from "./current-user";
import type {
  PatientProfileAccessDatabase,
  PatientProfileAccessResult,
  RequirePatientProfileAccessOptions,
} from "./type";

const getDefaultPatientProfileAccessDatabase = async (): Promise<PatientProfileAccessDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const requirePatientProfileAccessForCurrentUser = async ({
  authReader,
  database,
}: RequirePatientProfileAccessOptions = {}): Promise<PatientProfileAccessResult> => {
  const patientProfileDatabase = database ?? (await getDefaultPatientProfileAccessDatabase());
  const currentUser = await getCurrentAuthenticatedUser({
    authReader,
    database: patientProfileDatabase,
  });

  if (currentUser.status !== CURRENT_AUTHENTICATED_USER_STATUS.authenticated) {
    notFound();
  }

  const membership = await patientProfileDatabase.organizationMember.findUnique({
    where: {
      userId: currentUser.user.id,
    },
  });

  if (hasActiveStaffAccess(membership)) {
    notFound();
  }

  const existingPatientProfile = await patientProfileDatabase.patientProfile.findUnique({
    where: {
      userId: currentUser.user.id,
    },
  });

  const patientProfile =
    existingPatientProfile ??
    (await patientProfileDatabase.patientProfile.create({
      data: {
        email: currentUser.user.email,
        name: currentUser.user.name,
        userId: currentUser.user.id,
      },
    }));

  return {
    patientProfile,
    user: currentUser.user,
  };
};

export { getDefaultPatientProfileAccessDatabase, requirePatientProfileAccessForCurrentUser };
export type {
  PatientProfileAccessDatabase,
  PatientProfileAccessResult,
  RequirePatientProfileAccessOptions,
};
