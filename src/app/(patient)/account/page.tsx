import { LocalizedFoundationOverview } from "@/features/app-foundation/components";
import { PATIENT_PANEL_DEFINITIONS } from "@/features/app-foundation/constants";

const PatientAccountPage = () => {
  return <LocalizedFoundationOverview namespace="patient" panels={PATIENT_PANEL_DEFINITIONS} />;
};

export default PatientAccountPage;
