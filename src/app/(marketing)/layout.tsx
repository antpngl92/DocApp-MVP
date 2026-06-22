import { PublicShell } from "@/components/layout";

type MarketingLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return (
    <PublicShell brandName="Sofia Care Clinic" showCreateAccount={false}>
      {children}
    </PublicShell>
  );
};

export default MarketingLayout;
