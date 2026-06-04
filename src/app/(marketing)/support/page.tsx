import { LocalizedFoundationOverview } from "@/features/app-foundation/components";
import { SUPPORT_PANEL_DEFINITIONS } from "@/features/app-foundation/constants";

const SupportPage = () => {
  return <LocalizedFoundationOverview namespace="support" panels={SUPPORT_PANEL_DEFINITIONS} />;
};

export default SupportPage;
