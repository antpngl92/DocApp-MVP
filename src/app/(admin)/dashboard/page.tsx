import { LocalizedFoundationOverview } from "@/features/app-foundation/components";
import { ADMIN_PANEL_DEFINITIONS } from "@/features/app-foundation/constants";
import { DashboardPlaceholder } from "@/features/dashboard/components";
import { STAFF_MEMBER_ROLE } from "@/server/auth/consts";
import { requireDashboardRoleAccess } from "@/server/auth/dashboard-access";
import { getTranslations } from "next-intl/server";

const AdminPage = async () => {
  await requireDashboardRoleAccess({
    allowedRoles: [STAFF_MEMBER_ROLE.admin],
  });
  const t = await getTranslations("dashboardPages.dashboard");

  return (
    <div className="space-y-8">
      <DashboardPlaceholder
        description={t("description")}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />
      <LocalizedFoundationOverview namespace="admin" panels={ADMIN_PANEL_DEFINITIONS} />
    </div>
  );
};

export default AdminPage;
