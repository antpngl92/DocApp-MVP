"use server";

import { cookies } from "next/headers";

import { LOCALE_COOKIE_NAME, isAppLocale } from "./config";

const setLocalePreference = async (locale: string) => {
  if (!isAppLocale(locale)) {
    throw new Error("Unsupported locale");
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
};

export { setLocalePreference };
