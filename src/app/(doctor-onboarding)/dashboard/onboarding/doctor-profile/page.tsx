import { DoctorProfileOnboardingForm } from "@/features/doctor-profile/components";
import { createDoctorProfileAction } from "@/features/doctor-profile/actions";
import { DOCTOR_PROFILE_ACCESS_STATUS } from "@/server/auth/consts";
import { getDoctorProfileAccessForCurrentUser } from "@/server/auth/doctor-profile";
import { getTranslations } from "next-intl/server";

const DoctorProfileOnboardingPage = async () => {
  const t = await getTranslations("doctorOnboarding.profileRequired");
  const doctorProfileAccess = await getDoctorProfileAccessForCurrentUser();
  const userName = doctorProfileAccess.user?.name?.trim() || doctorProfileAccess.user?.email || "";
  const userEmail = doctorProfileAccess.user?.email ?? "";

  if (doctorProfileAccess.status === DOCTOR_PROFILE_ACCESS_STATUS.pendingAdminApproval) {
    return (
      <main className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.08em] text-[var(--primary)]">
            {t("eyebrow")}
          </p>
          <h1 className="text-3xl font-bold tracking-normal text-[var(--text-strong)]">
            {t("pendingTitle")}
          </h1>
          <p className="max-w-2xl text-base text-[var(--text-muted)]">
            {t("pendingDescription")}
          </p>
        </div>

        <section className="rounded-[8px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[var(--text-strong)]">
            {t("pendingPanelTitle")}
          </h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {t("pendingPanelDescription")}
          </p>
        </section>
      </main>
    );
  }

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

      <DoctorProfileOnboardingForm
        content={{
          emailHelp: t("form.emailHelp"),
          emailLabel: t("form.emailLabel"),
          nameError: t("form.nameError"),
          nameLabel: t("form.nameLabel"),
          namePlaceholder: t("form.namePlaceholder"),
          phoneLabel: t("form.phoneLabel"),
          phonePlaceholder: t("form.phonePlaceholder"),
          serverError: t("form.serverError"),
          specialtyLabel: t("form.specialtyLabel"),
          specialtyPlaceholder: t("form.specialtyPlaceholder"),
          submitLabel: t("form.submitLabel"),
          successMessage: t("form.successMessage"),
        }}
        email={userEmail}
        initialName={userName}
        onSubmit={createDoctorProfileAction}
      />
    </main>
  );
};

export default DoctorProfileOnboardingPage;
