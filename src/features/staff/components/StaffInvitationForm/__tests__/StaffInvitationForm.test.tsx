import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { STAFF_MEMBER_ROLE } from "@/server/auth/consts";

import StaffInvitationForm from "..";
import type { StaffInvitationFormContent, StaffInvitationRoleOption } from "../types";

const content: StaffInvitationFormContent = {
  connectedLater: "Sending is connected in the next task.",
  emailError: "Enter a valid staff email address.",
  emailLabel: "Staff email",
  emailPlaceholder: "staff@example.com",
  roleLabel: "Role",
  submitLabel: "Invite staff",
  successMessage: "Invitation details are ready.",
};

const roleOptions: readonly StaffInvitationRoleOption[] = [
  { label: "Admin", value: STAFF_MEMBER_ROLE.admin },
  { label: "Manager", value: STAFF_MEMBER_ROLE.manager },
  { label: "Receptionist", value: STAFF_MEMBER_ROLE.receptionist },
  { label: "Doctor", value: STAFF_MEMBER_ROLE.doctor },
];

describe("StaffInvitationForm", () => {
  it("renders staff email input and role dropdown", () => {
    render(<StaffInvitationForm content={content} roleOptions={roleOptions} />);

    expect(screen.getByLabelText("Staff email")).toBeInTheDocument();
    expect(screen.getByLabelText("Role")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Invite staff" })).toBeInTheDocument();
    expect(screen.getByText("Sending is connected in the next task.")).toBeInTheDocument();
  });

  it("validates missing or invalid email before submitting", async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn();

    render(<StaffInvitationForm content={content} onInvite={onInvite} roleOptions={roleOptions} />);

    await user.click(screen.getByRole("button", { name: "Invite staff" }));
    expect(screen.getByText("Enter a valid staff email address.")).toBeInTheDocument();
    expect(onInvite).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText("Staff email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Invite staff" }));
    expect(screen.getByText("Enter a valid staff email address.")).toBeInTheDocument();
    expect(onInvite).not.toHaveBeenCalled();
  });

  it("submits normalized email and selected role to the handler", async () => {
    const user = userEvent.setup();
    const onInvite = vi.fn();

    render(<StaffInvitationForm content={content} onInvite={onInvite} roleOptions={roleOptions} />);

    await user.type(screen.getByLabelText("Staff email"), " Reception@Example.COM ");
    await user.selectOptions(screen.getByLabelText("Role"), STAFF_MEMBER_ROLE.doctor);
    await user.click(screen.getByRole("button", { name: "Invite staff" }));

    expect(onInvite).toHaveBeenCalledWith({
      email: "reception@example.com",
      role: STAFF_MEMBER_ROLE.doctor,
    });
    expect(screen.getByText("Invitation details are ready.")).toBeInTheDocument();
  });

  it("does not expose patient or owner self-registration content", () => {
    render(<StaffInvitationForm content={content} roleOptions={roleOptions} />);

    expect(screen.queryByText(/patient/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/owner/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /owner/i })).not.toBeInTheDocument();
  });
});
