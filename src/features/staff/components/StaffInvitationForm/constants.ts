import { EMAIL_PATTERN } from "@/lib/validation";

import type { StaffInvitationRoleValue } from "../../types";

const DEFAULT_STAFF_INVITATION_ROLE: StaffInvitationRoleValue = "receptionist";
const STAFF_INVITATION_EMAIL_PATTERN = EMAIL_PATTERN;

export { DEFAULT_STAFF_INVITATION_ROLE, STAFF_INVITATION_EMAIL_PATTERN };
