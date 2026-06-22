import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PublicShell from "..";

vi.mock("../../AppShell", () => ({
  default: ({
    children,
    brandName,
    contextLabel,
    navigation,
    showCreateAccount,
  }: {
    brandName?: string;
    children: React.ReactNode;
    contextLabel: string;
    navigation: readonly { href: string; labelKey: string }[];
    showCreateAccount?: boolean;
  }) => (
    <section aria-label={contextLabel}>
      <span>Brand: {brandName}</span>
      <span>Show create account: {String(showCreateAccount)}</span>
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
        brandName: "Sofia Care Clinic",
        contextLabel: "Public clinic",
        showCreateAccount: false,
      }),
    );

    expect(screen.getByText("Navigation: /support, /booking/sofia-care")).toBeInTheDocument();
    expect(screen.getByText("Brand: Sofia Care Clinic")).toBeInTheDocument();
    expect(screen.getByText("Show create account: false")).toBeInTheDocument();
    expect(screen.getByLabelText("Public clinic")).toBeInTheDocument();
    expect(screen.getByText("Public content")).toBeInTheDocument();
  });
});
