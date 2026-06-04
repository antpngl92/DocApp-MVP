import { LocalizedFoundationOverview } from "@/features/app-foundation/components";
import { HOME_PANEL_DEFINITIONS } from "@/features/app-foundation/constants";

const HomePage = () => {
  return <LocalizedFoundationOverview namespace="home" panels={HOME_PANEL_DEFINITIONS} />;
};

export default HomePage;
