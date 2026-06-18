import { getTranslations } from "next-intl/server";

const DoctorProfileOnboardingPage = async () => {
  const t = await getTranslations("doctorOnboarding.profileRequired");

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">
          {t("eyebrow")}
        </p>
        <h1 className="text-3xl font-bold tracking-normal text-[var(--text-strong)]">
          {t("title")}
        </h1>
        <p className="max-w-2xl text-base text-[var(--text-muted)]">{t("description")}</p>
      </div>

      <section className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--text-strong)]">{t("panelTitle")}</h2>
        <p className="mt-2 text-sm text-[var(--text-muted)]">{t("panelDescription")}</p>
      </section>
    </main>
  );
};

export default DoctorProfileOnboardingPage;
