import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AuthLayout from "../layout";

vi.mock("@/components/layout", () => ({
  PublicShell: ({ children }: { children: React.ReactNode }) => (
    <div>
      <nav aria-label="Primary">Public navbar</nav>
      {children}
    </div>
  ),
}));

describe("AuthLayout", () => {
  it("wraps auth pages with the public shell navigation", () => {
    render(
      <AuthLayout>
        <div>Auth page</div>
      </AuthLayout>,
    );

    expect(screen.getByRole("navigation", { name: "Primary" })).toHaveTextContent("Public navbar");
    expect(screen.getByText("Auth page")).toBeInTheDocument();
  });
});
