import { PATIENT_NAVIGATION } from "@/config/navigation";
import { getTranslations } from "next-intl/server";

import AppShell from "../AppShell";
import type { PatientShellProps } from "./types";

const PatientShell = async ({ children }: PatientShellProps) => {
  const t = await getTranslations("navigation");

  return (
    <AppShell
      contextLabel={t("patientContext")}
      navigation={PATIENT_NAVIGATION}
      showCurrentUserName
    >
      {children}
    </AppShell>
  );
};

export default PatientShell;
