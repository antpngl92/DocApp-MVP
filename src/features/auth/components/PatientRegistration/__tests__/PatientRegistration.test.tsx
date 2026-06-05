import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PatientRegistration from "..";

describe("PatientRegistration", () => {
  it("renders patient registration copy around the Clerk sign-up surface", () => {
    const { container } = render(
      <PatientRegistration
        clerkSignUp={<div>Clerk sign up</div>}
        description="Create an account to manage appointments."
        eyebrow="Account"
        privacyNote="Use this account for appointment management only."
        title="Create account"
      />,
    );

    expect(screen.getByRole("heading", { name: "Create account" })).toBeInTheDocument();
    expect(screen.getByText("Clerk sign up")).toBeInTheDocument();
    expect(
      screen.getByText("Use this account for appointment management only."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/patient account/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/patient accounts/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/register as a patient/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/staff/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/invitation/i)).not.toBeInTheDocument();
    expect(container.querySelector("main")).not.toBeInTheDocument();
  });
});
