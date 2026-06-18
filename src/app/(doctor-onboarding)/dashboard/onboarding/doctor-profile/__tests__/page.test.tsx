import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import DoctorProfileOnboardingPage from "../page";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => (key: string) => {
    const messages: Record<string, string> = {
      description: "Complete your profile before using the doctor dashboard.",
      eyebrow: "Doctor onboarding",
      panelDescription: "The profile form is coming next.",
      panelTitle: "Profile form coming next",
      title: "Create your doctor profile",
    };

    return messages[key] ?? key;
  }),
}));

describe("DoctorProfileOnboardingPage", () => {
  it("renders the required doctor profile onboarding placeholder", async () => {
    render(await DoctorProfileOnboardingPage());

    expect(screen.getByRole("heading", { name: "Create your doctor profile" })).toBeVisible();
    expect(screen.getByText("Doctor onboarding")).toBeVisible();
    expect(
      screen.getByText("Complete your profile before using the doctor dashboard."),
    ).toBeVisible();
    expect(screen.getByText("Profile form coming next")).toBeVisible();
  });
});
