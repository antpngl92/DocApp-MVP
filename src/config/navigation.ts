import { STAFF_MEMBER_ROLE } from "@/server/auth/consts";
import type { StaffMemberRole } from "@/server/auth/type";

import { ROUTES } from "./routes";

type NavigationItem = Readonly<{
  href: string;
  labelKey: "appointments" | "booking" | "dashboard" | "support";
}>;

type DashboardNavigationIcon =
  | "bell"
  | "calendar"
  | "clipboardPlus"
  | "fileText"
  | "layoutDashboard"
  | "settings"
  | "stethoscope"
  | "users";

type DashboardNavigationLabelKey =
  | "dashboard"
  | "logs"
  | "manualBooking"
  | "notifications"
  | "profile"
  | "schedule"
  | "settings"
  | "staffMembers";

type DashboardNavigationItem = Readonly<{
  href: string;
  iconKey: DashboardNavigationIcon;
  labelKey: DashboardNavigationLabelKey;
  roles: readonly StaffMemberRole[];
}>;

const PUBLIC_NAVIGATION: readonly NavigationItem[] = [
  { href: ROUTES.support, labelKey: "support" },
  { href: ROUTES.bookingDemo, labelKey: "booking" },
];

const PUBLIC_SIGNED_IN_ADMIN_NAVIGATION: readonly NavigationItem[] = [
  { href: ROUTES.dashboard, labelKey: "dashboard" },
];

const PUBLIC_SIGNED_IN_PATIENT_NAVIGATION: readonly NavigationItem[] = [
  ...PUBLIC_NAVIGATION,
  { href: ROUTES.patientAccount, labelKey: "appointments" },
];

const ADMIN_NAVIGATION: readonly NavigationItem[] = [
  { href: ROUTES.dashboard, labelKey: "dashboard" },
];

const PATIENT_NAVIGATION: readonly NavigationItem[] = [
  { href: ROUTES.patientAccount, labelKey: "appointments" },
  { href: ROUTES.support, labelKey: "support" },
];

const DASHBOARD_NAVIGATION: readonly DashboardNavigationItem[] = [
  {
    href: ROUTES.dashboard,
    iconKey: "layoutDashboard",
    labelKey: "dashboard",
    roles: [STAFF_MEMBER_ROLE.admin, STAFF_MEMBER_ROLE.doctor],
  },
  {
    href: ROUTES.dashboardSchedule,
    iconKey: "calendar",
    labelKey: "schedule",
    roles: [STAFF_MEMBER_ROLE.receptionist],
  },
  {
    href: ROUTES.dashboardStaff,
    iconKey: "users",
    labelKey: "staffMembers",
    roles: [STAFF_MEMBER_ROLE.admin],
  },
  {
    href: ROUTES.dashboardNotifications,
    iconKey: "bell",
    labelKey: "notifications",
    roles: [STAFF_MEMBER_ROLE.admin, STAFF_MEMBER_ROLE.doctor],
  },
  {
    href: ROUTES.dashboardLogs,
    iconKey: "fileText",
    labelKey: "logs",
    roles: [STAFF_MEMBER_ROLE.admin],
  },
  {
    href: ROUTES.dashboardManualBooking,
    iconKey: "clipboardPlus",
    labelKey: "manualBooking",
    roles: [STAFF_MEMBER_ROLE.admin, STAFF_MEMBER_ROLE.doctor, STAFF_MEMBER_ROLE.receptionist],
  },
  {
    href: ROUTES.dashboardSettings,
    iconKey: "settings",
    labelKey: "settings",
    roles: [STAFF_MEMBER_ROLE.admin, STAFF_MEMBER_ROLE.doctor],
  },
  {
    href: ROUTES.dashboardProfile,
    iconKey: "stethoscope",
    labelKey: "profile",
    roles: [STAFF_MEMBER_ROLE.doctor, STAFF_MEMBER_ROLE.receptionist],
  },
];

const getDashboardNavigationForRole = (role: string): readonly DashboardNavigationItem[] => {
  return DASHBOARD_NAVIGATION.filter((item) => item.roles.includes(role as StaffMemberRole));
};

export {
  ADMIN_NAVIGATION,
  DASHBOARD_NAVIGATION,
  getDashboardNavigationForRole,
  PATIENT_NAVIGATION,
  PUBLIC_NAVIGATION,
  PUBLIC_SIGNED_IN_ADMIN_NAVIGATION,
  PUBLIC_SIGNED_IN_PATIENT_NAVIGATION,
};
export type {
  DashboardNavigationIcon,
  DashboardNavigationItem,
  DashboardNavigationLabelKey,
  NavigationItem,
};
