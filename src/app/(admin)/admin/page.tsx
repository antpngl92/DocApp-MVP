import { LocalizedFoundationOverview } from "@/features/app-foundation/components";
import { ADMIN_PANEL_DEFINITIONS } from "@/features/app-foundation/constants";
import { StaffInvitationForm } from "@/features/staff/components";
import { STAFF_MEMBER_ROLE } from "@/server/auth/consts";
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
          submitLabel: t("submitLabel"),
          successMessage: t("successMessage"),
        }}
        roleOptions={[
          { label: t("roles.admin"), value: STAFF_MEMBER_ROLE.admin },
          { label: t("roles.manager"), value: STAFF_MEMBER_ROLE.manager },
          { label: t("roles.receptionist"), value: STAFF_MEMBER_ROLE.receptionist },
          { label: t("roles.doctor"), value: STAFF_MEMBER_ROLE.doctor },
        ]}
      />
    </div>
  );
};

export default AdminPage;
