import { getTranslations } from "next-intl/server";

import FoundationOverview from "../FoundationOverview";
import type { LocalizedFoundationOverviewProps } from "./types";

const LocalizedFoundationOverview = async ({
  namespace,
  panels,
}: LocalizedFoundationOverviewProps) => {
  const t = await getTranslations(namespace);
  const localizedPanels = panels.map((panel) => ({
    description: t(`panels.${panel.key}.description`),
    icon: panel.icon,
    items: panel.itemKeys.map((itemKey) => t(`panels.${panel.key}.${itemKey}`)),
    title: t(`panels.${panel.key}.title`),
  }));

  return (
    <FoundationOverview
      description={t("description")}
      eyebrow={t("eyebrow")}
      panels={localizedPanels}
      title={t("title")}
    />
  );
};

export default LocalizedFoundationOverview;
