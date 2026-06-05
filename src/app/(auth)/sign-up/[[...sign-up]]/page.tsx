import { SignUp } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";

import { AUTH_ROUTES } from "@/config/auth";
import { PatientRegistration } from "@/features/auth/components";

const SignUpPage = async () => {
  const t = await getTranslations("auth.signUp");

  return (
    <PatientRegistration
      clerkSignUp={<SignUp fallbackRedirectUrl={AUTH_ROUTES.afterSignUp} />}
      description={t("description")}
      eyebrow={t("eyebrow")}
      privacyNote={t("privacyNote")}
      title={t("title")}
    />
  );
};

export default SignUpPage;
