"use server";

import { createStaffInvitation } from "@/server/auth/staff-invitation";
import { STAFF_INVITATION_RESULT_STATUS } from "@/server/auth/consts";

import type { StaffInvitationFormSubmitPayload } from "./components/StaffInvitationForm/types";

const createStaffInvitationAction = async (payload: StaffInvitationFormSubmitPayload) => {
  const result = await createStaffInvitation(payload);

  if (result.status !== STAFF_INVITATION_RESULT_STATUS.sent) {
    throw new Error("Staff invitation could not be sent.");
  }
};

export { createStaffInvitationAction };
