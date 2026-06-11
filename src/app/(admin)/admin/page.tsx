import { LocalizedFoundationOverview } from "@/features/app-foundation/components";
import { createStaffInvitationAction } from "@/features/staff/actions";
import { ADMIN_PANEL_DEFINITIONS } from "@/features/app-foundation/constants";
import { StaffInvitationForm } from "@/features/staff/components";
import { getStaffInvitationRoleOptions } from "@/features/staff/utils";
import { getTranslations } from "next-intl/server";

const AdminPage = async () => {
  const t = await getTranslations("admin.staffInvitation");

  return (
    <div className="space-y-8">
      <LocalizedFoundationOverview namespace="admin" panels={ADMIN_PANEL_DEFINITIONS} />
      <StaffInvitationForm
        content={{
          connectedLater: t("connectedLater"),
          emailError: t("emailError"),
          emailLabel: t("emailLabel"),
          emailPlaceholder: t("emailPlaceholder"),
          roleLabel: t("roleLabel"),
          serverError: t("serverError"),
          submitLabel: t("submitLabel"),
          successMessage: t("successMessage"),
        }}
        onInvite={createStaffInvitationAction}
        roleOptions={getStaffInvitationRoleOptions((role) => t(`roles.${role}`))}
      />
    </div>
  );
};

export default AdminPage;
