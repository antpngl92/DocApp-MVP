import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PatientLayout from "../layout";

const sessionBoundary = vi.hoisted(() => ({
  activateStaffInvitationForCurrentUser: vi.fn(),
  requireAuthenticatedSession: vi.fn(),
}));

vi.mock("@/server/auth/staff-onboarding", () => ({
  activateStaffInvitationForCurrentUser: sessionBoundary.activateStaffInvitationForCurrentUser,
}));

vi.mock("@/server/auth/session", () => ({
  requireAuthenticatedSession: sessionBoundary.requireAuthenticatedSession,
}));

vi.mock("@/components/layout", () => ({
  PatientShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="patient-shell">{children}</div>
  ),
}));

describe("PatientLayout", () => {
  it("requires an authenticated session before rendering account content", async () => {
    sessionBoundary.requireAuthenticatedSession.mockResolvedValueOnce({
      sessionId: "session_123",
      userId: "user_123",
    });

    render(
      await PatientLayout({
        children: <div>Account content</div>,
      }),
    );

    expect(sessionBoundary.requireAuthenticatedSession).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.activateStaffInvitationForCurrentUser).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("patient-shell")).toHaveTextContent("Account content");
  });
});
