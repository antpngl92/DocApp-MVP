import { describe, expect, it, vi } from "vitest";

import { DOCTOR_PROFILE_CREATION_RESULT_STATUS } from "@/server/auth/consts";

import { createDoctorProfileAction } from "../actions";

const createDoctorProfileMock = vi.hoisted(() => ({
  createDoctorProfileForCurrentUser: vi.fn(),
}));

vi.mock("@/server/auth/doctor-profile-onboarding", () => createDoctorProfileMock);

describe("createDoctorProfileAction", () => {
  it("submits a doctor profile creation payload", async () => {
    createDoctorProfileMock.createDoctorProfileForCurrentUser.mockResolvedValueOnce({
      doctorId: "doctor_123",
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.created,
    });

    await expect(
      createDoctorProfileAction({
        name: "Dr. Example",
        phone: null,
        specialty: "Cardiology",
      }),
    ).resolves.toBeUndefined();

    expect(createDoctorProfileMock.createDoctorProfileForCurrentUser).toHaveBeenCalledWith({
      name: "Dr. Example",
      phone: null,
      specialty: "Cardiology",
    });
  });

  it("treats an existing doctor profile as a successful idempotent result", async () => {
    createDoctorProfileMock.createDoctorProfileForCurrentUser.mockResolvedValueOnce({
      doctorId: "doctor_123",
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.alreadyExists,
    });

    await expect(
      createDoctorProfileAction({
        name: "Dr. Example",
        phone: null,
        specialty: null,
      }),
    ).resolves.toBeUndefined();
  });

  it("throws when the doctor profile cannot be created", async () => {
    createDoctorProfileMock.createDoctorProfileForCurrentUser.mockResolvedValueOnce({
      doctorId: null,
      status: DOCTOR_PROFILE_CREATION_RESULT_STATUS.unauthorized,
    });

    await expect(
      createDoctorProfileAction({
        name: "Dr. Example",
        phone: null,
        specialty: null,
      }),
    ).rejects.toThrow("Doctor profile could not be created.");
  });
});
