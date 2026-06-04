import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, isAppLocale } from "./config";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localePreference = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const locale =
    localePreference && isAppLocale(localePreference) ? localePreference : DEFAULT_LOCALE;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
