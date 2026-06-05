import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import AccountSignIn from "..";

describe("AccountSignIn", () => {
  it("renders neutral account sign-in copy around the Clerk sign-in surface", () => {
    render(
      <AccountSignIn
        clerkSignIn={<div>Clerk sign in</div>}
        description="Sign in to continue to your DocApp account."
        eyebrow="Account access"
        helpText="New here? Create an account from the registration page."
        securityNote="DocApp protects account access through Clerk."
        title="Sign in"
      />,
    );

    expect(screen.getByRole("heading", { name: "Sign in" })).toBeInTheDocument();
    expect(screen.getByText("DocApp protects account access through Clerk.")).toBeInTheDocument();
    expect(screen.getByText("Clerk sign in")).toBeInTheDocument();
    expect(
      screen.getByText("New here? Create an account from the registration page."),
    ).toBeInTheDocument();
  });
});
