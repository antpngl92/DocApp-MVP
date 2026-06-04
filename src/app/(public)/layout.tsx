import { PublicShell } from "@/components/layout";

type PublicLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return <PublicShell contextLabel="Sofia Care Clinic">{children}</PublicShell>;
};

export default PublicLayout;
