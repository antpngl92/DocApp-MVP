import { AdminShell } from "@/components/layout";

type AdminLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const AdminLayout = ({ children }: AdminLayoutProps) => {
  return <AdminShell>{children}</AdminShell>;
};

export default AdminLayout;
