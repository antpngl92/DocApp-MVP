import { describe, expect, it } from "vitest";

import { STAFF_MEMBER_ROLE } from "@/server/auth/consts";

import { STAFF_INVITATION_ROLE_VALUES } from "../consts";
import { getStaffInvitationRoleOptions, isStaffInvitationRoleValue } from "../utils";

describe("staff invitation role options", () => {
  it("allows owner/admin to select only inviteable staff roles", () => {
    expect(STAFF_INVITATION_ROLE_VALUES).toEqual([
      STAFF_MEMBER_ROLE.admin,
      STAFF_MEMBER_ROLE.receptionist,
      STAFF_MEMBER_ROLE.doctor,
    ]);
  });

  it("maps inviteable roles to localized role options", () => {
    expect(getStaffInvitationRoleOptions((role) => `role.${role}`)).toEqual([
      { label: "role.admin", value: STAFF_MEMBER_ROLE.admin },
      { label: "role.receptionist", value: STAFF_MEMBER_ROLE.receptionist },
      { label: "role.doctor", value: STAFF_MEMBER_ROLE.doctor },
    ]);
  });

  it("checks whether a value is an allowed invitation role", () => {
    expect(isStaffInvitationRoleValue(STAFF_MEMBER_ROLE.doctor)).toBe(true);
    expect(isStaffInvitationRoleValue("manager")).toBe(false);
    expect(isStaffInvitationRoleValue("owner")).toBe(false);
    expect(isStaffInvitationRoleValue("patient")).toBe(false);
  });
});
