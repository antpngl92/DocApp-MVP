"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { setLocalePreference } from "@/i18n/actions";
import { LOCALE_OPTIONS } from "@/i18n";

const LanguageSelector = () => {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("languageSelector");
  const [isPending, startTransition] = useTransition();

  const handleLocaleChange = (nextLocale: string) => {
    startTransition(async () => {
      await setLocalePreference(nextLocale);
      router.refresh();
    });
  };

  return (
    <label className="relative flex min-h-10 items-center text-[var(--text-muted)]">
      <span className="sr-only">{t("label")}</span>
      <Languages aria-hidden="true" className="pointer-events-none absolute left-2.5" size={16} />
      <select
        aria-label={t("label")}
        className="min-h-10 w-20 cursor-pointer appearance-none rounded-md border border-[var(--border)] bg-white py-2 pr-6 pl-8 text-sm font-medium text-[var(--text)] transition hover:border-[var(--primary)] disabled:cursor-wait disabled:opacity-60"
        disabled={isPending}
        onChange={(event) => handleLocaleChange(event.target.value)}
        value={locale}
      >
        {LOCALE_OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
};

export default LanguageSelector;
