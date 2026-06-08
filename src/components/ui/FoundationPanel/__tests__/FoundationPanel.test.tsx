import { CalendarDays } from "lucide-react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import FoundationPanel from "..";

describe("FoundationPanel", () => {
  it("renders panel copy and checklist items", () => {
    render(
      <FoundationPanel
        description="Book safely with clinic rules."
        icon={CalendarDays}
        items={["Choose service", "Pick time"]}
        title="Booking"
      />,
    );

    expect(screen.getByRole("heading", { name: "Booking" })).toBeInTheDocument();
    expect(screen.getByText("Book safely with clinic rules.")).toBeInTheDocument();
    expect(screen.getByText("Choose service")).toBeInTheDocument();
    expect(screen.getByText("Pick time")).toBeInTheDocument();
  });
});
