import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import DashboardPlaceholder from "..";

describe("DashboardPlaceholder", () => {
  it("renders dashboard placeholder content", () => {
    render(
      <DashboardPlaceholder
        description="Placeholder description"
        eyebrow="Placeholder eyebrow"
        title="Placeholder title"
      />,
    );

    expect(screen.getByText("Placeholder eyebrow")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Placeholder title" })).toBeInTheDocument();
    expect(screen.getAllByText("Placeholder description")).toHaveLength(2);
  });
});
