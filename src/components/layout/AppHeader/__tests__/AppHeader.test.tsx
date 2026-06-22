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
    showCreateAccount,
    signInLabel,
    signOutLabel,
  }: {
    createAccountLabel: string;
    showCreateAccount?: boolean;
    signInLabel: string;
    signOutLabel: string;
  }) => (
    <span>
      Auth controls: {signInLabel}, {createAccountLabel}, {signOutLabel}, show create account:{" "}
      {String(showCreateAccount)}
    </span>
  ),
}));

describe("AppHeader", () => {
  it("renders the app identity, context, navigation, and language selector", async () => {
    render(
      await AppHeader({
        contextLabel: "Clinic administration",
        currentUserName: "Clinic Owner",
        navigation: [{ href: "/dashboard", labelKey: "dashboard" }],
      }),
    );

    expect(screen.getByText("DocApp")).toBeInTheDocument();
    expect(screen.getByText("Clinic administration")).toBeInTheDocument();
    expect(screen.getByText("Clinic Owner")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(
      screen.getByText(
        "Auth controls: Sign in, Create account, Sign out, show create account: true",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Language selector")).toBeInTheDocument();
  });

  it("renders clinic branding and hides account creation when configured", async () => {
    render(
      await AppHeader({
        brandName: "Sofia Care Clinic",
        navigation: [{ href: "/booking/sofia-care", labelKey: "booking" }],
        showCreateAccount: false,
      }),
    );

    expect(screen.getByText("Sofia Care Clinic")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "booking" })).toHaveAttribute(
      "href",
      "/booking/sofia-care",
    );
    expect(
      screen.getByText(
        "Auth controls: Sign in, Create account, Sign out, show create account: false",
      ),
    ).toBeInTheDocument();
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
