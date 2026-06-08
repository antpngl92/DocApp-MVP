import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PublicShell from "..";

vi.mock("../../AppShell", () => ({
  default: ({ children, contextLabel }: { children: React.ReactNode; contextLabel: string }) => (
    <section aria-label={contextLabel}>
      <div>{children}</div>
    </section>
  ),
}));

describe("PublicShell", () => {
  it("renders public content with the provided context label", () => {
    render(
      <PublicShell contextLabel="Public clinic">
        <div>Public content</div>
      </PublicShell>,
    );

    expect(screen.getByLabelText("Public clinic")).toBeInTheDocument();
    expect(screen.getByText("Public content")).toBeInTheDocument();
  });
});
