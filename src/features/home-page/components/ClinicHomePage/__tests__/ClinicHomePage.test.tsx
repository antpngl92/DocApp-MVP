import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ClinicHomePage from "..";
import type { ClinicHomePageContent } from "../../../types";

const content: ClinicHomePageContent = {
  bookingHref: "/booking/sofia-care",
  benefitDescription: "Book when it suits you with clear appointment details.",
  benefitEyebrow: "Why patients choose us",
  benefitTitle: "Everything you need to plan your visit",
  closingCtaDescription: "Choose a service and an available appointment time.",
  closingCtaTitle: "Ready to book your appointment?",
  contact: [
    { label: "Online booking", value: "Available 24/7" },
    { label: "Clear deposit", value: "Shown before payment" },
    { label: "Clinic balance", value: "Remaining amount paid at clinic" },
  ],
  eyebrow: "Sofia Care Clinic",
  footerAccountLabel: "Account",
  footerClinicLabel: "Clinic",
  footerCopyright: "© 2026 Sofia Care Clinic. All rights reserved.",
  footerDescription: "Convenient appointment booking.",
  footerNavigationLabel: "Footer navigation",
  footerRegisterLabel: "Create account",
  footerSignInLabel: "Sign in",
  heroBadge: "Trusted local clinic",
  heroImageAlt: "Healthcare professional supporting a patient during a clinic visit",
  policyCards: [
    { description: "Deposits reserve your appointment time.", title: "Deposit policy" },
    { description: "Please arrive on time.", title: "Attendance" },
    { description: "Contact details are used only for appointments.", title: "Privacy" },
  ],
  policyTitle: "Patient policy",
  primaryCta: "Book an appointment",
  processDescription: "Three clear booking steps.",
  processLinkLabel: "Start your booking",
  secondaryCta: "Contact Us",
  secondaryHref: "/support",
  securityBadge: "Appointment-only portal",
  securityTitle: "Appointment privacy",
  services: [
    { description: "Book at any time.", title: "Online booking 24/7" },
    { description: "Review the deposit before payment.", title: "Clear deposit" },
    { description: "Keep details limited to the appointment.", title: "Privacy first" },
    { description: "Review details before continuing.", title: "Clear appointment details" },
  ],
  signInHref: "/sign-in",
  signUpHref: "/sign-up",
  stepEyebrow: "How booking works",
  stepTitle: "Clear steps before your visit",
  steps: [
    { description: "Choose the visit type.", title: "Choose a service" },
    { description: "Pick an available time.", title: "Pick a time" },
    { description: "Confirm your deposit.", title: "Confirm details" },
  ],
  subtitle: "Book a clinic appointment with clear deposit and visit details.",
  title: "Book your visit at Sofia Care Clinic",
};

describe("ClinicHomePage", () => {
  it("renders patient-facing clinic homepage content", () => {
    render(<ClinicHomePage content={content} />);

    expect(screen.getByRole("heading", { level: 1, name: content.title })).toBeInTheDocument();
    expect(screen.getByText("Online booking 24/7")).toBeInTheDocument();
    expect(screen.getByText(/Deposit policy/)).toBeInTheDocument();
    expect(screen.getByText(content.securityTitle)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: content.heroImageAlt })).toBeInTheDocument();
    expect(screen.getByText(content.closingCtaTitle)).toBeInTheDocument();
  });

  it("links the primary CTA to the public booking route", () => {
    render(<ClinicHomePage content={content} />);

    const bookingLinks = screen.getAllByRole("link", { name: /book an appointment/i });

    expect(bookingLinks).toHaveLength(3);
    bookingLinks.forEach((link) => expect(link).toHaveAttribute("href", content.bookingHref));
  });

  it("links support and account actions to their public routes", () => {
    render(<ClinicHomePage content={content} />);

    screen
      .getAllByRole("link", { name: content.secondaryCta })
      .forEach((link) => expect(link).toHaveAttribute("href", content.secondaryHref));
    expect(screen.getByRole("link", { name: content.footerSignInLabel })).toHaveAttribute(
      "href",
      content.signInHref,
    );
    expect(screen.getByRole("link", { name: content.footerRegisterLabel })).toHaveAttribute(
      "href",
      content.signUpHref,
    );
  });

  it("renders additional configurable contact and service items", () => {
    render(
      <ClinicHomePage
        content={{
          ...content,
          contact: [...content.contact, { label: "Accessibility", value: "Step-free entrance" }],
          services: [
            ...content.services,
            { description: "Ask before your visit.", title: "Accessibility support" },
          ],
        }}
      />,
    );

    expect(screen.getByText("Step-free entrance")).toBeInTheDocument();
    expect(screen.getByText("Accessibility support")).toBeInTheDocument();
  });
});
