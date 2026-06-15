import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AppShell from "..";

vi.mock("@/server/auth/current-user", () => ({
  CURRENT_AUTHENTICATED_USER_STATUS: {
    authenticated: "authenticated",
    missingLocalUser: "missing_local_user",
    signedOut: "signed_out",
  },
  getCurrentAuthenticatedUser: vi.fn(async () => ({
    clerkUserId: "user_clerk_123",
    status: "authenticated",
    user: {
      clerkUserId: "user_clerk_123",
      createdAt: new Date("2026-06-13T08:00:00.000Z"),
      email: "owner@example.com",
      id: "user_local_123",
      name: "Clinic Owner",
      updatedAt: new Date("2026-06-13T08:00:00.000Z"),
    },
  })),
}));

vi.mock("@/server/auth/utils", () => ({
  getLocalUserDisplayName: vi.fn(() => "Clinic Owner"),
}));

vi.mock("../../AppHeader", () => ({
  default: ({
    contextLabel,
    currentUserName,
  }: {
    contextLabel: string;
    currentUserName: string | null;
  }) => (
    <header>
      {contextLabel}
      <span>{currentUserName}</span>
    </header>
  ),
}));

describe("AppShell", () => {
  it("renders app header, current user name, and one main content landmark", async () => {
    render(
      await AppShell({
        children: <p>Shell content</p>,
        contextLabel: "Clinic admin",
        navigation: [],
        showCurrentUserName: true,
      }),
    );

    expect(screen.getByText("Clinic admin")).toBeInTheDocument();
    expect(screen.getByText("Clinic Owner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Shell content");
  });

  it("does not load or render the current user name by default", async () => {
    render(
      await AppShell({
        children: <p>Shell content</p>,
        contextLabel: "Public clinic",
        navigation: [],
      }),
    );

    expect(screen.getByText("Public clinic")).toBeInTheDocument();
    expect(screen.queryByText("Clinic Owner")).not.toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Shell content");
  });
});
