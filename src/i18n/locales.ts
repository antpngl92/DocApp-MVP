import type { AppLocale } from "./config";

type LocaleOption = Readonly<{
  code: AppLocale;
  label: string;
}>;

const LOCALE_OPTIONS: readonly LocaleOption[] = [
  { code: "bg", label: "BG" },
  { code: "en", label: "EN" },
  { code: "es", label: "ES" },
  { code: "de", label: "DE" },
  { code: "fr", label: "FR" },
  { code: "it", label: "IT" },
];

export { LOCALE_OPTIONS };
export type { LocaleOption };
