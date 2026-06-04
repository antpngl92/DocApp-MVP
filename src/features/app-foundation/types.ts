import type { LucideIcon } from "lucide-react";

type FoundationPanelDefinition = Readonly<{
  description: string;
  icon: LucideIcon;
  items: readonly string[];
  title: string;
}>;

type FoundationPanelTranslationDefinition = Readonly<{
  icon: LucideIcon;
  itemKeys: readonly string[];
  key: string;
}>;

type FoundationNamespace = "admin" | "booking" | "home" | "patient" | "support";

type CheckoutFoundationStatus = "cancelled" | "expired" | "pending" | "success";

export type {
  CheckoutFoundationStatus,
  FoundationNamespace,
  FoundationPanelDefinition,
  FoundationPanelTranslationDefinition,
};
