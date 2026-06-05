import { PublicShell } from "@/components/layout";

type AuthLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return <PublicShell>{children}</PublicShell>;
};

export default AuthLayout;
