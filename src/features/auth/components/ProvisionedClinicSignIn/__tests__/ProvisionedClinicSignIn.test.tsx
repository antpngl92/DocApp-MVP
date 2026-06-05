import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProvisionedClinicSignIn from "..";

describe("ProvisionedClinicSignIn", () => {
  it("renders provisioned clinic access copy around the Clerk sign-in surface", () => {
    render(
      <ProvisionedClinicSignIn
        accessNote="Clinic-side access is provisioned by an administrator."
        clerkSignIn={<div>Clerk sign in</div>}
        description="Use the account that was created for clinic operations."
        eyebrow="Secure clinic access"
        helpText="Need access? Contact the clinic owner."
        title="Sign in to DocApp"
      />,
    );

    expect(screen.getByRole("heading", { name: "Sign in to DocApp" })).toBeInTheDocument();
    expect(
      screen.getByText("Clinic-side access is provisioned by an administrator."),
    ).toBeInTheDocument();
    expect(screen.getByText("Clerk sign in")).toBeInTheDocument();
    expect(screen.getByText("Need access? Contact the clinic owner.")).toBeInTheDocument();
  });
});
