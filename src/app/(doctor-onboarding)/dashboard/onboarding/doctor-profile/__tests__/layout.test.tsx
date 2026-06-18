import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import DoctorProfileOnboardingLayout from "../layout";

const sessionBoundary = vi.hoisted(() => ({
  activateStaffInvitationForCurrentUser: vi.fn(),
  bootstrapOwnerAdminMembershipFromClerkPrivateMetadata: vi.fn(),
  getAuthenticatedSession: vi.fn(),
  getDoctorProfileAccessForCurrentUser: vi.fn(),
  notFound: vi.fn(),
  redirect: vi.fn(),
  requireActiveStaffAccess: vi.fn(),
}));

vi.mock("@/components/layout", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-shell">{children}</div>
  ),
}));

vi.mock("@/server/auth/admin-access", () => ({
  requireActiveStaffAccess: sessionBoundary.requireActiveStaffAccess,
}));

vi.mock("@/server/auth/doctor-profile", () => ({
  getDoctorProfileAccessForCurrentUser: sessionBoundary.getDoctorProfileAccessForCurrentUser,
}));

vi.mock("@/server/auth/owner-bootstrap", () => ({
  bootstrapOwnerAdminMembershipFromClerkPrivateMetadata:
    sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata,
}));

vi.mock("@/server/auth/session", () => ({
  getAuthenticatedSession: sessionBoundary.getAuthenticatedSession,
}));

vi.mock("@/server/auth/staff-onboarding", () => ({
  activateStaffInvitationForCurrentUser: sessionBoundary.activateStaffInvitationForCurrentUser,
}));

vi.mock("next/navigation", () => ({
  notFound: sessionBoundary.notFound,
  redirect: sessionBoundary.redirect,
}));

describe("DoctorProfileOnboardingLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders only for signed-in active doctor staff without a linked doctor profile", async () => {
    sessionBoundary.getAuthenticatedSession.mockResolvedValueOnce({
      sessionId: "session_123",
      userId: "user_123",
    });
    sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata.mockResolvedValueOnce({
      membership: {
        id: "member_123",
        role: "doctor",
        status: "active",
        userId: "user_123",
      },
      role: null,
      status: "existing_membership",
    });
    sessionBoundary.getDoctorProfileAccessForCurrentUser.mockResolvedValueOnce({
      doctor: null,
      membership: {
        id: "member_123",
        role: "doctor",
        status: "active",
        userId: "user_123",
      },
      status: "profile_required",
      user: {
        id: "user_123",
      },
    });

    render(
      await DoctorProfileOnboardingLayout({
        children: <div>Doctor onboarding content</div>,
      }),
    );

    expect(sessionBoundary.activateStaffInvitationForCurrentUser).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.requireActiveStaffAccess).toHaveBeenCalledWith({
      membership: {
        id: "member_123",
        role: "doctor",
        status: "active",
        userId: "user_123",
      },
    });
    expect(sessionBoundary.redirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("admin-shell")).toHaveTextContent("Doctor onboarding content");
  });

  it("redirects users who no longer need doctor profile onboarding back to dashboard", async () => {
    sessionBoundary.getAuthenticatedSession.mockResolvedValueOnce({
      sessionId: "session_123",
      userId: "user_123",
    });
    sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata.mockResolvedValueOnce({
      membership: {
        id: "member_123",
        role: "doctor",
        status: "active",
        userId: "user_123",
      },
      role: null,
      status: "existing_membership",
    });
    sessionBoundary.getDoctorProfileAccessForCurrentUser.mockResolvedValueOnce({
      doctor: {
        id: "doctor_123",
      },
      membership: {
        id: "member_123",
        role: "doctor",
        status: "active",
        userId: "user_123",
      },
      status: "ready",
      user: {
        id: "user_123",
      },
    });
    sessionBoundary.redirect.mockImplementationOnce(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(
      DoctorProfileOnboardingLayout({
        children: <div>Doctor onboarding content</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(sessionBoundary.redirect).toHaveBeenCalledWith("/dashboard");
  });

  it("returns not found for signed-out onboarding access", async () => {
    sessionBoundary.getAuthenticatedSession.mockResolvedValueOnce({
      sessionId: null,
      userId: null,
    });
    sessionBoundary.notFound.mockImplementationOnce(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      DoctorProfileOnboardingLayout({
        children: <div>Doctor onboarding content</div>,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(sessionBoundary.notFound).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.activateStaffInvitationForCurrentUser).not.toHaveBeenCalled();
  });
});
