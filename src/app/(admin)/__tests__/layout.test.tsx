import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import AdminLayout from "../layout";

const sessionBoundary = vi.hoisted(() => ({
  activateStaffInvitationForCurrentUser: vi.fn(),
  bootstrapOwnerAdminMembershipFromClerkPrivateMetadata: vi.fn(),
  getAuthenticatedSession: vi.fn(),
  notFound: vi.fn(),
  requireActiveStaffAccess: vi.fn(),
}));

vi.mock("@/server/auth/admin-access", () => ({
  requireActiveStaffAccess: sessionBoundary.requireActiveStaffAccess,
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
  AdminShell: ({
    children,
    membershipRole,
  }: {
    children: React.ReactNode;
    membershipRole: string;
  }) => (
    <div data-membership-role={membershipRole} data-testid="admin-shell">
      {children}
    </div>
  ),
}));

vi.mock("next/navigation", () => ({
  notFound: sessionBoundary.notFound,
}));

describe("AdminLayout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(["admin", "receptionist"])(
    "renders dashboard content for active %s staff",
    async (role) => {
      sessionBoundary.getAuthenticatedSession.mockResolvedValueOnce({
        sessionId: "session_123",
        userId: "user_123",
      });
      sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata.mockResolvedValueOnce({
        membership: {
          id: "member_123",
          role,
          status: "active",
          userId: "user_123",
        },
        role: null,
        status: "existing_membership",
      });

      render(await AdminLayout({ children: <div>Dashboard content</div> }));

      expect(sessionBoundary.activateStaffInvitationForCurrentUser).toHaveBeenCalledTimes(1);
      expect(sessionBoundary.requireActiveStaffAccess).toHaveBeenCalledWith({
        membership: expect.objectContaining({ role }),
      });
      expect(screen.getByTestId("admin-shell")).toHaveAttribute("data-membership-role", role);
      expect(screen.getByTestId("admin-shell")).toHaveTextContent("Dashboard content");
    },
  );

  it("does not render dashboard content without active staff membership", async () => {
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

    await expect(AdminLayout({ children: <div>Dashboard content</div> })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it("returns not found for signed-out dashboard access", async () => {
    sessionBoundary.getAuthenticatedSession.mockResolvedValueOnce({
      sessionId: null,
      userId: null,
    });
    sessionBoundary.notFound.mockImplementationOnce(() => {
      throw new Error("NEXT_NOT_FOUND");
    });

    await expect(AdminLayout({ children: <div>Dashboard content</div> })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    expect(sessionBoundary.activateStaffInvitationForCurrentUser).not.toHaveBeenCalled();
  });
});
