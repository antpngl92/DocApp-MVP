import { AdminShell } from "@/components/layout";
import { requireAuthenticatedSession } from "@/server/auth/session";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const AdminLayout = async ({ children }: AdminLayoutProps) => {
  await requireAuthenticatedSession();

  return <AdminShell>{children}</AdminShell>;
};

export default AdminLayout;
