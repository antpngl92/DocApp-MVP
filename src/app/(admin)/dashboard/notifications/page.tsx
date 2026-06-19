import { DashboardPlaceholder } from "@/features/dashboard/components";
import { STAFF_MEMBER_ROLE } from "@/server/auth/consts";
import { requireDashboardRoleAccess } from "@/server/auth/dashboard-access";
import { getTranslations } from "next-intl/server";

const DashboardNotificationsPage = async () => {
  await requireDashboardRoleAccess({
    allowedRoles: [STAFF_MEMBER_ROLE.admin, STAFF_MEMBER_ROLE.doctor],
  });

  const t = await getTranslations("dashboardPages.notifications");

  return (
    <DashboardPlaceholder
      description={t("description")}
      eyebrow={t("eyebrow")}
      title={t("title")}
    />
  );
};

export default DashboardNotificationsPage;
