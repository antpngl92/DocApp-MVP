import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AuthControls from "..";

const clerkState = vi.hoisted(() => ({
  isSignedIn: false,
}));

vi.mock("@clerk/nextjs", () => ({
  SignInButton: ({ children, mode }: { children: React.ReactNode; mode: "redirect" | "modal" }) => (
    <span data-mode={mode} data-testid="sign-in-wrapper">
      {children}
    </span>
  ),
  SignOutButton: ({
    children,
    redirectUrl,
  }: {
    children: React.ReactNode;
    redirectUrl: string;
  }) => (
    <span data-redirect-url={redirectUrl} data-testid="sign-out-wrapper">
      {children}
    </span>
  ),
  SignUpButton: ({ children, mode }: { children: React.ReactNode; mode: "redirect" | "modal" }) => (
    <span data-mode={mode} data-testid="sign-up-wrapper">
      {children}
    </span>
  ),
  useAuth: () => ({
    isSignedIn: clerkState.isSignedIn,
  }),
}));

describe("AuthControls", () => {
  const defaultProps = {
    createAccountLabel: "Create account",
    signInLabel: "Sign in",
    signOutLabel: "Sign out",
  };

  it("renders sign-in and account creation links for signed-out visitors", () => {
    clerkState.isSignedIn = false;

    render(<AuthControls {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByTestId("sign-in-wrapper")).toHaveAttribute("data-mode", "redirect");
    expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument();
    expect(screen.getByTestId("sign-up-wrapper")).toHaveAttribute("data-mode", "redirect");
    expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument();
  });

  it("renders a logout button for signed-in users", () => {
    clerkState.isSignedIn = true;

    render(<AuthControls {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.getByTestId("sign-out-wrapper")).toHaveAttribute("data-redirect-url", "/");
    expect(screen.queryByRole("button", { name: "Sign in" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Create account" })).not.toBeInTheDocument();
  });
});
