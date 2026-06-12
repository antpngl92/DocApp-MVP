import { PatientShell } from "@/components/layout";
import { activateStaffInvitationForCurrentUser } from "@/server/auth/staff-onboarding";
import { requireAuthenticatedSession } from "@/server/auth/session";

type PatientLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const PatientLayout = async ({ children }: PatientLayoutProps) => {
  await requireAuthenticatedSession();
  await activateStaffInvitationForCurrentUser();

  return <PatientShell>{children}</PatientShell>;
};

export default PatientLayout;
