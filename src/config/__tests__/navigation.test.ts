import { describe, expect, it } from "vitest";

import {
  ADMIN_NAVIGATION,
  DASHBOARD_NAVIGATION,
  getDashboardNavigationForRole,
  PATIENT_NAVIGATION,
  PUBLIC_NAVIGATION,
  PUBLIC_SIGNED_IN_ADMIN_NAVIGATION,
  PUBLIC_SIGNED_IN_PATIENT_NAVIGATION,
} from "../navigation";
import { ROUTES } from "../routes";

describe("navigation", () => {
  it("defines public navigation links", () => {
    expect(PUBLIC_NAVIGATION).toEqual([
      { href: ROUTES.support, labelKey: "support" },
      { href: ROUTES.bookingDemo, labelKey: "booking" },
    ]);
  });

  it("defines signed-in public navigation links for patient and admin destinations", () => {
    expect(PUBLIC_SIGNED_IN_PATIENT_NAVIGATION).toEqual([
      { href: ROUTES.support, labelKey: "support" },
      { href: ROUTES.bookingDemo, labelKey: "booking" },
      { href: ROUTES.patientAccount, labelKey: "appointments" },
    ]);
    expect(PUBLIC_SIGNED_IN_ADMIN_NAVIGATION).toEqual([
      { href: ROUTES.dashboard, labelKey: "dashboard" },
    ]);
  });

  it("defines admin navigation links", () => {
    expect(ADMIN_NAVIGATION).toEqual([{ href: ROUTES.dashboard, labelKey: "dashboard" }]);
  });

  it("defines role-aware dashboard navigation links", () => {
    expect(getDashboardNavigationForRole("admin").map((item) => item.href)).toEqual([
      ROUTES.dashboard,
      ROUTES.dashboardStaff,
      ROUTES.dashboardNotifications,
      ROUTES.dashboardLogs,
      ROUTES.dashboardManualBooking,
      ROUTES.dashboardSettings,
    ]);
    expect(getDashboardNavigationForRole("doctor")).toEqual([]);
    expect(getDashboardNavigationForRole("receptionist").map((item) => item.href)).toEqual([
      ROUTES.dashboardSchedule,
      ROUTES.dashboardManualBooking,
      ROUTES.dashboardProfile,
    ]);
    expect(DASHBOARD_NAVIGATION.every((item) => item.roles.length > 0)).toBe(true);
  });

  it("defines patient navigation links", () => {
    expect(PATIENT_NAVIGATION).toEqual([
      { href: ROUTES.patientAccount, labelKey: "appointments" },
      { href: ROUTES.support, labelKey: "support" },
    ]);
  });
});
