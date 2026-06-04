import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";

import AppHeader from "..";

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => {
    const messages: Record<string, string> = {
      overview: "Overview",
      primaryLabel: "Primary navigation",
    };

    return messages[key] ?? key;
  },
}));

vi.mock("@/components/i18n", () => ({
  LanguageSelector: () => <span>Language selector</span>,
}));

describe("AppHeader", () => {
  it("renders the app identity, context, navigation, and language selector", async () => {
    render(
      await AppHeader({
        contextLabel: "Clinic administration",
        navigation: [{ href: "/admin", labelKey: "overview" }],
      }),
    );

    expect(screen.getByText("DocApp")).toBeInTheDocument();
    expect(screen.getByText("Clinic administration")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toHaveAttribute("href", "/admin");
    expect(screen.getByText("Language selector")).toBeInTheDocument();
  });
});
