import { describe, expect, it } from "vitest";

import { ADMIN_NAVIGATION, PATIENT_NAVIGATION, PUBLIC_NAVIGATION } from "../navigation";
import { ROUTES } from "../routes";

describe("navigation", () => {
  it("defines public navigation links", () => {
    expect(PUBLIC_NAVIGATION).toEqual([
      { href: ROUTES.bookingDemo, labelKey: "booking" },
      { href: ROUTES.support, labelKey: "support" },
    ]);
  });

  it("defines admin navigation links", () => {
    expect(ADMIN_NAVIGATION).toEqual([
      { href: ROUTES.admin, labelKey: "overview" },
      { href: ROUTES.support, labelKey: "support" },
    ]);
  });

  it("defines patient navigation links", () => {
    expect(PATIENT_NAVIGATION).toEqual([
      { href: ROUTES.patientAccount, labelKey: "appointments" },
      { href: ROUTES.support, labelKey: "support" },
    ]);
  });
});
