import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminLayout from "../layout";

const sessionBoundary = vi.hoisted(() => ({
  activateStaffInvitationForCurrentUser: vi.fn(),
  bootstrapOwnerAdminMembershipFromClerkPrivateMetadata: vi.fn(),
  getAuthenticatedSession: vi.fn(),
  notFound: vi.fn(),
  requireOwnerAdminAccess: vi.fn(),
}));

vi.mock("@/server/auth/admin-access", () => ({
  requireOwnerAdminAccess: sessionBoundary.requireOwnerAdminAccess,
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

vi.mock("@/components/layout", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-shell">{children}</div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: sessionBoundary.notFound,
}));

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requires an authenticated session before rendering admin content", async () => {
    sessionBoundary.getAuthenticatedSession.mockResolvedValueOnce({
      sessionId: "session_123",
      userId: "user_123",
    });
    sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata.mockResolvedValueOnce({
      membership: {
        id: "member_123",
        role: "owner",
        status: "active",
        userId: "user_123",
      },
      role: "owner",
      status: "existing_membership",
    });

    render(
      await AdminLayout({
        children: <div>Admin content</div>,
      }),
    );

    expect(sessionBoundary.getAuthenticatedSession).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.activateStaffInvitationForCurrentUser).toHaveBeenCalledTimes(1);
    expect(
      sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata,
    ).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.requireOwnerAdminAccess).toHaveBeenCalledWith({
      membership: {
        id: "member_123",
        role: "owner",
        status: "active",
        userId: "user_123",
      },
    });
    expect(screen.getByTestId("admin-shell")).toHaveTextContent("Admin content");
  });

  it("does not render admin content when the signed-in user has no owner/admin membership", async () => {
    sessionBoundary.getAuthenticatedSession.mockResolvedValueOnce({
      sessionId: "session_123",
      userId: "user_123",
    });
    sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata.mockResolvedValueOnce({
      membership: null,
      role: null,
      status: "no_bootstrap_metadata",
    });
    sessionBoundary.requireOwnerAdminAccess.mockImplementationOnce(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      AdminLayout({
        children: <div>Admin content</div>,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(sessionBoundary.activateStaffInvitationForCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("returns not found for signed-out admin access", async () => {
    sessionBoundary.getAuthenticatedSession.mockResolvedValueOnce({
      sessionId: null,
      userId: null,
    });
    sessionBoundary.notFound.mockImplementationOnce(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(
      AdminLayout({
        children: <div>Admin content</div>,
      }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(sessionBoundary.notFound).toHaveBeenCalledTimes(1);
    expect(sessionBoundary.activateStaffInvitationForCurrentUser).not.toHaveBeenCalled();
  });
});
