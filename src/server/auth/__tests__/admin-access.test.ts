import { notFound } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  hasActiveStaffAccess,
  hasOwnerAdminAccess,
  requireActiveStaffAccess,
  requireOwnerAdminAccess,
} from "../admin-access";
import { STAFF_MEMBER_ROLE, STAFF_MEMBER_STATUS } from "../consts";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("hasActiveStaffAccess", () => {
  it("allows every supported active local staff role", () => {
    for (const role of Object.values(STAFF_MEMBER_ROLE)) {
      expect(
        hasActiveStaffAccess({
          role,
          status: STAFF_MEMBER_STATUS.active,
        }),
      ).toBe(true);
    }
  });

  it("rejects inactive, unknown, or missing local memberships", () => {
    expect(hasActiveStaffAccess({ role: STAFF_MEMBER_ROLE.admin, status: "disabled" })).toBe(false);
    expect(hasActiveStaffAccess({ role: "patient", status: STAFF_MEMBER_STATUS.active })).toBe(
      false,
    );
    expect(hasActiveStaffAccess(null)).toBe(false);
  });
});

describe("hasOwnerAdminAccess", () => {
  it("allows only active admin memberships", () => {
    expect(
      hasOwnerAdminAccess({
        role: STAFF_MEMBER_ROLE.admin,
        status: STAFF_MEMBER_STATUS.active,
      }),
    ).toBe(true);
    expect(
      hasOwnerAdminAccess({
        role: STAFF_MEMBER_ROLE.doctor,
        status: STAFF_MEMBER_STATUS.active,
      }),
    ).toBe(false);
    expect(hasOwnerAdminAccess({ role: STAFF_MEMBER_ROLE.admin, status: "disabled" })).toBe(false);
    expect(hasOwnerAdminAccess({ role: "patient", status: STAFF_MEMBER_STATUS.active })).toBe(
      false,
    );
    expect(hasOwnerAdminAccess(null)).toBe(false);
  });
});

describe("requireOwnerAdminAccess", () => {
  it("allows users with active owner/admin access", () => {
    expect(() =>
      requireOwnerAdminAccess({
        membership: {
          role: STAFF_MEMBER_ROLE.admin,
          status: STAFF_MEMBER_STATUS.active,
        },
      }),
    ).not.toThrow();

    expect(notFound).not.toHaveBeenCalled();
  });

  it("throws a not-found boundary for users without active owner/admin access", () => {
    expect(() => requireOwnerAdminAccess({ membership: null })).toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalledTimes(1);
  });
});

describe("requireActiveStaffAccess", () => {
  it("allows users with any active staff access", () => {
    expect(() =>
      requireActiveStaffAccess({
        membership: {
          role: STAFF_MEMBER_ROLE.doctor,
          status: STAFF_MEMBER_STATUS.active,
        },
      }),
    ).not.toThrow();

    expect(notFound).not.toHaveBeenCalled();
  });

  it("throws a not-found boundary for users without active staff access", () => {
    expect(() => requireActiveStaffAccess({ membership: null })).toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
