import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminLayout from "../layout";

const sessionBoundary = vi.hoisted(() => ({
  requireAuthenticatedSession: vi.fn(),
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

    render(
      await AdminLayout({
        children: <div>Admin content</div>,
      }),
    );

    expect(sessionBoundary.requireAuthenticatedSession).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("admin-shell")).toHaveTextContent("Admin content");
  });
});
