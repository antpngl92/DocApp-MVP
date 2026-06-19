"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/config/routes";
import { DOCTOR_PROFILE_APPROVAL_RESULT_STATUS } from "@/server/auth/consts";
import { approveDoctorProfileForCurrentAdmin } from "@/server/auth/doctor-profile-approval";

const approveDoctorProfileAction = async (doctorId: string) => {
  const result = await approveDoctorProfileForCurrentAdmin({
    doctorId,
  });

  if (
    result.status !== DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.approved &&
    result.status !== DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.alreadyApproved
  ) {
    throw new Error("Doctor profile could not be approved.");
  }

  revalidatePath(ROUTES.dashboard);
};

export { approveDoctorProfileAction };
