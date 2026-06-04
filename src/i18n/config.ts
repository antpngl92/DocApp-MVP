const LOCALES = ["bg", "en", "es", "de", "fr", "it"] as const;

type AppLocale = (typeof LOCALES)[number];

const DEFAULT_LOCALE: AppLocale = "en";
const LOCALE_COOKIE_NAME = "docapp-locale";

const isAppLocale = (value: string): value is AppLocale => {
  return LOCALES.includes(value as AppLocale);
};

export { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, LOCALES, isAppLocale };
export type { AppLocale };
