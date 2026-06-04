import { FoundationPanel, PageIntro } from "@/components/ui";
import { getTranslations } from "next-intl/server";

import { CHECKOUT_STATUS_ICON } from "../../constants";
import type { CheckoutStatusViewProps } from "./types";

const CheckoutStatusView = async ({ status }: CheckoutStatusViewProps) => {
  const t = await getTranslations("checkout");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageIntro
        description={t(`${status}.description`)}
        eyebrow={t("eyebrow")}
        title={t(`${status}.title`)}
      />
      <FoundationPanel
        description={t("foundationDescription")}
        icon={CHECKOUT_STATUS_ICON}
        items={[t("item1"), t("item2"), t("item3")]}
        title={t("foundationTitle")}
      />
    </div>
  );
};

export default CheckoutStatusView;
