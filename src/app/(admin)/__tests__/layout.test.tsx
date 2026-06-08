import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminLayout from "../layout";

const sessionBoundary = vi.hoisted(() => ({
  bootstrapOwnerAdminMembershipFromClerkPrivateMetadata: vi.fn(),
  requireOwnerAdminAccess: vi.fn(),
  requireAuthenticatedSession: vi.fn(),
}));

vi.mock("@/server/auth/admin-access", () => ({
  requireOwnerAdminAccess: sessionBoundary.requireOwnerAdminAccess,
}));

vi.mock("@/server/auth/owner-bootstrap", () => ({
  bootstrapOwnerAdminMembershipFromClerkPrivateMetadata:
    sessionBoundary.bootstrapOwnerAdminMembershipFromClerkPrivateMetadata,
}));

vi.mock("@/server/auth/session", () => ({
  requireAuthenticatedSession: sessionBoundary.requireAuthenticatedSession,
}));

vi.mock("@/components/layout", () => ({
  AdminShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="admin-shell">{children}</div>
  ),
}));

describe("AdminLayout", () => {
  it("requires an authenticated session before rendering admin content", async () => {
    sessionBoundary.requireAuthenticatedSession.mockResolvedValueOnce({
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

    expect(sessionBoundary.requireAuthenticatedSession).toHaveBeenCalledTimes(1);
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
    sessionBoundary.requireAuthenticatedSession.mockResolvedValueOnce({
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
  });
});
