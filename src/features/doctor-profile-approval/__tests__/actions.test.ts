import { describe, expect, it, vi } from "vitest";

import { DOCTOR_PROFILE_APPROVAL_RESULT_STATUS } from "@/server/auth/consts";

const approvalMock = vi.hoisted(() => ({
  approveDoctorProfileForCurrentAdmin: vi.fn(),
}));

const cacheMock = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/server/auth/doctor-profile-approval", () => approvalMock);
vi.mock("next/cache", () => cacheMock);

describe("approveDoctorProfileAction", () => {
  it("approves a doctor profile and revalidates the dashboard", async () => {
    approvalMock.approveDoctorProfileForCurrentAdmin.mockResolvedValueOnce({
      doctorId: "doctor_123",
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.approved,
    });
    const { approveDoctorProfileAction } = await import("../actions");

    await expect(approveDoctorProfileAction("doctor_123")).resolves.toBeUndefined();

    expect(approvalMock.approveDoctorProfileForCurrentAdmin).toHaveBeenCalledWith({
      doctorId: "doctor_123",
    });
    expect(cacheMock.revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("treats already-approved profiles as idempotent success", async () => {
    approvalMock.approveDoctorProfileForCurrentAdmin.mockResolvedValueOnce({
      doctorId: "doctor_123",
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.alreadyApproved,
    });
    const { approveDoctorProfileAction } = await import("../actions");

    await expect(approveDoctorProfileAction("doctor_123")).resolves.toBeUndefined();
  });

  it("throws a generic error when approval fails", async () => {
    approvalMock.approveDoctorProfileForCurrentAdmin.mockResolvedValueOnce({
      doctorId: null,
      status: DOCTOR_PROFILE_APPROVAL_RESULT_STATUS.unauthorized,
    });
    const { approveDoctorProfileAction } = await import("../actions");

    await expect(approveDoctorProfileAction("doctor_123")).rejects.toThrow(
      "Doctor profile could not be approved.",
    );
  });
});
