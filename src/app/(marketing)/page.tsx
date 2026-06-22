import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import {
  HOME_PAGE_CONTACT_KEYS,
  HOME_PAGE_POLICY_KEYS,
  HOME_PAGE_SERVICE_KEYS,
  HOME_PAGE_STEP_KEYS,
} from "@/features/home-page/consts";
import { ClinicHomePage } from "@/features/home-page";

const HomePage = async () => {
  const t = await getTranslations("homePage");

  return (
    <ClinicHomePage
      content={{
        bookingHref: ROUTES.bookingDemo,
        benefitDescription: t("benefitDescription"),
        benefitEyebrow: t("benefitEyebrow"),
        benefitTitle: t("benefitTitle"),
        closingCtaDescription: t("closingCtaDescription"),
        closingCtaTitle: t("closingCtaTitle"),
        contact: HOME_PAGE_CONTACT_KEYS.map((key) => ({
          label: t(`contact.${key}.label`),
          value: t(`contact.${key}.value`),
        })),
        eyebrow: t("eyebrow"),
        footerAccountLabel: t("footerAccountLabel"),
        footerClinicLabel: t("footerClinicLabel"),
        footerCopyright: t("footerCopyright"),
        footerDescription: t("footerDescription"),
        footerNavigationLabel: t("footerNavigationLabel"),
        footerRegisterLabel: t("footerRegisterLabel"),
        footerSignInLabel: t("footerSignInLabel"),
        heroBadge: t("heroBadge"),
        heroImageAlt: t("heroImageAlt"),
        policyCards: HOME_PAGE_POLICY_KEYS.map((key) => ({
          description: t(`policy.${key}.description`),
          title: t(`policy.${key}.title`),
        })),
        primaryCta: t("primaryCta"),
        processDescription: t("processDescription"),
        processLinkLabel: t("processLinkLabel"),
        secondaryCta: t("secondaryCta"),
        secondaryHref: ROUTES.support,
        securityBadge: t("securityBadge"),
        securityTitle: t("securityTitle"),
        services: HOME_PAGE_SERVICE_KEYS.map((key) => ({
          description: t(`services.${key}.description`),
          title: t(`services.${key}.title`),
        })),
        stepEyebrow: t("stepEyebrow"),
        stepTitle: t("stepTitle"),
        steps: HOME_PAGE_STEP_KEYS.map((key) => ({
          description: t(`steps.${key}.description`),
          title: t(`steps.${key}.title`),
        })),
        subtitle: t("subtitle"),
        signInHref: ROUTES.signIn,
        signUpHref: ROUTES.signUp,
        policyTitle: t("policyTitle"),
        title: t("title"),
      }}
    />
  );
};

export default HomePage;
