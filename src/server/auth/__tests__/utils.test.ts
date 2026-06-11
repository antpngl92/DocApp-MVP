import { describe, expect, it, vi } from "vitest";

import {
  OWNER_BOOTSTRAP_MEMBERSHIP_STATUS,
  OWNER_BOOTSTRAP_ROLE,
  OWNER_BOOTSTRAP_STATUS,
} from "../consts";
import type { LocalUserRecord, OwnerBootstrapDatabase } from "../type";
import {
  createClerkStaffInvitation,
  createOwnerAdminMembership,
  getDefaultOwnerBootstrapDatabase,
  getStaffInvitationRedirectUrl,
  hasDocAppBootstrapMetadata,
  mapClerkBackendUserToBootstrapProfile,
  parseOwnerBootstrapRole,
  readClerkBootstrapProfile,
  readCurrentClerkAuth,
  upsertLocalUserFromClerkProfile,
} from "../utils";

const clerkMocks = vi.hoisted(() => ({
  auth: vi.fn(),
  createInvitation: vi.fn(),
  getUser: vi.fn(),
}));

const prismaMock = vi.hoisted(() => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    organization: {
      findFirst: vi.fn(),
    },
    organizationMember: {
      create: vi.fn(),
      findUnique: vi.fn(),
    },
    auditEvent: {
      create: vi.fn(),
    },
  },
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: clerkMocks.auth,
  clerkClient: vi.fn(async () => ({
    invitations: {
      createInvitation: clerkMocks.createInvitation,
    },
    users: {
      getUser: clerkMocks.getUser,
    },
  })),
}));

vi.mock("@/lib/prisma", () => prismaMock);

const createLocalUser = (overrides: Partial<LocalUserRecord> = {}): LocalUserRecord => {
  const now = new Date("2026-06-08T09:00:00.000Z");

  return {
    clerkUserId: "user_clerk_123",
    createdAt: now,
    email: "owner@example.com",
    id: "user_local_123",
    name: "Clinic Owner",
    updatedAt: now,
    ...overrides,
  };
};

const createDatabase = ({
  existingMembership = null,
  organization = { id: "org_123" },
}: {
  existingMembership?: {
    id: string;
    role: string;
    status: string;
    userId: string | null;
  } | null;
  organization?: { id: string } | null;
} = {}): OwnerBootstrapDatabase => {
  return {
    auditEvent: {
      create: vi.fn().mockResolvedValue({ id: "audit_123" }),
    },
    organization: {
      findFirst: vi.fn().mockResolvedValue(organization),
    },
    organizationMember: {
      create: vi.fn().mockImplementation(async ({ data }) => ({
        id: "member_123",
        role: data.role,
        status: data.status,
        userId: data.userId,
      })),
      findUnique: vi.fn().mockResolvedValue(existingMembership),
    },
    user: {
      findUnique: vi.fn(),
      upsert: vi.fn().mockResolvedValue(createLocalUser()),
    },
  };
};

describe("auth utils", () => {
  it("parses bootstrap metadata only from supported object shapes", () => {
    expect(parseOwnerBootstrapRole(null)).toBeNull();
    expect(parseOwnerBootstrapRole([])).toBeNull();
    expect(parseOwnerBootstrapRole({ docapp: null })).toBeNull();
    expect(
      parseOwnerBootstrapRole({
        docapp: {
          bootstrapRole: OWNER_BOOTSTRAP_ROLE.owner,
        },
      }),
    ).toBe(OWNER_BOOTSTRAP_ROLE.owner);
    expect(hasDocAppBootstrapMetadata(null)).toBe(false);
    expect(
      hasDocAppBootstrapMetadata({
        docapp: {
          bootstrapRole: "doctor",
        },
      }),
    ).toBe(true);
  });

  it("returns the default owner bootstrap database", async () => {
    await expect(getDefaultOwnerBootstrapDatabase()).resolves.toBe(prismaMock.prisma);
  });

  it("reads current Clerk auth through the Clerk SDK", async () => {
    clerkMocks.auth.mockResolvedValueOnce({ userId: "user_clerk_123" });

    await expect(readCurrentClerkAuth()).resolves.toEqual({ userId: "user_clerk_123" });
  });

  it("reads a Clerk bootstrap profile through the Backend API", async () => {
    clerkMocks.getUser.mockResolvedValueOnce({
      emailAddresses: [{ emailAddress: "Owner@Example.com", id: "email_primary" }],
      firstName: "Clinic",
      id: "user_clerk_123",
      lastName: "Owner",
      primaryEmailAddressId: "email_primary",
      privateMetadata: {
        docapp: {
          bootstrapRole: "owner",
        },
      },
    });

    await expect(readClerkBootstrapProfile("user_clerk_123")).resolves.toMatchObject({
      localUserInput: {
        clerkUserId: "user_clerk_123",
        email: "owner@example.com",
        name: "Clinic Owner",
      },
    });
  });

  it("creates a Clerk staff invitation through the Backend API", async () => {
    clerkMocks.createInvitation.mockResolvedValueOnce({ id: "inv_123" });

    await expect(
      createClerkStaffInvitation({
        emailAddress: "staff@example.com",
        redirectUrl: "http://localhost:3000/sign-up",
      }),
    ).resolves.toEqual({ id: "inv_123" });

    expect(clerkMocks.createInvitation).toHaveBeenCalledWith({
      emailAddress: "staff@example.com",
      redirectUrl: "http://localhost:3000/sign-up",
    });
  });

  it("builds an absolute staff invitation redirect URL from the public app URL", () => {
    expect(
      getStaffInvitationRedirectUrl({
        NEXT_PUBLIC_APP_URL: "https://clinic.example.com",
        NEXT_PUBLIC_CLERK_SIGN_UP_URL: "/join",
      }),
    ).toBe("https://clinic.example.com/join");
  });

  it("falls back to the default app URL and sign-up route for the redirect URL", () => {
    expect(getStaffInvitationRedirectUrl({})).toBe("http://localhost:3000/sign-up");
  });

  it("maps Clerk profile names to null when no display name is available", () => {
    expect(
      mapClerkBackendUserToBootstrapProfile({
        emailAddresses: [{ emailAddress: "owner@example.com", id: "email_primary" }],
        firstName: null,
        id: "user_clerk_123",
        lastName: null,
        primaryEmailAddressId: "email_primary",
        username: null,
      }),
    ).toMatchObject({
      localUserInput: {
        name: null,
      },
    });
  });

  it("upserts local user data from a Clerk profile", async () => {
    const database = createDatabase();

    await upsertLocalUserFromClerkProfile(database, {
      clerkUserId: "user_clerk_123",
      email: "owner@example.com",
      name: "Clinic Owner",
    });

    expect(database.user.upsert).toHaveBeenCalledWith({
      create: {
        clerkUserId: "user_clerk_123",
        email: "owner@example.com",
        name: "Clinic Owner",
      },
      update: {
        email: "owner@example.com",
        name: "Clinic Owner",
      },
      where: {
        clerkUserId: "user_clerk_123",
      },
    });
  });

  it("returns existing membership before creating a new owner/admin membership", async () => {
    const localUser = createLocalUser();
    const database = createDatabase({
      existingMembership: {
        id: "member_123",
        role: OWNER_BOOTSTRAP_ROLE.owner,
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
        userId: localUser.id,
      },
    });

    await expect(
      createOwnerAdminMembership({
        database,
        localUser,
        role: OWNER_BOOTSTRAP_ROLE.owner,
      }),
    ).resolves.toEqual({
      membership: {
        id: "member_123",
        role: OWNER_BOOTSTRAP_ROLE.owner,
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
        userId: localUser.id,
      },
      role: OWNER_BOOTSTRAP_ROLE.owner,
      status: OWNER_BOOTSTRAP_STATUS.existingMembership,
    });
    expect(database.organizationMember.create).not.toHaveBeenCalled();
  });

  it("returns null role for an existing non-owner/admin membership", async () => {
    const localUser = createLocalUser();
    const database = createDatabase({
      existingMembership: {
        id: "member_123",
        role: "doctor",
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
        userId: localUser.id,
      },
    });

    await expect(
      createOwnerAdminMembership({
        database,
        localUser,
        role: OWNER_BOOTSTRAP_ROLE.owner,
      }),
    ).resolves.toMatchObject({
      role: null,
      status: OWNER_BOOTSTRAP_STATUS.existingMembership,
    });
  });

  it("skips membership creation when there is no active organization", async () => {
    const database = createDatabase({ organization: null });

    await expect(
      createOwnerAdminMembership({
        database,
        localUser: createLocalUser(),
        role: OWNER_BOOTSTRAP_ROLE.admin,
      }),
    ).resolves.toMatchObject({
      membership: null,
      role: OWNER_BOOTSTRAP_ROLE.admin,
      status: OWNER_BOOTSTRAP_STATUS.noActiveOrganization,
    });
  });
});
