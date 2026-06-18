import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminLayout from "../layout";

const sessionBoundary = vi.hoisted(() => ({
  activateStaffInvitationForCurrentUser: vi.fn(),
  bootstrapOwnerAdminMembershipFromClerkPrivateMetadata: vi.fn(),
  getDoctorProfileAccessForCurrentUser: vi.fn(),
  getAuthenticatedSession: vi.fn(),
  notFound: vi.fn(),
  redirect: vi.fn(),
  requireActiveStaffAccess: vi.fn(),
}));

vi.mock("@/server/auth/admin-access", () => ({
  requireActiveStaffAccess: sessionBoundary.requireActiveStaffAccess,
}));

vi.mock("@/server/auth/owner-bootstrap", () => ({
  bootstrapOwnerAdminMembershipFromClerkPrivateMetadata:
    sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata,
}));

vi.mock("@/server/auth/doctor-profile", () => ({
  getDoctorProfileAccessForCurrentUser: sessionBoundary.getDoctorProfileAccessForCurrentUser,
}));

vi.mock("@/server/auth/session", () => ({
  getAuthenticatedSession: sessionBoundary.getAuthenticatedSession,
}));

vi.mock("@/server/auth/staff-onboarding", () => ({
  activateStaffInvitationForCurrentUser: sessionBoundary.activateStaffInvitationForCurrentUser,
}));

vi.mock("@/components/layout", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-shell">{children}</div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: sessionBoundary.notFound,
  redirect: sessionBoundary.redirect,
}));

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires an authenticated active staff session before rendering dashboard content", async () => {
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

    render(
      await AdminLayout({
        children: <div>Dashboard content</div>,
      }),
    );

    expect(sessionBoundary.getAuthenticatedSession).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.activateStaffInvitationForCurrentUser).toHaveBeenCalledTimes(1);
    expect(
      sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata,
    ).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.requireActiveStaffAccess).toHaveBeenCalledWith({
      membership: {
        id: "member_123",
        role: "doctor",
        status: "active",
        userId: "user_123",
      },
    });
    expect(sessionBoundary.redirect).not.toHaveBeenCalled();
    expect(screen.getByTestId("admin-shell")).toHaveTextContent("Dashboard content");
  });

  it("redirects active doctor staff without a linked doctor profile to onboarding", async () => {
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
    sessionBoundary.redirect.mockImplementationOnce(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(
      AdminLayout({
        children: <div>Dashboard content</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(sessionBoundary.redirect).toHaveBeenCalledWith("/dashboard/onboarding/doctor-profile");
  });

  it("redirects active doctor staff with pending approval to onboarding", async () => {
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
      status: "pending_admin_approval",
      user: {
        id: "user_123",
      },
    });
    sessionBoundary.redirect.mockImplementationOnce(() => {
      throw new Error("NEXT_REDIRECT");
    });

    await expect(
      AdminLayout({
        children: <div>Dashboard content</div>,
      }),
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(sessionBoundary.redirect).toHaveBeenCalledWith("/dashboard/onboarding/doctor-profile");
  });

  it("does not render dashboard content when the signed-in user has no active staff membership", async () => {
    sessionBoundary.getAuthenticatedSession.mockResolvedValueOnce({
      sessionId: "session_123",
      userId: "user_123",
    });
    sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata.mockResolvedValueOnce({
      membership: null,
      role: null,
      status: "no_bootstrap_metadata",
    });
    sessionBoundary.requireActiveStaffAccess.mockImplementationOnce(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      AdminLayout({
        children: <div>Dashboard content</div>,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(sessionBoundary.activateStaffInvitationForCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("returns not found for signed-out dashboard access", async () => {
    sessionBoundary.getAuthenticatedSession.mockResolvedValueOnce({
      sessionId: null,
      userId: null,
    });
    sessionBoundary.notFound.mockImplementationOnce(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      AdminLayout({
        children: <div>Dashboard content</div>,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(sessionBoundary.notFound).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.activateStaffInvitationForCurrentUser).not.toHaveBeenCalled();
  });
});
