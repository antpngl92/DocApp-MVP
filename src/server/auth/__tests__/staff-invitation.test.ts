import { describe, expect, it, vi } from "vitest";

import {
  CLERK_INVITATION_STATUS,
  OWNER_BOOTSTRAP_MEMBERSHIP_STATUS,
  OWNER_BOOTSTRAP_ROLE,
  PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE,
  STAFF_INVITATION_AUDIT_ACTION,
  STAFF_INVITATION_RESULT_STATUS,
  STAFF_MEMBER_ROLE,
  STAFF_MEMBER_STATUS,
} from "../consts";
import { createStaffInvitation, isValidStaffInvitationEmail } from "../staff-invitation";
import type {
  LocalUserRecord,
  StaffInvitationDatabase,
  StaffInvitationPendingMembership,
} from "../type";

const prismaMock = vi.hoisted(() => ({
  prisma: {
    auditEvent: {
      create: vi.fn(),
    },
    organization: {
      findFirst: vi.fn(),
    },
    organizationMember: {
      create: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
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

const createPendingMembership = (
  overrides: Partial<StaffInvitationPendingMembership> = {},
): StaffInvitationPendingMembership => {
  return {
    clerkInvitationId: null,
    clerkInvitationStatus: null,
    id: "member_pending",
    invitedEmail: "staff@example.com",
    organizationId: "org_123",
    role: STAFF_MEMBER_ROLE.receptionist,
    status: STAFF_MEMBER_STATUS.invited,
    ...overrides,
  };
};

const createDatabase = ({
  existingInvitedMembership = null,
  localUser = createLocalUser(),
  membership = {
    role: OWNER_BOOTSTRAP_ROLE.admin,
    status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
  },
  organization = { id: "org_123" },
}: {
  existingInvitedMembership?: StaffInvitationPendingMembership | null;
  localUser?: LocalUserRecord | null;
  membership?: { role: string; status: string } | null;
  organization?: { id: string } | null;
} = {}): StaffInvitationDatabase => {
  const pendingMembership = createPendingMembership();

  return {
    auditEvent: {
      create: vi.fn().mockResolvedValue({}),
    },
    organization: {
      findFirst: vi.fn().mockResolvedValue(organization),
    },
    organizationMember: {
      create: vi.fn().mockResolvedValue(pendingMembership),
      delete: vi.fn().mockResolvedValue(pendingMembership),
      findFirst: vi.fn().mockResolvedValue(existingInvitedMembership),
      findUnique: vi.fn().mockResolvedValue(membership),
      update: vi.fn().mockImplementation(async (args) => {
        return {
          ...pendingMembership,
          clerkInvitationId: args.data.clerkInvitationId,
          clerkInvitationStatus: args.data.clerkInvitationStatus,
        };
      }),
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

  it("stores a pending membership with the Clerk invitation ID and status", async () => {
    const database = createDatabase();
    const invitationCreator = vi.fn().mockResolvedValue({ id: "inv_123" });

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database,
        email: " Staff@Example.COM ",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toEqual({
      clerkInvitationId: "inv_123",
      membershipId: "member_pending",
      organizationId: "org_123",
      status: STAFF_INVITATION_RESULT_STATUS.sent,
    });

    expect(invitationCreator).toHaveBeenCalledWith({
      emailAddress: "staff@example.com",
      redirectUrl: "http://localhost:3000/sign-up",
    });
    expect(database.organizationMember.create).toHaveBeenCalledWith({
      data: {
        invitedEmail: "staff@example.com",
        organizationId: "org_123",
        role: STAFF_MEMBER_ROLE.receptionist,
        status: STAFF_MEMBER_STATUS.invited,
      },
    });
    expect(database.organizationMember.update).toHaveBeenCalledWith({
      data: {
        clerkInvitationId: "inv_123",
        clerkInvitationStatus: CLERK_INVITATION_STATUS.pending,
      },
      where: {
        id: "member_pending",
      },
    });
    expect(database.auditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        action: STAFF_INVITATION_AUDIT_ACTION,
        actorUserId: "user_owner",
        organizationId: "org_123",
        targetId: "member_pending",
      }),
    });
    expect(database.organizationMember.delete).not.toHaveBeenCalled();
  });

  it("can use the default database and tolerate Clerk invitations without a returned ID", async () => {
    prismaMock.prisma.user.findUnique.mockResolvedValueOnce(createLocalUser());
    prismaMock.prisma.organizationMember.findUnique.mockResolvedValueOnce({
      role: OWNER_BOOTSTRAP_ROLE.admin,
      status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
    });
    prismaMock.prisma.organization.findFirst.mockResolvedValueOnce({ id: "org_123" });
    prismaMock.prisma.organizationMember.findFirst.mockResolvedValueOnce(null);
    prismaMock.prisma.organizationMember.create.mockResolvedValueOnce(createPendingMembership());
    prismaMock.prisma.organizationMember.update.mockResolvedValueOnce(
      createPendingMembership({
        clerkInvitationId: null,
        clerkInvitationStatus: CLERK_INVITATION_STATUS.pending,
      }),
    );
    prismaMock.prisma.auditEvent.create.mockResolvedValueOnce({});
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
      membershipId: "member_pending",
      organizationId: "org_123",
      status: STAFF_INVITATION_RESULT_STATUS.sent,
    });
  });

  it("returns already invited when a pending or active membership exists for the email", async () => {
    const database = createDatabase({
      existingInvitedMembership: createPendingMembership({
        clerkInvitationId: "inv_existing",
        clerkInvitationStatus: CLERK_INVITATION_STATUS.pending,
      }),
    });
    const invitationCreator = vi.fn();

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database,
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toEqual({
      clerkInvitationId: "inv_existing",
      membershipId: "member_pending",
      organizationId: "org_123",
      status: STAFF_INVITATION_RESULT_STATUS.alreadyInvited,
    });

    expect(database.organizationMember.findFirst).toHaveBeenCalledWith({
      where: {
        invitedEmail: "staff@example.com",
        organizationId: "org_123",
        status: {
          in: [STAFF_MEMBER_STATUS.active, STAFF_MEMBER_STATUS.invited],
        },
      },
    });
    expect(database.organizationMember.create).not.toHaveBeenCalled();
    expect(invitationCreator).not.toHaveBeenCalled();
  });

  it("returns already invited when a concurrent request creates the membership first", async () => {
    const concurrentMembership = createPendingMembership({
      clerkInvitationId: "inv_concurrent",
      clerkInvitationStatus: CLERK_INVITATION_STATUS.pending,
      id: "member_concurrent",
    });
    const database = createDatabase();
    const invitationCreator = vi.fn();

    vi.mocked(database.organizationMember.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(concurrentMembership);
    vi.mocked(database.organizationMember.create).mockRejectedValueOnce({
      code: PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE,
    });

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database,
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toEqual({
      clerkInvitationId: "inv_concurrent",
      membershipId: "member_concurrent",
      organizationId: "org_123",
      status: STAFF_INVITATION_RESULT_STATUS.alreadyInvited,
    });

    expect(invitationCreator).not.toHaveBeenCalled();
  });

  it("rethrows non-unique membership creation errors", async () => {
    const database = createDatabase();
    const invitationCreator = vi.fn();

    vi.mocked(database.organizationMember.findFirst).mockResolvedValueOnce(null);
    vi.mocked(database.organizationMember.create).mockRejectedValueOnce(new Error("database down"));

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database,
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).rejects.toThrow("database down");

    expect(invitationCreator).not.toHaveBeenCalled();
  });

  it("removes the pending membership when the Clerk invitation fails", async () => {
    const database = createDatabase();
    const invitationCreator = vi.fn().mockRejectedValue(new Error("Clerk unavailable"));

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database,
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).rejects.toThrow("Clerk unavailable");

    expect(database.organizationMember.delete).toHaveBeenCalledWith({
      where: {
        id: "member_pending",
      },
    });
    expect(database.organizationMember.update).not.toHaveBeenCalled();
    expect(database.auditEvent.create).not.toHaveBeenCalled();
  });

  it("revokes the Clerk invitation and removes the pending membership when tracking fails", async () => {
    const database = createDatabase();
    const invitationCreator = vi.fn().mockResolvedValue({ id: "inv_rollback" });
    const invitationRevoker = vi.fn().mockResolvedValue({});

    vi.mocked(database.organizationMember.update).mockRejectedValueOnce(
      new Error("tracking failed"),
    );

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database,
        email: "staff@example.com",
        invitationCreator,
        invitationRevoker,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).rejects.toThrow("tracking failed");

    expect(invitationRevoker).toHaveBeenCalledWith("inv_rollback");
    expect(database.organizationMember.delete).toHaveBeenCalledWith({
      where: {
        id: "member_pending",
      },
    });
    expect(database.auditEvent.create).not.toHaveBeenCalled();
  });

  it("does not fail a sent and tracked invitation when audit logging fails", async () => {
    const database = createDatabase();
    const invitationCreator = vi.fn().mockResolvedValue({ id: "inv_123" });

    vi.mocked(database.auditEvent.create).mockRejectedValueOnce(new Error("audit unavailable"));

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database,
        email: "staff@example.com",
        invitationCreator,
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toEqual({
      clerkInvitationId: "inv_123",
      membershipId: "member_pending",
      organizationId: "org_123",
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
        role: STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toEqual({
      clerkInvitationId: null,
      membershipId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.invalidEmail,
    });

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database: createDatabase(),
        email: "staff@example.com",
        invitationCreator,
        role: "owner" as typeof STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toEqual({
      clerkInvitationId: null,
      membershipId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.invalidRole,
    });

    await expect(
      createStaffInvitation({
        authReader: async () => ({ userId: "user_clerk_owner" }),
        database: createDatabase(),
        email: "staff@example.com",
        invitationCreator,
        role: "patient" as typeof STAFF_MEMBER_ROLE.receptionist,
      }),
    ).resolves.toEqual({
      clerkInvitationId: null,
      membershipId: null,
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
          membership: { role: STAFF_MEMBER_ROLE.receptionist, status: "active" },
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
      membershipId: null,
      organizationId: null,
      status: STAFF_INVITATION_RESULT_STATUS.noActiveOrganization,
    });

    expect(invitationCreator).not.toHaveBeenCalled();
  });
});
