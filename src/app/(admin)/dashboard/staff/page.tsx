import { STAFF_MEMBER_ROLE } from "@/server/auth/consts";
import { requireDashboardRoleAccess } from "@/server/auth/dashboard-access";
import { DashboardPlaceholder } from "@/features/dashboard/components";
import { createStaffInvitationAction } from "@/features/staff/actions";
import { StaffInvitationForm } from "@/features/staff/components";
import { getStaffInvitationRoleOptions } from "@/features/staff/utils";
import { getTranslations } from "next-intl/server";

const DashboardStaffPage = async () => {
  await requireDashboardRoleAccess({
    allowedRoles: [STAFF_MEMBER_ROLE.admin],
  });

  const pageTranslations = await getTranslations("dashboardPages.staffMembers");
  const invitationTranslations = await getTranslations("admin.staffInvitation");

  return (
    <div className="space-y-8">
      <DashboardPlaceholder
        description={pageTranslations("description")}
        eyebrow={pageTranslations("eyebrow")}
        title={pageTranslations("title")}
      />
      <StaffInvitationForm
        content={{
          connectedLater: invitationTranslations("connectedLater"),
          emailError: invitationTranslations("emailError"),
          emailLabel: invitationTranslations("emailLabel"),
          emailPlaceholder: invitationTranslations("emailPlaceholder"),
          roleLabel: invitationTranslations("roleLabel"),
          serverError: invitationTranslations("serverError"),
          submitLabel: invitationTranslations("submitLabel"),
          successMessage: invitationTranslations("successMessage"),
        }}
        onInvite={createStaffInvitationAction}
        roleOptions={getStaffInvitationRoleOptions((role) =>
          invitationTranslations(`roles.${role}`),
        )}
      />
    </div>
  );
};

export default DashboardStaffPage;
