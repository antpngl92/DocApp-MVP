import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AppShell from "..";

vi.mock("../../AppHeader", () => ({
  default: ({ contextLabel }: { contextLabel: string }) => <header>{contextLabel}</header>,
}));

describe("AppShell", () => {
  it("renders app header and one main content landmark", () => {
    render(
      <AppShell contextLabel="Clinic admin" navigation={[]}>
        <p>Shell content</p>
      </AppShell>,
    );

    expect(screen.getByText("Clinic admin")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Shell content");
  });
});
