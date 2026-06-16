import { describe, expect, it } from "vitest";

import {
  ADMIN_NAVIGATION,
  PATIENT_NAVIGATION,
  PUBLIC_NAVIGATION,
  PUBLIC_SIGNED_IN_ADMIN_NAVIGATION,
  PUBLIC_SIGNED_IN_PATIENT_NAVIGATION,
} from "../navigation";
import { ROUTES } from "../routes";

describe("navigation", () => {
  it("defines public navigation links", () => {
    expect(PUBLIC_NAVIGATION).toEqual([
      { href: ROUTES.bookingDemo, labelKey: "booking" },
      { href: ROUTES.support, labelKey: "support" },
    ]);
  });

  it("defines signed-in public navigation links for patient and admin destinations", () => {
    expect(PUBLIC_SIGNED_IN_PATIENT_NAVIGATION).toEqual([
      { href: ROUTES.bookingDemo, labelKey: "booking" },
      { href: ROUTES.support, labelKey: "support" },
      { href: ROUTES.patientAccount, labelKey: "appointments" },
    ]);
    expect(PUBLIC_SIGNED_IN_ADMIN_NAVIGATION).toEqual([
      { href: ROUTES.dashboard, labelKey: "dashboard" },
    ]);
  });

  it("defines admin navigation links", () => {
    expect(ADMIN_NAVIGATION).toEqual([{ href: ROUTES.dashboard, labelKey: "dashboard" }]);
  });

  it("defines patient navigation links", () => {
    expect(PATIENT_NAVIGATION).toEqual([
      { href: ROUTES.patientAccount, labelKey: "appointments" },
      { href: ROUTES.support, labelKey: "support" },
    ]);
  });
});
