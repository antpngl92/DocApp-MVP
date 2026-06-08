import { notFound } from "next/navigation";
import { describe, expect, it, vi } from "vitest";

import { hasOwnerAdminAccess, requireOwnerAdminAccess } from "../admin-access";
import { OWNER_BOOTSTRAP_MEMBERSHIP_STATUS, OWNER_BOOTSTRAP_ROLE } from "../owner-bootstrap";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

describe("hasOwnerAdminAccess", () => {
  it("allows only active owner or admin memberships", () => {
    expect(
      hasOwnerAdminAccess({
        role: OWNER_BOOTSTRAP_ROLE.owner,
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
      }),
    ).toBe(true);
    expect(
      hasOwnerAdminAccess({
        role: OWNER_BOOTSTRAP_ROLE.admin,
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
      }),
    ).toBe(true);
    expect(
      hasOwnerAdminAccess({
        role: "manager",
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
      }),
    ).toBe(false);
    expect(hasOwnerAdminAccess({ role: OWNER_BOOTSTRAP_ROLE.owner, status: "disabled" })).toBe(
      false,
    );
    expect(hasOwnerAdminAccess(null)).toBe(false);
  });
});

describe("requireOwnerAdminAccess", () => {
  it("throws a not-found boundary for users without active owner/admin access", () => {
    expect(() => requireOwnerAdminAccess({ membership: null })).toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalledTimes(1);
  });
});
