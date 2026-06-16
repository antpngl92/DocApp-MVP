import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import PatientLayout from "../layout";

const sessionBoundary = vi.hoisted(() => ({
  activateStaffInvitationForCurrentUser: vi.fn(),
  getAuthenticatedHomeForCurrentUser: vi.fn(),
  redirect: vi.fn(),
  requireAuthenticatedSession: vi.fn(),
}));

vi.mock("@/server/auth/navigation", () => ({
  getAuthenticatedHomeForCurrentUser: sessionBoundary.getAuthenticatedHomeForCurrentUser,
}));

vi.mock("@/server/auth/staff-onboarding", () => ({
  activateStaffInvitationForCurrentUser: sessionBoundary.activateStaffInvitationForCurrentUser,
}));

vi.mock("@/server/auth/session", () => ({
  requireAuthenticatedSession: sessionBoundary.requireAuthenticatedSession,
}));

vi.mock("next/navigation", () => ({
  redirect: sessionBoundary.redirect,
}));

vi.mock("@/components/layout", () => ({
  PatientShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="patient-shell">{children}</div>
  ),
}));

describe("PatientLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires an authenticated session before rendering account content", async () => {
    sessionBoundary.requireAuthenticatedSession.mockResolvedValueOnce({
      sessionId: "session_123",
      userId: "user_123",
    });
    sessionBoundary.getAuthenticatedHomeForCurrentUser.mockResolvedValueOnce("/account");

    render(
      await PatientLayout({
        children: <div>Account content</div>,
      }),
    );

    expect(sessionBoundary.requireAuthenticatedSession).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.activateStaffInvitationForCurrentUser).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.getAuthenticatedHomeForCurrentUser).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.redirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("patient-shell")).toHaveTextContent("Account content");
  });

  it("redirects active staff users from account content to their dashboard", async () => {
    sessionBoundary.requireAuthenticatedSession.mockResolvedValueOnce({
      sessionId: "session_123",
      userId: "user_123",
    });
    sessionBoundary.getAuthenticatedHomeForCurrentUser.mockResolvedValueOnce("/dashboard");
    sessionBoundary.redirect.mockImplementationOnce(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(
      PatientLayout({
        children: <div>Account content</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(sessionBoundary.activateStaffInvitationForCurrentUser).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.redirect).toHaveBeenCalledWith("/dashboard");
  });
});
