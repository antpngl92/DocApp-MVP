import { describe, expect, it } from "vitest";

import { LOCALES } from "@/i18n";

import bg from "../messages/bg.json";
import de from "../messages/de.json";
import en from "../messages/en.json";
import es from "../messages/es.json";
import fr from "../messages/fr.json";
import italian from "../messages/it.json";

const getMessageKeys = (value: unknown, prefix = ""): string[] => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [prefix];
  }

  return Object.entries(value).flatMap(([key, nestedValue]) =>
    getMessageKeys(nestedValue, prefix ? `${prefix}.${key}` : key),
  );
};

describe("i18n messages", () => {
  it("keeps every supported locale aligned with the English catalog", () => {
    const catalogs = { bg, de, en, es, fr, it: italian };
    const expectedKeys = getMessageKeys(en).sort();

    expect(Object.keys(catalogs).sort()).toEqual([...LOCALES].sort());

    for (const catalog of Object.values(catalogs)) {
      expect(getMessageKeys(catalog).sort()).toEqual(expectedKeys);
    }
  });
});
