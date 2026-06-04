import type { LucideIcon } from "lucide-react";

type FoundationPanelProps = Readonly<{
  description: string;
  icon: LucideIcon;
  items: readonly string[];
  title: string;
}>;

export type { FoundationPanelProps };
