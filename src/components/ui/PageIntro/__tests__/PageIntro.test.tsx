import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PageIntro from "..";

describe("PageIntro", () => {
  it("renders optional eyebrow, title, and description", () => {
    render(<PageIntro description="Manage bookings." eyebrow="Clinic" title="Dashboard" />);

    expect(screen.getByText("Clinic")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Manage bookings.")).toBeInTheDocument();
  });

  it("omits eyebrow when it is not provided", () => {
    render(<PageIntro description="Manage bookings." title="Dashboard" />);

    expect(screen.queryByText("Clinic")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Dashboard" })).toBeInTheDocument();
  });
});
