import { CalendarHeart } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { LanguageSelector } from "@/components/i18n";
import { ROUTES } from "@/config/routes";
import { AuthControls } from "@/features/auth/components";
import { SITE_CONFIG } from "@/config/site";

import type { AppHeaderProps } from "./types";

const AppHeader = async ({
  brandName = SITE_CONFIG.name,
  contextLabel,
  currentUserName,
  navigation,
  showCreateAccount = true,
}: AppHeaderProps) => {
  const t = await getTranslations("navigation");

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white">
      <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Link
          className="flex min-w-0 items-center gap-3"
          href={ROUTES.home}
          aria-label={`${brandName} home`}
        >
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-blue-50 text-[var(--primary)]">
            <CalendarHeart aria-hidden="true" size={21} strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <strong className="block truncate text-base text-[var(--text-strong)]">
              {brandName}
            </strong>
            {contextLabel ? (
              <span className="block truncate text-xs text-[var(--text-muted)]">
                {contextLabel}
              </span>
            ) : null}
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          {currentUserName ? (
            <span className="max-w-36 truncate px-2 text-sm font-semibold text-[var(--text-strong)] sm:max-w-48 sm:px-3">
              {currentUserName}
            </span>
          ) : null}
          <nav aria-label={t("primaryLabel")}>
            <ul className="flex items-center gap-1 sm:gap-2">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    className={
                      item.href === ROUTES.bookingDemo
                        ? "inline-flex min-h-10 items-center rounded-full bg-[var(--primary)] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary-hover)]"
                        : "inline-flex min-h-10 items-center rounded-md px-2 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-muted)] hover:text-[var(--text-strong)] sm:px-3"
                    }
                    href={item.href}
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <AuthControls
            createAccountLabel={t("createAccount")}
            showCreateAccount={showCreateAccount}
            signInLabel={t("signIn")}
            signOutLabel={t("signOut")}
          />
          <LanguageSelector />
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
