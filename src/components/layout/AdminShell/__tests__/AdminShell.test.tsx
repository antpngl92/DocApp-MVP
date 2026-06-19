import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AdminShell from "..";

const authState = vi.hoisted(() => ({
  getCurrentAuthenticatedUser: vi.fn(),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: vi.fn(async (namespace: string) => {
    return (key: string) => `${namespace}.${key}`;
  }),
}));

vi.mock("@/server/auth/current-user", () => ({
  CURRENT_AUTHENTICATED_USER_STATUS: {
    authenticated: "authenticated",
  },
  getCurrentAuthenticatedUser: authState.getCurrentAuthenticatedUser,
}));

vi.mock("@/server/auth/utils", () => ({
  getLocalUserDisplayName: () => "Dr. Test User",
}));

vi.mock("../../DashboardSidebar", () => ({
  default: ({
    children,
    currentUserName,
    items,
  }: {
    children?: React.ReactNode;
    currentUserName: string | null;
    items: Array<{ href: string; label: string }>;
  }) => (
    <aside data-current-user={currentUserName ?? ""}>
      {items.map((item) => (
        <a href={item.href} key={item.href}>
          {item.label}
        </a>
      ))}
      <div>{children}</div>
    </aside>
  ),
}));

describe("AdminShell", () => {
  it("renders admin dashboard navigation around children", async () => {
    authState.getCurrentAuthenticatedUser.mockResolvedValueOnce({
      status: "authenticated",
      user: {
        email: "admin@example.com",
        name: "Admin User",
      },
    });

    render(await AdminShell({ children: <div>Admin content</div>, membershipRole: "admin" }));

    expect(screen.getByText("dashboardShell.navigation.dashboard")).toBeInTheDocument();
    expect(screen.getByText("dashboardShell.navigation.staffMembers")).toBeInTheDocument();
    expect(screen.getByText("dashboardShell.navigation.logs")).toBeInTheDocument();
    expect(screen.getByText("Admin content")).toBeInTheDocument();
  });

  it("filters dashboard navigation for receptionists", async () => {
    authState.getCurrentAuthenticatedUser.mockResolvedValueOnce({
      status: "authenticated",
      user: {
        email: "frontdesk@example.com",
        name: "Front Desk",
      },
    });

    render(
      await AdminShell({
        children: <div>Reception content</div>,
        membershipRole: "receptionist",
      }),
    );

    expect(screen.getByText("dashboardShell.navigation.schedule")).toBeInTheDocument();
    expect(screen.getByText("dashboardShell.navigation.manualBooking")).toBeInTheDocument();
    expect(screen.queryByText("dashboardShell.navigation.staffMembers")).not.toBeInTheDocument();
    expect(screen.queryByText("dashboardShell.navigation.logs")).not.toBeInTheDocument();
  });

  it("renders without a current user name when the local user is unavailable", async () => {
    authState.getCurrentAuthenticatedUser.mockResolvedValueOnce({
      status: "signed_out",
      user: null,
    });

    render(await AdminShell({ children: <div>Admin content</div>, membershipRole: "admin" }));

    expect(screen.getByText("dashboardShell.navigation.dashboard")).toBeInTheDocument();
    expect(screen.getByText("Admin content")).toBeInTheDocument();
  });
});
