import { PublicShell } from "@/components/layout";

type PublicLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <PublicShell brandName="Sofia Care Clinic" showCreateAccount={false}>
      {children}
    </PublicShell>
  );
};

export default PublicLayout;
