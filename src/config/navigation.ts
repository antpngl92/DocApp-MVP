import { ROUTES } from "./routes";

type NavigationItem = Readonly<{
  href: string;
  labelKey: "appointments" | "booking" | "dashboard" | "support";
}>;

const PUBLIC_NAVIGATION: readonly NavigationItem[] = [
  { href: ROUTES.bookingDemo, labelKey: "booking" },
  { href: ROUTES.support, labelKey: "support" },
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

export {
  ADMIN_NAVIGATION,
  PATIENT_NAVIGATION,
  PUBLIC_NAVIGATION,
  PUBLIC_SIGNED_IN_ADMIN_NAVIGATION,
  PUBLIC_SIGNED_IN_PATIENT_NAVIGATION,
};
export type { NavigationItem };
