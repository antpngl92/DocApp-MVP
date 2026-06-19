import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import PendingDoctorApprovals, { formatApprovalDate } from "..";
import type { PendingDoctorApprovalsContent } from "../types";

const content: PendingDoctorApprovalsContent = {
  approveLabel: "Approve",
  createdLabel: "Submitted",
  emailLabel: "Email",
  emptyDescription: "No pending profiles yet.",
  emptyTitle: "No pending approvals",
  heading: "Pending doctor approvals",
  phoneFallback: "Not provided",
  phoneLabel: "Phone",
  specialtyFallback: "Not provided",
  specialtyLabel: "Specialty",
};

describe("PendingDoctorApprovals", () => {
  it("renders the empty state", () => {
    render(<PendingDoctorApprovals content={content} doctors={[]} onApprove={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Pending doctor approvals" })).toBeInTheDocument();
    expect(screen.getByText("No pending approvals")).toBeInTheDocument();
    expect(screen.getByText("No pending profiles yet.")).toBeInTheDocument();
  });

  it("renders pending doctor approval rows with fallback values", () => {
    render(
      <PendingDoctorApprovals
        content={content}
        doctors={[
          {
            createdAt: new Date("2026-06-18T09:00:00.000Z"),
            email: "doctor@example.com",
            id: "doctor_123",
            name: "Dr. Example",
            phone: null,
            specialty: null,
          },
        ]}
        onApprove={vi.fn()}
      />,
    );

    expect(screen.getByText("Dr. Example")).toBeInTheDocument();
    expect(screen.getByText("doctor@example.com")).toBeInTheDocument();
    expect(screen.getAllByText("Not provided")).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Approve" })).toBeInTheDocument();
  });
});

describe("formatApprovalDate", () => {
  it("formats approval dates for compact table display", () => {
    expect(formatApprovalDate(new Date("2026-06-18T09:00:00.000Z"))).toBe("18 Jun 2026");
  });
});
