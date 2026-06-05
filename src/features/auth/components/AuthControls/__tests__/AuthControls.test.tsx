import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AuthControls from "..";

const clerkState = vi.hoisted(() => ({
  isSignedIn: false,
}));

vi.mock("@clerk/nextjs", () => ({
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

    expect(screen.getByRole("link", { name: "Sign in" })).toHaveAttribute("href", "/sign-in");
    expect(screen.getByRole("link", { name: "Create account" })).toHaveAttribute(
      "href",
      "/sign-up",
    );
    expect(screen.queryByRole("button", { name: "Sign out" })).not.toBeInTheDocument();
  });

  it("renders a logout button for signed-in users", () => {
    clerkState.isSignedIn = true;

    render(<AuthControls {...defaultProps} />);

    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    expect(screen.getByTestId("sign-out-wrapper")).toHaveAttribute("data-redirect-url", "/");
    expect(screen.queryByRole("link", { name: "Sign in" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Create account" })).not.toBeInTheDocument();
  });
});
