import {
  BadgeCheck,
  Building2,
  CalendarClock,
  CalendarDays,
  CircleHelp,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LockKeyhole,
  MessagesSquare,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { FoundationPanelTranslationDefinition } from "./types";

const HOME_PANEL_DEFINITIONS: readonly FoundationPanelTranslationDefinition[] = [
  {
    key: "patients",
    icon: CalendarDays,
    itemKeys: ["item1", "item2", "item3"],
  },
  {
    key: "clinics",
    icon: Building2,
    itemKeys: ["item1", "item2", "item3"],
  },
];

const BOOKING_PANEL_DEFINITIONS: readonly FoundationPanelTranslationDefinition[] = [
  {
    key: "service",
    icon: ClipboardList,
    itemKeys: ["item1", "item2", "item3"],
  },
  {
    key: "time",
    icon: CalendarClock,
    itemKeys: ["item1", "item2", "item3"],
  },
  {
    key: "details",
    icon: CreditCard,
    itemKeys: ["item1", "item2", "item3"],
  },
];

const ADMIN_PANEL_DEFINITIONS: readonly FoundationPanelTranslationDefinition[] = [
  {
    key: "operations",
    icon: LayoutDashboard,
    itemKeys: ["item1", "item2", "item3"],
  },
  {
    key: "configuration",
    icon: ShieldCheck,
    itemKeys: ["item1", "item2", "item3"],
  },
];

const PATIENT_PANEL_DEFINITIONS: readonly FoundationPanelTranslationDefinition[] = [
  {
    key: "appointments",
    icon: UserRound,
    itemKeys: ["item1", "item2", "item3"],
  },
  {
    key: "privacy",
    icon: LockKeyhole,
    itemKeys: ["item1", "item2", "item3"],
  },
];

const SUPPORT_PANEL_DEFINITIONS: readonly FoundationPanelTranslationDefinition[] = [
  {
    key: "booking",
    icon: MessagesSquare,
    itemKeys: ["item1", "item2", "item3"],
  },
  {
    key: "product",
    icon: CircleHelp,
    itemKeys: ["item1", "item2", "item3"],
  },
];

const CHECKOUT_STATUS_ICON = BadgeCheck;

export {
  ADMIN_PANEL_DEFINITIONS,
  BOOKING_PANEL_DEFINITIONS,
  CHECKOUT_STATUS_ICON,
  HOME_PANEL_DEFINITIONS,
  PATIENT_PANEL_DEFINITIONS,
  SUPPORT_PANEL_DEFINITIONS,
};
