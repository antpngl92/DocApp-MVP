import { PatientShell } from "@/components/layout";
import { ROUTES } from "@/config/routes";
import { getAuthenticatedHomeForCurrentUser } from "@/server/auth/navigation";
import { requirePatientProfileAccessForCurrentUser } from "@/server/auth/patient-access";
import { activateStaffInvitationForCurrentUser } from "@/server/auth/staff-onboarding";
import { requireAuthenticatedSession } from "@/server/auth/session";
import { redirect } from "next/navigation";

type PatientLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

const PatientLayout = async ({ children }: PatientLayoutProps) => {
  await requireAuthenticatedSession();
  await activateStaffInvitationForCurrentUser();
  const authenticatedHome = await getAuthenticatedHomeForCurrentUser();

  if (authenticatedHome !== ROUTES.patientAccount) {
    redirect(authenticatedHome);
  }

  await requirePatientProfileAccessForCurrentUser();

  return <PatientShell>{children}</PatientShell>;
};

export default PatientLayout;
