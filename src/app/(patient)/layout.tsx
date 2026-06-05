import { PatientShell } from "@/components/layout";
import { requireAuthenticatedSession } from "@/server/auth/session";

type PatientLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const PatientLayout = async ({ children }: PatientLayoutProps) => {
  await requireAuthenticatedSession();

  return <PatientShell>{children}</PatientShell>;
};

export default PatientLayout;
