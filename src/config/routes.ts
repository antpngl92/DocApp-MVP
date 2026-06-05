const PUBLIC_ROUTES = {
  home: "/",
  bookingDemo: "/booking/sofia-care",
  checkoutSuccess: "/checkout/success",
  checkoutCancel: "/checkout/cancel",
  checkoutExpired: "/checkout/expired",
  checkoutStatusDemo: "/checkout/status/demo-booking",
  signIn: "/sign-in",
  signUp: "/sign-up",
  support: "/support",
} as const;

const PRIVATE_ROUTES = {
  admin: "/admin",
  patientAccount: "/account",
} as const;

const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PRIVATE_ROUTES,
} as const;

export { PRIVATE_ROUTES, PUBLIC_ROUTES, ROUTES };
