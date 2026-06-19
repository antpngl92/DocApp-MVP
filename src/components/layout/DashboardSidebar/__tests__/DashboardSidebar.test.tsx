import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import DashboardSidebar from "..";

const navigationState = vi.hoisted(() => ({
  pathname: "/dashboard/staff",
}));

vi.mock("next/navigation", () => ({
  usePathname: () => navigationState.pathname,
}));

vi.mock("@clerk/nextjs", () => ({
  SignOutButton: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const sidebarContent = {
  collapseLabel: "Collapse sidebar",
  expandLabel: "Expand sidebar",
  navigationLabel: "Dashboard navigation",
  signOutLabel: "Sign out",
};

const sidebarItems = [
  {
    href: "/dashboard",
    iconKey: "layoutDashboard" as const,
    label: "Dashboard",
  },
  {
    href: "/dashboard/staff",
    iconKey: "users" as const,
    label: "Staff Members",
  },
];

describe("DashboardSidebar", () => {
  it("renders role-aware links and marks the active item", () => {
    render(
      <DashboardSidebar
        content={sidebarContent}
        currentUserName="Admin User"
        items={sidebarItems}
      />,
    );

    expect(screen.getByText("Admin User")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Dashboard navigation" })).toBeInTheDocument();
    expect(screen.getByRole("link", { current: "page", name: /staff members/i })).toHaveAttribute(
      "href",
      "/dashboard/staff",
    );
    expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
  });

  it("collapses and expands item labels", async () => {
    const user = userEvent.setup();

    render(
      <DashboardSidebar
        content={sidebarContent}
        currentUserName="Admin User"
        items={sidebarItems}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));

    expect(screen.queryByText("Admin User")).not.toBeInTheDocument();
    expect(screen.queryByText("Staff Members")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "DocApp dashboard" })).toHaveAttribute(
      "href",
      "/dashboard",
    );
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeInTheDocument();
  });

  it("marks the dashboard root active without requiring a current user name", () => {
    navigationState.pathname = "/dashboard";

    render(
      <DashboardSidebar content={sidebarContent} currentUserName={null} items={sidebarItems} />,
    );

    expect(screen.queryByText("Admin User")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { current: "page", name: /dashboard/i })).toHaveAttribute(
      "href",
      "/dashboard",
    );
  });
});
