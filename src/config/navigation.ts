import { ROUTES } from "./routes";

type NavigationItem = Readonly<{
  href: string;
  labelKey: "appointments" | "booking" | "overview" | "support";
}>;

const PUBLIC_NAVIGATION: readonly NavigationItem[] = [
  { href: ROUTES.bookingDemo, labelKey: "booking" },
  { href: ROUTES.support, labelKey: "support" },
];

const ADMIN_NAVIGATION: readonly NavigationItem[] = [
  { href: ROUTES.admin, labelKey: "overview" },
  { href: ROUTES.support, labelKey: "support" },
];

const PATIENT_NAVIGATION: readonly NavigationItem[] = [
  { href: ROUTES.patientAccount, labelKey: "appointments" },
  { href: ROUTES.support, labelKey: "support" },
];

export { ADMIN_NAVIGATION, PATIENT_NAVIGATION, PUBLIC_NAVIGATION };
export type { NavigationItem };
