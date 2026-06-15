import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";

import AppHeader from "..";

vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => {
    const messages: Record<string, string> = {
      createAccount: "Create account",
      dashboard: "Dashboard",
      overview: "Overview",
      primaryLabel: "Primary navigation",
      signIn: "Sign in",
      signOut: "Sign out",
    };

    return messages[key] ?? key;
  },
}));

vi.mock("@/components/i18n", () => ({
  LanguageSelector: () => <span>Language selector</span>,
}));

vi.mock("@/features/auth/components", () => ({
  AuthControls: ({
    createAccountLabel,
    signInLabel,
    signOutLabel,
  }: {
    createAccountLabel: string;
    signInLabel: string;
    signOutLabel: string;
  }) => (
    <span>
      Auth controls: {signInLabel}, {createAccountLabel}, {signOutLabel}
    </span>
  ),
}));

describe("AppHeader", () => {
  it("renders the app identity, context, navigation, and language selector", async () => {
    render(
      await AppHeader({
        contextLabel: "Clinic administration",
        currentUserName: "Clinic Owner",
        navigation: [{ href: "/admin", labelKey: "dashboard" }],
      }),
    );

    expect(screen.getByText("DocApp")).toBeInTheDocument();
    expect(screen.getByText("Clinic administration")).toBeInTheDocument();
    expect(screen.getByText("Clinic Owner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/admin");
    expect(
      screen.getByText("Auth controls: Sign in, Create account, Sign out"),
    ).toBeInTheDocument();
    expect(screen.getByText("Language selector")).toBeInTheDocument();
  });

  it("omits the context label when none is provided", async () => {
    render(
      await AppHeader({
        navigation: [],
      }),
    );

    expect(screen.getByText("DocApp")).toBeInTheDocument();
    expect(screen.queryByText("Clinic administration")).not.toBeInTheDocument();
  });

  it("omits the current user name when none is provided", async () => {
    render(
      await AppHeader({
        currentUserName: null,
        navigation: [],
      }),
    );

    expect(screen.queryByText("Clinic Owner")).not.toBeInTheDocument();
  });
});
