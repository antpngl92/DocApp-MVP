import { DashboardPlaceholder } from "@/features/dashboard/components";
import { STAFF_OWNER_ADMIN_ROLE_VALUES } from "@/server/auth/consts";
import { requireDashboardRoleAccess } from "@/server/auth/dashboard-access";
import { getTranslations } from "next-intl/server";

const DashboardLogsPage = async () => {
  await requireDashboardRoleAccess({
    allowedRoles: STAFF_OWNER_ADMIN_ROLE_VALUES,
  });

  const t = await getTranslations("dashboardPages.logs");

  return (
    <DashboardPlaceholder
      description={t("description")}
      eyebrow={t("eyebrow")}
      title={t("title")}
    />
  );
};

export default DashboardLogsPage;
