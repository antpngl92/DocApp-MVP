import { NextIntlClientProvider } from "next-intl";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { setLocalePreference } from "@/i18n/actions";

import LanguageSelector from "..";

const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh }),
}));

vi.mock("@/i18n/actions", () => ({
  setLocalePreference: vi.fn(),
}));

describe("LanguageSelector", () => {
  beforeEach(() => {
    refresh.mockClear();
    vi.mocked(setLocalePreference).mockClear();
  });

  it("offers every supported language and persists a selection", async () => {
    const user = userEvent.setup();

    render(
      <NextIntlClientProvider locale="en" messages={{ languageSelector: { label: "Language" } }}>
        <LanguageSelector />
      </NextIntlClientProvider>,
    );

    const selector = screen.getByRole("combobox", { name: "Language" });
    expect(screen.getAllByRole("option")).toHaveLength(6);
    expect(screen.getByRole("option", { name: "BG" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "IT" })).toBeInTheDocument();

    await user.selectOptions(selector, "bg");

    expect(setLocalePreference).toHaveBeenCalledWith("bg");
    expect(refresh).toHaveBeenCalledOnce();
  });
});
