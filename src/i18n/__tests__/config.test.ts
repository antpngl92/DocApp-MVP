import { describe, expect, it } from "vitest";

import { DEFAULT_LOCALE, isAppLocale, LOCALE_COOKIE_NAME, LOCALES } from "../config";

describe("i18n config", () => {
  it("defines supported locales and default locale", () => {
    expect(LOCALES).toEqual(["bg", "en", "es", "de", "fr", "it"]);
    expect(DEFAULT_LOCALE).toBe("en");
    expect(LOCALE_COOKIE_NAME).toBe("docapp-locale");
  });

  it("checks whether a string is a supported locale", () => {
    expect(isAppLocale("bg")).toBe(true);
    expect(isAppLocale("en")).toBe(true);
    expect(isAppLocale("pt")).toBe(false);
  });
});
