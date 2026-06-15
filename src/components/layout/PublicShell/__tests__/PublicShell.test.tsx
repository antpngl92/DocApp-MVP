import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PublicShell from "..";

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
  it("renders public content with static public navigation", async () => {
    render(
      await PublicShell({
        children: <div>Public content</div>,
        contextLabel: "Public clinic",
      }),
    );

    expect(screen.getByText("Navigation: /booking/sofia-care, /support")).toBeInTheDocument();
    expect(screen.getByLabelText("Public clinic")).toBeInTheDocument();
    expect(screen.getByText("Public content")).toBeInTheDocument();
  });
});
