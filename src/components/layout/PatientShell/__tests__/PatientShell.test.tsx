import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PatientShell from "..";

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async () => {
    return (key: string) => `navigation.${key}`;
  }),
}));

vi.mock("../../AppShell", () => ({
  default: ({ children, contextLabel }: { children: React.ReactNode; contextLabel: string }) => (
    <section aria-label={contextLabel}>
      <div>{children}</div>
    </section>
  ),
}));

describe("PatientShell", () => {
  it("renders the patient context around children", async () => {
    render(await PatientShell({ children: <div>Patient content</div> }));

    expect(screen.getByLabelText("navigation.patientContext")).toBeInTheDocument();
    expect(screen.getByText("Patient content")).toBeInTheDocument();
  });
});
