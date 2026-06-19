import { LocalizedFoundationOverview } from "@/features/app-foundation/components";
import { ADMIN_PANEL_DEFINITIONS } from "@/features/app-foundation/constants";
import { DashboardPlaceholder } from "@/features/dashboard/components";
import { approveDoctorProfileAction } from "@/features/doctor-profile-approval/actions";
import { PendingDoctorApprovals } from "@/features/doctor-profile-approval/components";
import { STAFF_MEMBER_ROLE } from "@/server/auth/consts";
import { requireDashboardRoleAccess } from "@/server/auth/dashboard-access";
import { getPendingDoctorApprovalsForCurrentAdmin } from "@/server/auth/doctor-profile-approval";
import { getTranslations } from "next-intl/server";

const AdminPage = async () => {
  const { membership } = await requireDashboardRoleAccess({
    allowedRoles: [STAFF_MEMBER_ROLE.admin, STAFF_MEMBER_ROLE.doctor],
  });
  const t = await getTranslations("dashboardPages.dashboard");
  const approvalsTranslations = await getTranslations("dashboardPages.dashboard.pendingApprovals");
  const pendingDoctorApprovals =
    membership.role === STAFF_MEMBER_ROLE.admin
      ? await getPendingDoctorApprovalsForCurrentAdmin()
      : [];

  return (
    <div className="space-y-8">
      <DashboardPlaceholder
        description={t("description")}
        eyebrow={t("eyebrow")}
        title={t("title")}
      />
      {membership.role === STAFF_MEMBER_ROLE.admin ? (
        <PendingDoctorApprovals
          content={{
            approveLabel: approvalsTranslations("approveLabel"),
            createdLabel: approvalsTranslations("createdLabel"),
            emailLabel: approvalsTranslations("emailLabel"),
            emptyDescription: approvalsTranslations("emptyDescription"),
            emptyTitle: approvalsTranslations("emptyTitle"),
            heading: approvalsTranslations("heading"),
            phoneFallback: approvalsTranslations("phoneFallback"),
            phoneLabel: approvalsTranslations("phoneLabel"),
            specialtyFallback: approvalsTranslations("specialtyFallback"),
            specialtyLabel: approvalsTranslations("specialtyLabel"),
          }}
          doctors={pendingDoctorApprovals}
          onApprove={approveDoctorProfileAction}
        />
      ) : null}
      <LocalizedFoundationOverview namespace="admin" panels={ADMIN_PANEL_DEFINITIONS} />
    </div>
  );
};

export default AdminPage;
