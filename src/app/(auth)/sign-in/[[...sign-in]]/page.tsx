import { SignIn } from "@clerk/nextjs";
import { getTranslations } from "next-intl/server";

import { AUTH_ROUTES } from "@/config/auth";
import { AccountSignIn } from "@/features/auth/components";

const SignInPage = async () => {
  const t = await getTranslations("auth.signIn");

  return (
    <AccountSignIn
      clerkSignIn={<SignIn fallbackRedirectUrl={AUTH_ROUTES.afterSignIn} />}
      description={t("description")}
      eyebrow={t("eyebrow")}
      helpText={t("helpText")}
      securityNote={t("securityNote")}
      title={t("title")}
    />
  );
};

export default SignInPage;
