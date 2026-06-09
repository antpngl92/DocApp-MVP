import { STAFF_INVITATION_ROLE_VALUES } from "./consts";
import type { StaffInvitationRoleOption, StaffInvitationRoleValue } from "./types";

const isStaffInvitationRoleValue = (role: unknown): role is StaffInvitationRoleValue => {
  return STAFF_INVITATION_ROLE_VALUES.includes(role as StaffInvitationRoleValue);
};

const getStaffInvitationRoleOptions = (
  getRoleLabel: (role: StaffInvitationRoleValue) => string,
): readonly StaffInvitationRoleOption[] => {
  return STAFF_INVITATION_ROLE_VALUES.map((role) => ({
    label: getRoleLabel(role),
    value: role,
  }));
};

export { getStaffInvitationRoleOptions, isStaffInvitationRoleValue };
