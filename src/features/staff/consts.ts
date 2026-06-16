import { STAFF_INVITABLE_ROLE_VALUES } from "@/server/auth/consts";
import type { StaffMemberRole } from "@/server/auth/type";

const STAFF_INVITATION_ROLE_VALUES =
  STAFF_INVITABLE_ROLE_VALUES satisfies readonly StaffMemberRole[];

export { STAFF_INVITATION_ROLE_VALUES };
