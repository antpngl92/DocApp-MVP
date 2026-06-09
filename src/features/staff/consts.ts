import { STAFF_MEMBER_ROLE } from "@/server/auth/consts";
import type { StaffMemberRole } from "@/server/auth/type";

const STAFF_INVITATION_ROLE_VALUES = [
  STAFF_MEMBER_ROLE.admin,
  STAFF_MEMBER_ROLE.manager,
  STAFF_MEMBER_ROLE.receptionist,
  STAFF_MEMBER_ROLE.doctor,
] as const satisfies readonly StaffMemberRole[];

export { STAFF_INVITATION_ROLE_VALUES };
