import { CalendarDays } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import EmptyState from "..";

describe("EmptyState", () => {
  it("renders the title, description, and decorative icon", () => {
    render(
      <EmptyState
        description="There are no appointments yet."
        icon={CalendarDays}
        title="Nothing scheduled"
      />,
    );

    expect(screen.getByRole("heading", { name: "Nothing scheduled" })).toBeInTheDocument();
    expect(screen.getByText("There are no appointments yet.")).toBeInTheDocument();
  });
});
