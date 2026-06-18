import { describe, expect, it } from "vitest";

import { PRIVATE_ROUTES, PUBLIC_ROUTES, ROUTES } from "../routes";

describe("routes", () => {
  it("exports the merged public and private routes", () => {
    expect(ROUTES).toEqual({
      ...PUBLIC_ROUTES,
      ...PRIVATE_ROUTES,
    });
  });

  it("keeps public route keys in the public route group", () => {
    expect(Object.keys(PUBLIC_ROUTES)).toEqual([
      "home",
      "bookingDemo",
      "checkoutSuccess",
      "checkoutCancel",
      "checkoutExpired",
      "checkoutStatusDemo",
      "signIn",
      "signUp",
      "postAuth",
      "support",
    ]);
  });

  it("keeps private route keys in the private route group", () => {
    expect(Object.keys(PRIVATE_ROUTES)).toEqual([
      "dashboard",
      "doctorProfileOnboarding",
      "patientAccount",
    ]);
  });

  it("does not duplicate route paths across public and private groups", () => {
    const publicPaths = new Set<string>(Object.values(PUBLIC_ROUTES));
    const privatePaths = Object.values(PRIVATE_ROUTES);

    expect(privatePaths.every((path) => !publicPaths.has(path))).toBe(true);
  });
});
