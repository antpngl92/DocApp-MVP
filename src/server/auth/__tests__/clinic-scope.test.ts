import { beforeEach, describe, expect, it, vi } from "vitest";

import { hasClinicRecordAccess, requireClinicRecordAccess } from "../clinic-scope";

const navigationState = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: navigationState.notFound,
}));

describe("clinic scope guards", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows records that belong to the expected organization", () => {
    const record = {
      id: "doctor_123",
      organizationId: "org_123",
    };

    expect(
      hasClinicRecordAccess({
        expectedOrganizationId: "org_123",
        record,
      }),
    ).toBe(true);

    expect(
      requireClinicRecordAccess({
        expectedOrganizationId: "org_123",
        record,
      }),
    ).toBe(record);
  });

  it("rejects missing or cross-organization records", () => {
    expect(
      hasClinicRecordAccess({
        expectedOrganizationId: "org_123",
        record: null,
      }),
    ).toBe(false);

    expect(
      hasClinicRecordAccess({
        expectedOrganizationId: "org_123",
        record: {
          organizationId: "org_other",
        },
      }),
    ).toBe(false);

    expect(() =>
      requireClinicRecordAccess({
        expectedOrganizationId: "org_123",
        record: {
          organizationId: "org_other",
        },
      }),
    ).toThrow("NEXT_NOT_FOUND");

    expect(navigationState.notFound).toHaveBeenCalledTimes(1);
  });
});
