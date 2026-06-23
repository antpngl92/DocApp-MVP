import { DashboardPlaceholder } from "@/features/dashboard/components";
import { STAFF_MEMBER_ROLE } from "@/server/auth/consts";
import { requireDashboardRoleAccess } from "@/server/auth/dashboard-access";
import { getTranslations } from "next-intl/server";

const DashboardProfilePage = async () => {
  await requireDashboardRoleAccess({
    allowedRoles: [STAFF_MEMBER_ROLE.receptionist],
  });

  const t = await getTranslations("dashboardPages.profile");

  return (
    <DashboardPlaceholder
      description={t("description")}
      eyebrow={t("eyebrow")}
      title={t("title")}
    />
  );
};

export default DashboardProfilePage;
