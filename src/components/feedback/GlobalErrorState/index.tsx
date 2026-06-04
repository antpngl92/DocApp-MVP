"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";

import type { GlobalErrorStateProps } from "./types";

const GlobalErrorState = ({ reset }: GlobalErrorStateProps) => {
  const t = useTranslations("feedback");

  return (
    <main className="mx-auto grid min-h-screen max-w-xl place-items-center px-4 py-10">
      <section className="w-full rounded-lg border border-[var(--border)] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
        <span className="mx-auto grid size-12 place-items-center rounded-lg bg-red-50 text-[var(--danger)]">
          <TriangleAlert aria-hidden="true" size={22} />
        </span>
        <h1 className="mt-4 text-xl font-bold text-[var(--text-strong)]">{t("errorTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{t("errorDescription")}</p>
        <button
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--primary)] px-4 text-sm font-bold text-white transition hover:bg-[var(--primary-hover)]"
          onClick={reset}
          type="button"
        >
          <RotateCcw aria-hidden="true" size={16} />
          {t("retry")}
        </button>
      </section>
    </main>
  );
};

export default GlobalErrorState;
