import { LocalizedFoundationOverview } from "@/features/app-foundation/components";
import { ADMIN_PANEL_DEFINITIONS } from "@/features/app-foundation/constants";

const AdminPage = () => {
  return <LocalizedFoundationOverview namespace="admin" panels={ADMIN_PANEL_DEFINITIONS} />;
};

export default AdminPage;
