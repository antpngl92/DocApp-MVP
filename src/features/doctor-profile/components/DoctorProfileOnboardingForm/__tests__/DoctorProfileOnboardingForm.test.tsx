import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DoctorProfileOnboardingForm from "../index";
import type { DoctorProfileOnboardingFormContent } from "../types";

const content: DoctorProfileOnboardingFormContent = {
  emailHelp: "Email cannot be changed here.",
  emailLabel: "Account email",
  nameError: "Enter your display name.",
  nameLabel: "Display name",
  namePlaceholder: "Dr. Elena Petrova",
  phoneLabel: "Phone",
  phonePlaceholder: "+359 2 000 0000",
  serverError: "The profile could not be submitted.",
  specialtyLabel: "Specialty",
  specialtyPlaceholder: "General practice",
  submitLabel: "Submit doctor profile",
  successMessage: "Profile submitted.",
};

describe("DoctorProfileOnboardingForm", () => {
  it("renders prefilled name and read-only account email", () => {
    render(
      <DoctorProfileOnboardingForm
        content={content}
        email="doctor@example.com"
        initialName="Dr. Example"
      />,
    );

    expect(screen.getByLabelText("Display name")).toHaveValue("Dr. Example");
    expect(screen.getByLabelText("Account email")).toHaveValue("doctor@example.com");
    expect(screen.getByLabelText("Account email")).toHaveAttribute("readonly");
  });

  it("validates required display name before submit", async () => {
    const onSubmit = vi.fn();

    render(
      <DoctorProfileOnboardingForm
        content={content}
        email="doctor@example.com"
        initialName=""
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit doctor profile" }));

    expect(await screen.findByText("Enter your display name.")).toBeVisible();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits normalized profile fields", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <DoctorProfileOnboardingForm
        content={content}
        email="doctor@example.com"
        initialName="Dr. Example"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText("Display name"), {
      target: {
        value: "  Dr.   Elena   Petrova  ",
      },
    });
    fireEvent.change(screen.getByLabelText("Phone"), {
      target: {
        value: "  +359 2 000 0000  ",
      },
    });
    fireEvent.change(screen.getByLabelText("Specialty"), {
      target: {
        value: "  Cardiology  ",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit doctor profile" }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: "Dr. Elena Petrova",
        phone: "+359 2 000 0000",
        specialty: "Cardiology",
      });
    });
    expect(await screen.findByText("Profile submitted.")).toBeVisible();
  });

  it("shows a server error when submit fails", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("failed"));

    render(
      <DoctorProfileOnboardingForm
        content={content}
        email="doctor@example.com"
        initialName="Dr. Example"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Submit doctor profile" }));

    expect(await screen.findByText("The profile could not be submitted.")).toBeVisible();
  });
});
