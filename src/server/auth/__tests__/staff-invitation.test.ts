import { describe, expect, it, vi } from "vitest";

import {
  OWNER_BOOTSTRAP_MEMBERSHIP_STATUS,
  OWNER_BOOTSTRAP_ROLE,
  STAFF_INVITATION_RESULT_STATUS,
  STAFF_MEMBER_ROLE,
} from "../consts";
import { createStaffInvitation, isValidStaffInvitationEmail } from "../staff-invitation";
import type { LocalUserRecord, StaffInvitationDatabase } from "../type";

const prismaMock = vi.hoisted(() => ({
  prisma: {
    organization: {
      findFirst: vi.fn(),
    },
    organizationMember: {
      findUnique: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("@/lib/prisma", () => prismaMock);

const createLocalUser = (overrides: Partial<LocalUserRecord> = {}): LocalUserRecord => {
  const now = new Date("2026-06-09T08:00:00.000Z");

  return {
    clerkUserId: "user_clerk_owner",
    createdAt: now,
    email: "owner@example.com",
    id: "user_owner",
    name: "Clinic Owner",
    updatedAt: now,
    ...overrides,
  };
};

const createDatabase = ({
  localUser = createLocalUser(),
  membership = {
    role: OWNER_BOOTSTRAP_ROLE.owner,
    status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
  },
  organization = { id: "org_123" },
}: {
  localUser?: LocalUserRecord | null;
  membership?: { role: string; status: string } | null;
  organization?: { id: string } | null;
} = {}): StaffInvitationDatabase => {
  return {
    organization: {
      findFirst: vi.fn().mockResolvedValue(organization),
    },
    organizationMember: {
      findUnique: vi.fn().mockResolvedValue(membership),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(localUser),
    },
  };
};

describe("isValidStaffInvitationEmail", () => {
  it("validates normalized staff invitation email addresses", () => {
    expect(isValidStaffInvitationEmail(" Staff@Example.COM ")).toBe(true);
    expect(isValidStaffInvitationEmail("not-an-email")).toBe(false);
  });
});

describe("createStaffInvitation", () => {
  it("returns the default staff invitation database", async () => {
    const { getDefaultStaffInvitationDatabase } = await import("../staff-invitation");

    await expect(getDefaultStaffInvitationDatabase()).resolves.toBe(prismaMock.prisma);
  });

  it("creates a Clerk staff invitation for an active owner/admin", async () => {
    const database = createDatabase();
    const invitationCreator = vi.fn().mockResolvedValue({ id: "inv_123" });

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database,
        email: " Staff@Example.COM ",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.doctor,
      }),
    ).resolves.toEqual({
      clerkInvitationId: "inv_123",
      organizationId: "org_123",
      status: STAFF_INVITATION_RESULT_STATUS.sent,
    });

    expect(invitationCreator).toHaveBeenCalledWith({
      emailAddress: "staff@example.com",
      redirectUrl: "http://localhost:3000/sign-up",
    });
  });

  it("can use the default database and tolerate Clerk invitations without a returned ID", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValueOnce(createLocalUser());
    prismaMock.prisma.organizationMember.findUnique.mockResolvedValueOnce({
      role: OWNER_BOOTSTRAP_ROLE.admin,
      status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
    });
    prismaMock.prisma.organization.findFirst.mockResolvedValueOnce({ id: "org_default" });
    const invitationCreator = vi.fn().mockResolvedValue({});

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toEqual({
      clerkInvitationId: null,
      organizationId: "org_default",
      status: STAFF_INVITATION_RESULT_STATUS.sent,
    });
  });

  it("does not call Clerk for invalid email or invalid role input", async () => {
    const invitationCreator = vi.fn();

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database: createDatabase(),
        email: "nope",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.doctor,
      }),
    ).resolves.toEqual({
      clerkInvitationId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.invalidEmail,
    });

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database: createDatabase(),
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.owner,
      }),
    ).resolves.toEqual({
      clerkInvitationId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.invalidRole,
    });

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database: createDatabase(),
        email: "staff@example.com",
        invitationCreator,
        role: "patient" as typeof STAFF_MEMBER_ROLE.doctor,
      }),
    ).resolves.toEqual({
      clerkInvitationId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.invalidRole,
    });

    expect(invitationCreator).not.toHaveBeenCalled();
  });

  it("requires a signed-in local owner/admin membership", async () => {
    const invitationCreator = vi.fn();

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: null }),
        database: createDatabase(),
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toMatchObject({
      status: STAFF_INVITATION_RESULT_STATUS.unauthorized,
    });

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database: createDatabase({
          membership: { role: STAFF_MEMBER_ROLE.manager, status: "active" },
        }),
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toMatchObject({
      status: STAFF_INVITATION_RESULT_STATUS.unauthorized,
    });

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database: createDatabase({ localUser: null }),
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toMatchObject({
      status: STAFF_INVITATION_RESULT_STATUS.unauthorized,
    });

    expect(invitationCreator).not.toHaveBeenCalled();
  });

  it("requires an active local organization before calling Clerk", async () => {
    const invitationCreator = vi.fn();

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database: createDatabase({ organization: null }),
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toEqual({
      clerkInvitationId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.noActiveOrganization,
    });

    expect(invitationCreator).not.toHaveBeenCalled();
  });
});
