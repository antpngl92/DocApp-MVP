import { describe, expect, it } from "vitest";

import {
  AUTH_ROUTES,
  CLERK_PROTECTED_ROUTE_PATTERNS,
  PUBLIC_ROUTE_PATTERNS,
  isDocumentedProtectedRoute,
  isDocumentedPublicRoute,
} from "../auth";

describe("auth route configuration", () => {
  const publicRoutes = [
    "/",
    "/booking/sofia-care",
    "/checkout/success",
    "/checkout/cancel",
    "/checkout/expired",
    "/checkout/status/demo-booking",
    "/support",
    "/sign-in",
    "/sign-in/factor-one",
    "/sign-up",
    "/sign-up/verify-email-address",
    "/api/health",
  ];

  it("keeps admin and patient account routes protected by Clerk", () => {
    expect(CLERK_PROTECTED_ROUTE_PATTERNS).toEqual(["/admin(.*)", "/account(.*)"]);
    expect(isDocumentedProtectedRoute("/admin")).toBe(true);
    expect(isDocumentedProtectedRoute("/admin/settings")).toBe(true);
    expect(isDocumentedProtectedRoute("/account")).toBe(true);
    expect(isDocumentedProtectedRoute("/account/appointments")).toBe(true);
  });

  it("keeps public discovery and checkout status routes public", () => {
    expect(PUBLIC_ROUTE_PATTERNS).toEqual([
      "/",
      "/booking(.*)",
      "/checkout/success",
      "/checkout/cancel",
      "/checkout/expired",
      "/checkout/status(.*)",
      "/support",
      "/sign-in(.*)",
      "/sign-up(.*)",
      "/api/health",
    ]);

    for (const route of publicRoutes) {
      expect(isDocumentedPublicRoute(route)).toBe(true);
      expect(isDocumentedProtectedRoute(route)).toBe(false);
    }
  });

  it("does not classify private app routes as public", () => {
    for (const route of ["/admin", "/admin/settings", "/account", "/account/appointments"]) {
      expect(isDocumentedPublicRoute(route)).toBe(false);
      expect(isDocumentedProtectedRoute(route)).toBe(true);
    }
  });

  it("defaults sign-up redirects to the patient account area, not admin", () => {
    expect(AUTH_ROUTES.signUp).toBe("/sign-up");
    expect(AUTH_ROUTES.afterSignUp).toBe("/account");
  });
});
