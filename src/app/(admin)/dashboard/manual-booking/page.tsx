import { DashboardPlaceholder } from "@/features/dashboard/components";
import { STAFF_APPOINTMENT_OPERATOR_ROLE_VALUES } from "@/server/auth/consts";
import { requireDashboardRoleAccess } from "@/server/auth/dashboard-access";
import { getTranslations } from "next-intl/server";

const DashboardManualBookingPage = async () => {
  await requireDashboardRoleAccess({
    allowedRoles: STAFF_APPOINTMENT_OPERATOR_ROLE_VALUES,
  });

  const t = await getTranslations("dashboardPages.manualBooking");

  return (
    <DashboardPlaceholder
      description={t("description")}
      eyebrow={t("eyebrow")}
      title={t("title")}
    />
  );
};

export default DashboardManualBookingPage;
