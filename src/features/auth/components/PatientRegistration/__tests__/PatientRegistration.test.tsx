import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PatientRegistration from "..";

describe("PatientRegistration", () => {
  it("renders patient registration copy around the Clerk sign-up surface", () => {
    const { container } = render(
      <PatientRegistration
        clerkSignUp={<div>Clerk sign up</div>}
        description="Create an account to manage appointments."
        eyebrow="Patient account"
        helpText="Clinic staff access is by invitation only."
        privacyNote="Patient accounts are for appointments only."
        title="Create account"
      />,
    );

    expect(screen.getByRole("heading", { name: "Create account" })).toBeInTheDocument();
    expect(screen.getByText("Clerk sign up")).toBeInTheDocument();
    expect(screen.getByText("Patient accounts are for appointments only.")).toBeInTheDocument();
    expect(screen.getByText("Clinic staff access is by invitation only.")).toBeInTheDocument();
    expect(container.querySelector("main")).not.toBeInTheDocument();
  });
});
