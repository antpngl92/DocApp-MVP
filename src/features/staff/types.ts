import type { STAFF_INVITATION_ROLE_VALUES } from "./consts";

type StaffInvitationRoleValue = (typeof STAFF_INVITATION_ROLE_VALUES)[number];

type StaffInvitationRoleOption = Readonly<{
  label: string;
  value: StaffInvitationRoleValue;
}>;

export type { StaffInvitationRoleOption, StaffInvitationRoleValue };
