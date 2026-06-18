import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DoctorProfileOnboardingPage from "../page";

const doctorProfileAccessMock = vi.hoisted(() => ({
  getDoctorProfileAccessForCurrentUser: vi.fn(),
}));

vi.mock("@/server/auth/doctor-profile", () => doctorProfileAccessMock);

vi.mock("@/features/doctor-profile/components", () => ({
  DoctorProfileOnboardingForm: ({
    email,
    initialName,
  }: {
    email: string;
    initialName: string;
  }) => (
    <div data-testid="doctor-profile-form">
      {initialName} {email}
    </div>
  ),
}));

vi.mock("@/features/doctor-profile/actions", () => ({
  createDoctorProfileAction: vi.fn(),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => {
    const messages: Record<string, string> = {
      description: "Complete your profile before using the doctor dashboard.",
      eyebrow: "Doctor onboarding",
      "form.emailHelp": "Email cannot be changed here.",
      "form.emailLabel": "Account email",
      "form.nameError": "Enter your display name.",
      "form.nameLabel": "Display name",
      "form.namePlaceholder": "Dr. Elena Petrova",
      "form.phoneLabel": "Phone",
      "form.phonePlaceholder": "+359 2 000 0000",
      "form.serverError": "The profile could not be submitted.",
      "form.specialtyLabel": "Specialty",
      "form.specialtyPlaceholder": "General practice",
      "form.submitLabel": "Submit doctor profile",
      "form.successMessage": "Profile submitted.",
      pendingDescription: "Your profile is waiting for approval.",
      pendingPanelDescription: "Clinic administration will review it.",
      pendingPanelTitle: "Profile submitted",
      pendingTitle: "Waiting for admin approval",
      title: "Create your doctor profile",
    };

    return messages[key] ?? key;
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("DoctorProfileOnboardingPage", () => {
  it("renders the doctor profile onboarding form", async () => {
    doctorProfileAccessMock.getDoctorProfileAccessForCurrentUser.mockResolvedValueOnce({
      doctor: null,
      membership: {
        id: "member_123",
      },
      status: "profile_required",
      user: {
        email: "doctor@example.com",
        name: "Dr. Example",
      },
    });

    render(await DoctorProfileOnboardingPage());

    expect(screen.getByRole("heading", { name: "Create your doctor profile" })).toBeVisible();
    expect(screen.getByText("Doctor onboarding")).toBeVisible();
    expect(
      screen.getByText("Complete your profile before using the doctor dashboard."),
    ).toBeVisible();
    expect(screen.getByTestId("doctor-profile-form")).toHaveTextContent(
      "Dr. Example doctor@example.com",
    );
  });

  it("renders the pending approval state after profile submission", async () => {
    doctorProfileAccessMock.getDoctorProfileAccessForCurrentUser.mockResolvedValueOnce({
      doctor: {
        id: "doctor_123",
      },
      membership: {
        id: "member_123",
      },
      status: "pending_admin_approval",
      user: {
        email: "doctor@example.com",
        name: "Dr. Example",
      },
    });

    render(await DoctorProfileOnboardingPage());

    expect(screen.getByRole("heading", { name: "Waiting for admin approval" })).toBeVisible();
    expect(screen.getByText("Your profile is waiting for approval.")).toBeVisible();
    expect(screen.queryByTestId("doctor-profile-form")).not.toBeInTheDocument();
  });
});
