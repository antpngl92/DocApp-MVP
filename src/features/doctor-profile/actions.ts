"use server";

import { DOCTOR_PROFILE_CREATION_RESULT_STATUS } from "@/server/auth/consts";
import { createDoctorProfileForCurrentUser } from "@/server/auth/doctor-profile-onboarding";

import type { DoctorProfileOnboardingFormSubmitPayload } from "./components/DoctorProfileOnboardingForm/types";

const createDoctorProfileAction = async (
  payload: DoctorProfileOnboardingFormSubmitPayload,
) => {
  const result = await createDoctorProfileForCurrentUser(payload);

  if (
    result.status !== DOCTOR_PROFILE_CREATION_RESULT_STATUS.created &&
    result.status !== DOCTOR_PROFILE_CREATION_RESULT_STATUS.alreadyExists
  ) {
    throw new Error("Doctor profile could not be created.");
  }
};

export { createDoctorProfileAction };
