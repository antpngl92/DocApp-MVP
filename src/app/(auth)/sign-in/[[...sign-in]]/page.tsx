import { SignIn } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";

import { AUTH_ROUTES } from "@/config/auth";
import { ProvisionedClinicSignIn } from "@/features/auth/components";

const SignInPage = async () => {
  const t = await getTranslations("auth.signIn");

  return (
    <ProvisionedClinicSignIn
      accessNote={t("accessNote")}
      clerkSignIn={<SignIn fallbackRedirectUrl={AUTH_ROUTES.afterSignIn} />}
      description={t("description")}
      eyebrow={t("eyebrow")}
      helpText={t("helpText")}
      title={t("title")}
    />
  );
};

export default SignInPage;
