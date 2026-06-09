import { describe, expect, it, vi } from "vitest";

import {
  STAFF_MEMBER_ROLE,
  STAFF_MEMBER_STATUS,
  STAFF_ONBOARDING_AUDIT_ACTION,
  STAFF_ONBOARDING_AUDIT_SOURCE,
  STAFF_ONBOARDING_AUDIT_TARGET_TYPE,
  STAFF_ONBOARDING_STATUS,
} from "../consts";
import {
  activateStaffInvitationForCurrentUser,
  getDefaultStaffOnboardingDatabase,
} from "../staff-onboarding";
import type { LocalUserRecord, StaffOnboardingDatabase, StaffOnboardingMembership } from "../type";

const prismaMock = vi.hoisted(() => ({
  prisma: {
    auditEvent: {
      create: vi.fn(),
    },
    organizationMember: {
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
    clerkUserId: "user_clerk_123",
    createdAt: now,
    email: "Staff@Example.com",
    id: "user_local_123",
    name: "Invited Staff",
    updatedAt: now,
    ...overrides,
  };
};

const createMembership = (
  overrides: Partial<StaffOnboardingMembership> = {},
): StaffOnboardingMembership => {
  return {
    id: "member_123",
    invitedEmail: "staff@example.com",
    organizationId: "org_123",
    role: STAFF_MEMBER_ROLE.receptionist,
    status: STAFF_MEMBER_STATUS.invited,
    userId: null,
    ...overrides,
  };
};

const createDatabase = ({
  existingMembership = null,
  localUser = createLocalUser(),
  pendingInvitation = createMembership(),
}: {
  existingMembership?: StaffOnboardingMembership | null;
  localUser?: LocalUserRecord | null;
  pendingInvitation?: StaffOnboardingMembership | null;
} = {}): StaffOnboardingDatabase => {
  return {
    auditEvent: {
      create: vi.fn().mockResolvedValue({ id: "audit_123" }),
    },
    organizationMember: {
      findFirst: vi.fn().mockResolvedValue(pendingInvitation),
      findUnique: vi.fn().mockResolvedValue(existingMembership),
      update: vi.fn().mockImplementation(async ({ data }) => {
        return {
          ...(pendingInvitation ?? createMembership()),
          ...data,
        };
      }),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(localUser),
    },
  };
};

describe("activateStaffInvitationForCurrentUser", () => {
  it("returns the default staff onboarding database", async () => {
    await expect(getDefaultStaffOnboardingDatabase()).resolves.toBe(prismaMock.prisma);
  });

  it("activates a pending staff invitation for the signed-in local user", async () => {
    const localUser = createLocalUser();
    const database = createDatabase({ localUser });

    await expect(
      activateStaffInvitationForCurrentUser({
        authReader: async () => ({ userId: localUser.clerkUserId }),
        database,
      }),
    ).resolves.toEqual({
      membership: {
        id: "member_123",
        invitedEmail: "staff@example.com",
        organizationId: "org_123",
        role: STAFF_MEMBER_ROLE.receptionist,
        status: STAFF_MEMBER_STATUS.active,
        userId: localUser.id,
      },
      status: STAFF_ONBOARDING_STATUS.activated,
    });

    expect(database.organizationMember.findFirst).toHaveBeenCalledWith({
      where: {
        invitedEmail: "staff@example.com",
        status: STAFF_MEMBER_STATUS.invited,
      },
    });
    expect(database.organizationMember.update).toHaveBeenCalledWith({
      data: {
        status: STAFF_MEMBER_STATUS.active,
        userId: localUser.id,
      },
      where: {
        id: "member_123",
      },
    });
    expect(database.auditEvent.create).toHaveBeenCalledWith({
      data: {
        action: STAFF_ONBOARDING_AUDIT_ACTION,
        actorUserId: localUser.id,
        metadata: {
          email: "staff@example.com",
          role: STAFF_MEMBER_ROLE.receptionist,
          source: STAFF_ONBOARDING_AUDIT_SOURCE,
        },
        organizationId: "org_123",
        targetId: "member_123",
        targetType: STAFF_ONBOARDING_AUDIT_TARGET_TYPE,
      },
    });
  });

  it("does not activate staff access for signed-out or missing-local-user sessions", async () => {
    const signedOutDatabase = createDatabase();

    await expect(
      activateStaffInvitationForCurrentUser({
        authReader: async () => ({ userId: null }),
        database: signedOutDatabase,
      }),
    ).resolves.toEqual({
      membership: null,
      status: STAFF_ONBOARDING_STATUS.signedOut,
    });

    const missingUserDatabase = createDatabase({ localUser: null });

    await expect(
      activateStaffInvitationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: missingUserDatabase,
      }),
    ).resolves.toEqual({
      membership: null,
      status: STAFF_ONBOARDING_STATUS.missingLocalUser,
    });

    expect(signedOutDatabase.organizationMember.update).not.toHaveBeenCalled();
    expect(missingUserDatabase.organizationMember.update).not.toHaveBeenCalled();
  });

  it("returns existing active membership without reactivating invitation state", async () => {
    const existingMembership = createMembership({
      status: STAFF_MEMBER_STATUS.active,
      userId: "user_local_123",
    });
    const database = createDatabase({ existingMembership });

    await expect(
      activateStaffInvitationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database,
      }),
    ).resolves.toEqual({
      membership: existingMembership,
      status: STAFF_ONBOARDING_STATUS.alreadyActive,
    });

    expect(database.organizationMember.findFirst).not.toHaveBeenCalled();
    expect(database.organizationMember.update).not.toHaveBeenCalled();
  });

  it("blocks disabled or removed memberships", async () => {
    const existingMembership = createMembership({
      status: STAFF_MEMBER_STATUS.disabled,
      userId: "user_local_123",
    });
    const database = createDatabase({ existingMembership });

    await expect(
      activateStaffInvitationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database,
      }),
    ).resolves.toEqual({
      membership: existingMembership,
      status: STAFF_ONBOARDING_STATUS.disabledOrRemoved,
    });

    expect(database.organizationMember.update).not.toHaveBeenCalled();
  });

  it("does not activate a regular user without a pending local invitation", async () => {
    const database = createDatabase({ pendingInvitation: null });

    await expect(
      activateStaffInvitationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database,
      }),
    ).resolves.toEqual({
      membership: null,
      status: STAFF_ONBOARDING_STATUS.noPendingInvitation,
    });

    expect(database.organizationMember.update).not.toHaveBeenCalled();
  });

  it("does not activate a mismatched or invalid pending invitation", async () => {
    const mismatchedInvitation = createMembership({
      invitedEmail: "other@example.com",
    });
    const mismatchedDatabase = createDatabase({ pendingInvitation: mismatchedInvitation });

    await expect(
      activateStaffInvitationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: mismatchedDatabase,
      }),
    ).resolves.toEqual({
      membership: mismatchedInvitation,
      status: STAFF_ONBOARDING_STATUS.emailMismatch,
    });

    const invalidRoleInvitation = createMembership({
      role: "patient",
    });
    const invalidRoleDatabase = createDatabase({ pendingInvitation: invalidRoleInvitation });

    await expect(
      activateStaffInvitationForCurrentUser({
        authReader: async () => ({ userId: "user_clerk_123" }),
        database: invalidRoleDatabase,
      }),
    ).resolves.toEqual({
      membership: invalidRoleInvitation,
      status: STAFF_ONBOARDING_STATUS.noPendingInvitation,
    });
  });
});
