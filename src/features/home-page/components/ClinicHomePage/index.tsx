import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CalendarHeart,
  CalendarRange,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  LockKeyhole,
  ListChecks,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { ClinicHomePageProps } from "../../types";

const ClinicHomePage = ({ content }: ClinicHomePageProps) => {
  const contactIcons = [CalendarRange, Wallet, Building2];
  const benefitIcons = [CalendarCheck, CreditCard, ShieldCheck, ListChecks];

  return (
    <main className="relative left-1/2 -mt-8 w-screen -translate-x-1/2 overflow-hidden sm:-mt-10">
      <section className="relative h-[80svh] min-h-[600px] w-full overflow-hidden">
        <Image
          alt={content.heroImageAlt}
          className="object-cover"
          fill
          priority
          sizes="100vw"
          src="/images/clinic-home-hero.jpg"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.92)_0%,rgba(15,23,42,0.72)_48%,rgba(15,23,42,0.2)_100%)]" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 lg:pb-24">
          <div className="max-w-2xl">
            <span className="inline-block rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white backdrop-blur-md">
              {content.heroBadge}
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-7xl">
              {content.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">{content.subtitle}</p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-bold text-[var(--text-strong)] shadow-xl transition hover:bg-blue-50"
                href={content.bookingHref}
              >
                {content.primaryCta}
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/35 bg-white/10 px-8 text-base font-bold !text-white backdrop-blur-md transition hover:bg-white/20"
                href={content.secondaryHref}
              >
                {content.secondaryCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 -mt-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-px overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--border)] shadow-xl md:grid-cols-3">
          {content.contact.map((item, index) => {
            const Icon = contactIcons[index] ?? CalendarRange;

            return (
              <div className="flex items-center gap-5 bg-white p-6" key={item.label}>
                <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-50 text-[var(--primary)]">
                  <Icon aria-hidden="true" size={23} />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    {item.label}
                  </p>
                  <p className="mt-1 font-semibold text-[var(--text-strong)]">{item.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="mb-16 max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
            {content.benefitEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold text-[var(--text-strong)] sm:text-4xl">
            {content.benefitTitle}
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--text-muted)]">
            {content.benefitDescription}
          </p>
        </div>
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {content.services.map((service, index) => {
            const Icon = benefitIcons[index] ?? CalendarCheck;

            return (
              <article key={service.title}>
                <Icon aria-hidden="true" className="mb-5 text-[var(--primary)]" size={31} />
                <h3 className="text-lg font-bold text-[var(--text-strong)]">{service.title}</h3>
                <p className="mt-2 leading-7 text-[var(--text-muted)]">{service.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[var(--surface-muted)] py-24">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:flex-row lg:items-center">
          <div className="lg:w-1/3">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[var(--primary)]">
              {content.stepEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[var(--text-strong)] sm:text-4xl">
              {content.stepTitle}
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--text-muted)]">
              {content.processDescription}
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-2 font-bold text-[var(--primary)] hover:underline"
              href={content.bookingHref}
            >
              {content.processLinkLabel}
              <ChevronRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <div className="grid flex-1 gap-6">
            {content.steps.map((step, index) => (
              <article className="flex gap-6 rounded-2xl bg-white p-7 shadow-sm" key={step.title}>
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--text-strong)] text-lg font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-strong)]">{step.title}</h3>
                  <p className="mt-2 leading-7 text-[var(--text-muted)]">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
        <div className="rounded-3xl border border-[var(--border)] bg-white p-8 shadow-[var(--shadow-soft)] sm:p-12 lg:p-16">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-strong)]">{content.policyTitle}</h2>
              <ul className="mt-7 space-y-6">
                {content.policyCards.slice(0, 2).map((card) => (
                  <li className="flex gap-4" key={card.title}>
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 shrink-0 text-[var(--primary)]"
                      size={20}
                    />
                    <p className="leading-7 text-[var(--text-muted)]">
                      <strong className="text-[var(--text-strong)]">{card.title}: </strong>
                      {card.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-blue-50/60 p-8">
              <h3 className="text-lg font-bold text-[var(--text-strong)]">
                {content.securityTitle}
              </h3>
              <p className="mt-4 text-sm leading-7 text-[var(--text-muted)]">
                {content.policyCards[2]?.description}
              </p>
              <div className="mt-6 flex items-center gap-3 text-[var(--primary)]">
                <LockKeyhole aria-hidden="true" size={18} />
                <span className="text-xs font-bold uppercase tracking-[0.16em]">
                  {content.securityBadge}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <div className="rounded-[2.5rem] bg-[var(--text-strong)] px-8 py-16 text-center sm:px-16 sm:py-24">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold text-white sm:text-5xl">
            {content.closingCtaTitle}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-300">
            {content.closingCtaDescription}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-10 text-base font-bold text-[var(--text-strong)] shadow-xl transition hover:bg-blue-50"
              href={content.bookingHref}
            >
              {content.primaryCta}
              <ArrowRight aria-hidden="true" size={18} />
            </Link>
            <Link className="text-sm font-bold text-white/75 hover:text-white" href={content.secondaryHref}>
              {content.secondaryCta}
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--border)] bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-start">
            <div className="max-w-sm">
              <div className="flex items-center gap-3">
                <CalendarHeart aria-hidden="true" className="text-[var(--primary)]" size={25} />
                <strong className="text-lg font-bold text-[var(--text-strong)]">
                  {content.eyebrow}
                </strong>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--text-muted)]">
                {content.footerDescription}
              </p>
            </div>
            <nav aria-label={content.footerNavigationLabel} className="flex flex-wrap gap-12">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-strong)]">
                  {content.footerClinicLabel}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
                  <li>
                    <Link className="hover:text-[var(--primary)]" href={content.bookingHref}>
                      {content.primaryCta}
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-[var(--primary)]" href={content.secondaryHref}>
                      {content.secondaryCta}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-strong)]">
                  {content.footerAccountLabel}
                </h3>
                <ul className="mt-4 space-y-3 text-sm text-[var(--text-muted)]">
                  <li>
                    <Link className="hover:text-[var(--primary)]" href={content.signInHref}>
                      {content.footerSignInLabel}
                    </Link>
                  </li>
                  <li>
                    <Link className="hover:text-[var(--primary)]" href={content.signUpHref}>
                      {content.footerRegisterLabel}
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
          <p className="mt-12 border-t border-[var(--border)] pt-8 text-xs text-[var(--text-muted)]">
            {content.footerCopyright}
          </p>
        </div>
      </footer>
    </main>
  );
};

export default ClinicHomePage;
