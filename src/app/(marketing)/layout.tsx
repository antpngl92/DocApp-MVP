import { PublicShell } from "@/components/layout";

type MarketingLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const MarketingLayout = ({ children }: MarketingLayoutProps) => {
  return <PublicShell>{children}</PublicShell>;
};

export default MarketingLayout;
