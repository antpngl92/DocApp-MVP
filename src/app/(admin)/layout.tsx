import { AdminShell } from "@/components/layout";
import { requireActiveStaffAccess } from "@/server/auth/admin-access";
import { bootstrapOwnerAdminMembershipFromClerkPrivateMetadata } from "@/server/auth/owner-bootstrap";
import { getAuthenticatedSession } from "@/server/auth/session";
import { activateStaffInvitationForCurrentUser } from "@/server/auth/staff-onboarding";
import { notFound } from "next/navigation";

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
  const membership = bootstrapResult.membership;

  requireActiveStaffAccess({ membership });

  if (!membership) {
    notFound();
  }

  return <AdminShell membershipRole={membership.role}>{children}</AdminShell>;
};

export default AdminLayout;
