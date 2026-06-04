import type { FoundationNamespace, FoundationPanelTranslationDefinition } from "../../types";

type LocalizedFoundationOverviewProps = Readonly<{
  namespace: FoundationNamespace;
  panels: readonly FoundationPanelTranslationDefinition[];
}>;

export type { LocalizedFoundationOverviewProps };
