import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PublicShell from "..";

const navigationMock = vi.hoisted(() => ({
  getPublicNavigationForCurrentUser: vi.fn(),
}));

vi.mock("@/server/auth/navigation", () => ({
  getPublicNavigationForCurrentUser: navigationMock.getPublicNavigationForCurrentUser,
}));

vi.mock("../../AppShell", () => ({
  default: ({
    children,
    contextLabel,
    navigation,
  }: {
    children: React.ReactNode;
    contextLabel: string;
    navigation: readonly { href: string; labelKey: string }[];
  }) => (
    <section aria-label={contextLabel}>
      <span>Navigation: {navigation.map((item) => item.href).join(", ")}</span>
      <div>{children}</div>
    </section>
  ),
}));

describe("PublicShell", () => {
  it("renders public content with navigation for the current user", async () => {
    navigationMock.getPublicNavigationForCurrentUser.mockResolvedValueOnce([
      { href: "/booking/sofia-care", labelKey: "booking" },
      { href: "/account", labelKey: "appointments" },
    ]);

    render(
      await PublicShell({
        children: <div>Public content</div>,
        contextLabel: "Public clinic",
      }),
    );

    expect(navigationMock.getPublicNavigationForCurrentUser).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Navigation: /booking/sofia-care, /account")).toBeInTheDocument();
    expect(screen.getByLabelText("Public clinic")).toBeInTheDocument();
    expect(screen.getByText("Public content")).toBeInTheDocument();
  });
});
