const AUTH_ROUTES = {
  signIn: "/sign-in",
  signUp: "/sign-up",
  afterSignIn: "/auth/after",
  afterSignUp: "/auth/after",
} as const;

const CLERK_PROTECTED_ROUTE_PATTERNS = ["/account(.*)"] as const;

const PUBLIC_ROUTE_PATTERNS = [
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
] as const;

const isDocumentedPublicRoute = (pathname: string) => {
  if (pathname === "/") {
    return true;
  }

  return [
    "/booking",
    "/checkout/success",
    "/checkout/cancel",
    "/checkout/expired",
    "/checkout/status",
    "/support",
    "/sign-in",
    "/sign-up",
    "/auth/after",
    "/api/health",
  ].some((routePrefix) => pathname === routePrefix || pathname.startsWith(`${routePrefix}/`));
};

const isDocumentedProtectedRoute = (pathname: string) => {
  return (
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/account" ||
    pathname.startsWith("/account/")
  );
};

export {
  AUTH_ROUTES,
  CLERK_PROTECTED_ROUTE_PATTERNS,
  PUBLIC_ROUTE_PATTERNS,
  isDocumentedProtectedRoute,
  isDocumentedPublicRoute,
};
