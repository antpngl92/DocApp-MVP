import type { FoundationPanelDefinition } from "../../types";

type FoundationOverviewProps = Readonly<{
  description: string;
  eyebrow?: string;
  panels: readonly FoundationPanelDefinition[];
  title: string;
}>;

export type { FoundationOverviewProps };
