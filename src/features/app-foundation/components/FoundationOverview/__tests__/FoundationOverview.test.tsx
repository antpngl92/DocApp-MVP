import { CalendarDays } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FoundationOverview from "..";

describe("FoundationOverview", () => {
  it("renders route foundation content", () => {
    render(
      <FoundationOverview
        description="Foundation description"
        eyebrow="Foundation"
        panels={[
          {
            description: "Panel description",
            icon: CalendarDays,
            items: ["First item"],
            title: "Panel title",
          },
        ]}
        title="Foundation title"
      />,
    );

    expect(screen.getByRole("heading", { name: "Foundation title" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Panel title" })).toBeInTheDocument();
    expect(screen.getByText("First item")).toBeInTheDocument();
  });
});
