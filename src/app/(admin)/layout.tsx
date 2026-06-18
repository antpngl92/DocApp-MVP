import { AdminShell } from "@/components/layout";
import { ROUTES } from "@/config/routes";
import { requireActiveStaffAccess } from "@/server/auth/admin-access";
import { DOCTOR_PROFILE_ACCESS_STATUS } from "@/server/auth/consts";
import { getDoctorProfileAccessForCurrentUser } from "@/server/auth/doctor-profile";
import { bootstrapOwnerAdminMembershipFromClerkPrivateMetadata } from "@/server/auth/owner-bootstrap";
import { getAuthenticatedSession } from "@/server/auth/session";
import { activateStaffInvitationForCurrentUser } from "@/server/auth/staff-onboarding";
import { notFound, redirect } from "next/navigation";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const AdminLayout = async ({ children }: AdminLayoutProps) => {
  const session = await getAuthenticatedSession();

  if (!session.userId) {
    notFound();
  }

  await activateStaffInvitationForCurrentUser();
  const bootstrapResult = await bootstrapOwnerAdminMembershipFromClerkPrivateMetadata();

  requireActiveStaffAccess({ membership: bootstrapResult.membership });

  const doctorProfileAccess = await getDoctorProfileAccessForCurrentUser();

  if (
    doctorProfileAccess.status === DOCTOR_PROFILE_ACCESS_STATUS.profileRequired ||
    doctorProfileAccess.status === DOCTOR_PROFILE_ACCESS_STATUS.pendingAdminApproval
  ) {
    redirect(ROUTES.doctorProfileOnboarding);
  }

  return <AdminShell>{children}</AdminShell>;
};

export default AdminLayout;
