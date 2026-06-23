const PUBLIC_ROUTES = {
  home: "/",
  bookingDemo: "/booking/sofia-care",
  checkoutSuccess: "/checkout/success",
  checkoutCancel: "/checkout/cancel",
  checkoutExpired: "/checkout/expired",
  checkoutStatusDemo: "/checkout/status/demo-booking",
  signIn: "/sign-in",
  signUp: "/sign-up",
  postAuth: "/auth/after",
  support: "/support",
} as const;

const PRIVATE_ROUTES = {
  dashboard: "/dashboard",
  dashboardLogs: "/dashboard/logs",
  dashboardManualBooking: "/dashboard/manual-booking",
  dashboardNotifications: "/dashboard/notifications",
  dashboardProfile: "/dashboard/profile",
  dashboardSchedule: "/dashboard/schedule",
  dashboardSettings: "/dashboard/settings",
  dashboardStaff: "/dashboard/staff",
  patientAccount: "/account",
} as const;

const ROUTES = {
  ...PUBLIC_ROUTES,
  ...PRIVATE_ROUTES,
} as const;

export { PRIVATE_ROUTES, PUBLIC_ROUTES, ROUTES };
