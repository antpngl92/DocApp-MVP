import { AdminShell } from "@/components/layout";
import { requireOwnerAdminAccess } from "@/server/auth/admin-access";
import { bootstrapOwnerAdminMembershipFromClerkPrivateMetadata } from "@/server/auth/owner-bootstrap";
import { requireAuthenticatedSession } from "@/server/auth/session";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const AdminLayout = async ({ children }: AdminLayoutProps) => {
  await requireAuthenticatedSession();
  const bootstrapResult = await bootstrapOwnerAdminMembershipFromClerkPrivateMetadata();

  requireOwnerAdminAccess({ membership: bootstrapResult.membership });

  return <AdminShell>{children}</AdminShell>;
};

export default AdminLayout;
