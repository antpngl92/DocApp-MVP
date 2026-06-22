type ClinicHomePageCard = Readonly<{
  description: string;
  title: string;
}>;

type ClinicHomePageContactItem = Readonly<{
  label: string;
  value: string;
}>;

type ClinicHomePageStep = Readonly<{
  description: string;
  title: string;
}>;

type ClinicHomePageContent = Readonly<{
  bookingHref: string;
  benefitDescription: string;
  benefitEyebrow: string;
  benefitTitle: string;
  closingCtaDescription: string;
  closingCtaTitle: string;
  contact: readonly ClinicHomePageContactItem[];
  eyebrow: string;
  footerAccountLabel: string;
  footerClinicLabel: string;
  footerCopyright: string;
  footerDescription: string;
  footerNavigationLabel: string;
  footerRegisterLabel: string;
  footerSignInLabel: string;
  heroBadge: string;
  heroImageAlt: string;
  policyCards: readonly ClinicHomePageCard[];
  policyTitle: string;
  primaryCta: string;
  processDescription: string;
  processLinkLabel: string;
  secondaryCta: string;
  secondaryHref: string;
  securityBadge: string;
  securityTitle: string;
  services: readonly ClinicHomePageCard[];
  signInHref: string;
  signUpHref: string;
  stepEyebrow: string;
  stepTitle: string;
  steps: readonly ClinicHomePageStep[];
  subtitle: string;
  title: string;
}>;

type ClinicHomePageProps = Readonly<{
  content: ClinicHomePageContent;
}>;

export type {
  ClinicHomePageCard,
  ClinicHomePageContactItem,
  ClinicHomePageContent,
  ClinicHomePageProps,
  ClinicHomePageStep,
};
