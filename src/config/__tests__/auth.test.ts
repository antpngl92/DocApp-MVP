import { describe, expect, it } from "vitest";

import {
  AUTH_ROUTES,
  CLERK_PROTECTED_ROUTE_PATTERNS,
  PUBLIC_ROUTE_PATTERNS,
  isDocumentedProtectedRoute,
  isDocumentedPublicRoute,
} from "../auth";
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from "../routes";

describe("auth route configuration", () => {
  const publicRoutes = [
    PUBLIC_ROUTES.home,
    PUBLIC_ROUTES.bookingDemo,
    PUBLIC_ROUTES.checkoutSuccess,
    PUBLIC_ROUTES.checkoutCancel,
    PUBLIC_ROUTES.checkoutExpired,
    PUBLIC_ROUTES.checkoutStatusDemo,
    PUBLIC_ROUTES.support,
    PUBLIC_ROUTES.signIn,
    "/sign-in/factor-one",
    PUBLIC_ROUTES.signUp,
    "/sign-up/verify-email-address",
    PUBLIC_ROUTES.postAuth,
    "/api/health",
  ];

  it("keeps patient account routes protected by Clerk and admin hidden by layout guards", () => {
    expect(CLERK_PROTECTED_ROUTE_PATTERNS).toEqual(["/account(.*)"]);
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
      "/auth/after",
      "/api/health",
    ]);

    for (const route of publicRoutes) {
      expect(isDocumentedPublicRoute(route)).toBe(true);
      expect(isDocumentedProtectedRoute(route)).toBe(false);
    }
  });

  it("does not classify private app routes as public", () => {
    for (const route of [
      PRIVATE_ROUTES.admin,
      "/admin/settings",
      PRIVATE_ROUTES.patientAccount,
      "/account/appointments",
    ]) {
      expect(isDocumentedPublicRoute(route)).toBe(false);
      expect(isDocumentedProtectedRoute(route)).toBe(true);
    }
  });

  it("sends sign-up through post-auth role routing, not directly to admin", () => {
    expect(AUTH_ROUTES.signUp).toBe("/sign-up");
    expect(AUTH_ROUTES.afterSignUp).toBe("/auth/after");
  });
});
