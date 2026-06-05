import { describe, expect, it } from "vitest";

import {
  AUTH_ROUTES,
  CLERK_PROTECTED_ROUTE_PATTERNS,
  PUBLIC_ROUTE_PATTERNS,
  isDocumentedProtectedRoute,
  isDocumentedPublicRoute,
} from "../auth";

describe("auth route configuration", () => {
  it("keeps admin and patient account routes protected by Clerk", () => {
    expect(CLERK_PROTECTED_ROUTE_PATTERNS).toEqual(["/admin(.*)", "/account(.*)"]);
    expect(isDocumentedProtectedRoute("/admin")).toBe(true);
    expect(isDocumentedProtectedRoute("/admin/settings")).toBe(true);
    expect(isDocumentedProtectedRoute("/account")).toBe(true);
    expect(isDocumentedProtectedRoute("/account/appointments")).toBe(true);
  });

  it("keeps public discovery and checkout status routes public", () => {
    expect(PUBLIC_ROUTE_PATTERNS).toContain("/booking(.*)");
    expect(PUBLIC_ROUTE_PATTERNS).toContain("/checkout/status(.*)");
    expect(isDocumentedPublicRoute("/")).toBe(true);
    expect(isDocumentedPublicRoute("/booking/sofia-care")).toBe(true);
    expect(isDocumentedPublicRoute("/checkout/status/demo-booking")).toBe(true);
    expect(isDocumentedPublicRoute("/support")).toBe(true);
    expect(isDocumentedPublicRoute("/api/health")).toBe(true);
  });

  it("defaults sign-up redirects to the patient account area, not admin", () => {
    expect(AUTH_ROUTES.signUp).toBe("/sign-up");
    expect(AUTH_ROUTES.afterSignUp).toBe("/account");
  });
});
