import { describe, expect, it, vi } from "vitest";

import { STAFF_INVITATION_RESULT_STATUS } from "@/server/auth/consts";

const staffInvitationMock = vi.hoisted(() => ({
  createStaffInvitation: vi.fn(),
}));

vi.mock("@/server/auth/staff-invitation", () => staffInvitationMock);

describe("createStaffInvitationAction", () => {
  it("resolves when the server invitation is sent", async () => {
    staffInvitationMock.createStaffInvitation.mockResolvedValueOnce({
      clerkInvitationId: "inv_123",
      organizationId: "org_123",
      status: STAFF_INVITATION_RESULT_STATUS.sent,
    });
    const { createStaffInvitationAction } = await import("../actions");

    await expect(
      createStaffInvitationAction({
        email: "staff@example.com",
        role: "doctor",
      }),
    ).resolves.toBeUndefined();
  });

  it("throws a generic error when the server invitation is not sent", async () => {
    staffInvitationMock.createStaffInvitation.mockResolvedValueOnce({
      clerkInvitationId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.unauthorized,
    });
    const { createStaffInvitationAction } = await import("../actions");

    await expect(
      createStaffInvitationAction({
        email: "staff@example.com",
        role: "doctor",
      }),
    ).rejects.toThrow("Staff invitation could not be sent.");
  });
});
