import { describe, expect, it, vi } from "vitest";

import type { LocalUserRecord } from "../local-user";
import {
  bootstrapOwnerAdminMembershipFromClerkPrivateMetadata,
  mapClerkBackendUserToBootstrapProfile,
  OWNER_BOOTSTRAP_AUDIT_ACTION,
  OWNER_BOOTSTRAP_AUDIT_SOURCE,
  OWNER_BOOTSTRAP_AUDIT_TARGET_TYPE,
  OWNER_BOOTSTRAP_MEMBERSHIP_STATUS,
  OWNER_BOOTSTRAP_ROLE,
  OWNER_BOOTSTRAP_STATUS,
  parseOwnerBootstrapRole,
  type OwnerBootstrapDatabase,
} from "../owner-bootstrap";

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
  localUser = createLocalUser(),
  organization = { id: "org_123" },
}: {
  existingMembership?: {
    id: string;
    role: string;
    status: string;
    userId: string | null;
  } | null;
  localUser?: LocalUserRecord | null;
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
      create: vi.fn().mockImplementation(async ({ data }) => {
        return {
          id: "member_123",
          role: data.role,
          status: data.status,
          userId: data.userId,
        };
      }),
      findUnique: vi.fn().mockResolvedValue(existingMembership),
    },
    user: {
      findUnique: vi.fn().mockResolvedValue(localUser),
      upsert: vi.fn().mockResolvedValue(localUser ?? createLocalUser()),
    },
  };
};

describe("parseOwnerBootstrapRole", () => {
  it("returns only the supported admin bootstrap role from namespaced private metadata", () => {
    expect(
      parseOwnerBootstrapRole({
        docapp: {
          bootstrapRole: "owner",
        },
      }),
    ).toBeNull();

    expect(
      parseOwnerBootstrapRole({
        docapp: {
          bootstrapRole: "admin",
        },
      }),
    ).toBe(OWNER_BOOTSTRAP_ROLE.admin);

    expect(
      parseOwnerBootstrapRole({
        docapp: {
          bootstrapRole: "manager",
        },
      }),
    ).toBeNull();
  });
});

describe("mapClerkBackendUserToBootstrapProfile", () => {
  it("maps a Clerk Backend user into local user input and private metadata", () => {
    expect(
      mapClerkBackendUserToBootstrapProfile({
        emailAddresses: [
          {
            emailAddress: "secondary@example.com",
            id: "email_secondary",
          },
          {
            emailAddress: " Owner@Example.COM ",
            id: "email_primary",
          },
        ],
        firstName: "Clinic",
        id: "user_clerk_123",
        lastName: "Owner",
        primaryEmailAddressId: "email_primary",
        privateMetadata: {
          docapp: {
            bootstrapRole: "admin",
          },
        },
      }),
    ).toEqual({
      localUserInput: {
        clerkUserId: "user_clerk_123",
        email: "owner@example.com",
        name: "Clinic Owner",
      },
      privateMetadata: {
        docapp: {
          bootstrapRole: "admin",
        },
      },
    });
  });

  it("returns null local user input when Clerk user data cannot create a local User", () => {
    expect(
      mapClerkBackendUserToBootstrapProfile({
        id: "user_clerk_123",
        privateMetadata: {},
      }).localUserInput,
    ).toBeNull();
  });
});

describe("bootstrapOwnerAdminMembershipFromClerkPrivateMetadata", () => {
  it("skips bootstrap for signed-out users", async () => {
    const database = createDatabase();

    await expect(
      bootstrapOwnerAdminMembershipFromClerkPrivateMetadata({
        authReader: async () => ({ userId: null }),
        database,
      }),
    ).resolves.toEqual({
      membership: null,
      role: null,
      status: OWNER_BOOTSTRAP_STATUS.signedOut,
    });

    expect(database.organizationMember.findUnique).not.toHaveBeenCalled();
  });

  it("creates an active admin membership and audit event from trusted private metadata", async () => {
    const localUser = createLocalUser();
    const database = createDatabase({ localUser });

    await expect(
      bootstrapOwnerAdminMembershipFromClerkPrivateMetadata({
        authReader: async () => ({ userId: localUser.clerkUserId }),
        clerkProfileReader: async () => ({
          localUserInput: {
            clerkUserId: localUser.clerkUserId,
            email: localUser.email,
            name: localUser.name,
          },
          privateMetadata: {
            docapp: {
              bootstrapRole: "admin",
            },
          },
        }),
        database,
      }),
    ).resolves.toEqual({
      membership: {
        id: "member_123",
        role: OWNER_BOOTSTRAP_ROLE.admin,
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
        userId: localUser.id,
      },
      role: OWNER_BOOTSTRAP_ROLE.admin,
      status: OWNER_BOOTSTRAP_STATUS.bootstrapped,
    });

    expect(database.organizationMember.create).toHaveBeenCalledWith({
      data: {
        invitedEmail: localUser.email,
        organizationId: "org_123",
        role: OWNER_BOOTSTRAP_ROLE.admin,
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
        userId: localUser.id,
      },
    });
    expect(database.auditEvent.create).toHaveBeenCalledWith({
      data: {
        action: OWNER_BOOTSTRAP_AUDIT_ACTION,
        actorUserId: localUser.id,
        metadata: {
          role: OWNER_BOOTSTRAP_ROLE.admin,
          source: OWNER_BOOTSTRAP_AUDIT_SOURCE,
        },
        organizationId: "org_123",
        targetId: "member_123",
        targetType: OWNER_BOOTSTRAP_AUDIT_TARGET_TYPE,
      },
    });
  });

  it("does not read Clerk metadata or change role when a local membership already exists", async () => {
    const localUser = createLocalUser();
    const database = createDatabase({
      existingMembership: {
        id: "member_123",
        role: "receptionist",
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
        userId: localUser.id,
      },
      localUser,
    });
    const clerkProfileReader = vi.fn();

    await expect(
      bootstrapOwnerAdminMembershipFromClerkPrivateMetadata({
        authReader: async () => ({ userId: localUser.clerkUserId }),
        clerkProfileReader,
        database,
      }),
    ).resolves.toEqual({
      membership: {
        id: "member_123",
        role: "receptionist",
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
        userId: localUser.id,
      },
      role: null,
      status: OWNER_BOOTSTRAP_STATUS.existingMembership,
    });

    expect(clerkProfileReader).not.toHaveBeenCalled();
    expect(database.organizationMember.create).not.toHaveBeenCalled();
    expect(database.auditEvent.create).not.toHaveBeenCalled();
  });

  it("skips bootstrap when metadata is missing or invalid", async () => {
    const localUser = createLocalUser();
    const missingMetadataDatabase = createDatabase({ localUser });

    await expect(
      bootstrapOwnerAdminMembershipFromClerkPrivateMetadata({
        authReader: async () => ({ userId: localUser.clerkUserId }),
        clerkProfileReader: async () => ({
          localUserInput: {
            clerkUserId: localUser.clerkUserId,
            email: localUser.email,
            name: localUser.name,
          },
          privateMetadata: {},
        }),
        database: missingMetadataDatabase,
      }),
    ).resolves.toEqual({
      membership: null,
      role: null,
      status: OWNER_BOOTSTRAP_STATUS.noBootstrapMetadata,
    });

    const invalidMetadataDatabase = createDatabase({ localUser });

    await expect(
      bootstrapOwnerAdminMembershipFromClerkPrivateMetadata({
        authReader: async () => ({ userId: localUser.clerkUserId }),
        clerkProfileReader: async () => ({
          localUserInput: {
            clerkUserId: localUser.clerkUserId,
            email: localUser.email,
            name: localUser.name,
          },
          privateMetadata: {
            docapp: {
              bootstrapRole: "doctor",
            },
          },
        }),
        database: invalidMetadataDatabase,
      }),
    ).resolves.toEqual({
      membership: null,
      role: null,
      status: OWNER_BOOTSTRAP_STATUS.invalidRole,
    });

    expect(missingMetadataDatabase.organizationMember.create).not.toHaveBeenCalled();
    expect(invalidMetadataDatabase.organizationMember.create).not.toHaveBeenCalled();
  });

  it("creates the local User before bootstrapping membership when webhook sync has not created it yet", async () => {
    const localUser = createLocalUser();
    const database = createDatabase({ localUser: null });
    database.user.upsert = vi.fn().mockResolvedValue(localUser);

    await expect(
      bootstrapOwnerAdminMembershipFromClerkPrivateMetadata({
        authReader: async () => ({ userId: "user_clerk_123" }),
        clerkProfileReader: async () => ({
          localUserInput: {
            clerkUserId: "user_clerk_123",
            email: "owner@example.com",
            name: "Clinic Owner",
          },
          privateMetadata: {
            docapp: {
              bootstrapRole: "admin",
            },
          },
        }),
        database,
      }),
    ).resolves.toEqual({
      membership: {
        id: "member_123",
        role: OWNER_BOOTSTRAP_ROLE.admin,
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
        userId: localUser.id,
      },
      role: OWNER_BOOTSTRAP_ROLE.admin,
      status: OWNER_BOOTSTRAP_STATUS.bootstrapped,
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
    expect(database.organizationMember.create).toHaveBeenCalledWith({
      data: {
        invitedEmail: localUser.email,
        organizationId: "org_123",
        role: OWNER_BOOTSTRAP_ROLE.admin,
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
        userId: localUser.id,
      },
    });
  });

  it("uses a concurrently created membership after local user upsert", async () => {
    const localUser = createLocalUser();
    const database = createDatabase({ localUser: null });
    database.user.upsert = vi.fn().mockResolvedValue(localUser);
    database.organizationMember.findUnique = vi.fn().mockResolvedValueOnce({
      id: "member_concurrent",
      role: OWNER_BOOTSTRAP_ROLE.admin,
      status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
      userId: localUser.id,
    });

    await expect(
      bootstrapOwnerAdminMembershipFromClerkPrivateMetadata({
        authReader: async () => ({ userId: "user_clerk_123" }),
        clerkProfileReader: async () => ({
          localUserInput: {
            clerkUserId: "user_clerk_123",
            email: "owner@example.com",
            name: "Clinic Owner",
          },
          privateMetadata: {
            docapp: {
              bootstrapRole: "admin",
            },
          },
        }),
        database,
      }),
    ).resolves.toEqual({
      membership: {
        id: "member_concurrent",
        role: OWNER_BOOTSTRAP_ROLE.admin,
        status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
        userId: localUser.id,
      },
      role: OWNER_BOOTSTRAP_ROLE.admin,
      status: OWNER_BOOTSTRAP_STATUS.existingMembership,
    });

    expect(database.organizationMember.create).not.toHaveBeenCalled();
  });

  it("skips bootstrap when the Clerk user cannot create a local User or no active organization exists", async () => {
    const invalidClerkUserDatabase = createDatabase({ localUser: null });

    await expect(
      bootstrapOwnerAdminMembershipFromClerkPrivateMetadata({
        authReader: async () => ({ userId: "user_clerk_123" }),
        clerkProfileReader: async () => ({
          localUserInput: null,
          privateMetadata: {
            docapp: {
              bootstrapRole: "admin",
            },
          },
        }),
        database: invalidClerkUserDatabase,
      }),
    ).resolves.toEqual({
      membership: null,
      role: null,
      status: OWNER_BOOTSTRAP_STATUS.invalidClerkUser,
    });

    const localUser = createLocalUser();
    const missingOrganizationDatabase = createDatabase({
      localUser,
      organization: null,
    });

    await expect(
      bootstrapOwnerAdminMembershipFromClerkPrivateMetadata({
        authReader: async () => ({ userId: localUser.clerkUserId }),
        clerkProfileReader: async () => ({
          localUserInput: {
            clerkUserId: localUser.clerkUserId,
            email: localUser.email,
            name: localUser.name,
          },
          privateMetadata: {
            docapp: {
              bootstrapRole: "admin",
            },
          },
        }),
        database: missingOrganizationDatabase,
      }),
    ).resolves.toEqual({
      membership: null,
      role: OWNER_BOOTSTRAP_ROLE.admin,
      status: OWNER_BOOTSTRAP_STATUS.noActiveOrganization,
    });

    expect(invalidClerkUserDatabase.organizationMember.create).not.toHaveBeenCalled();
    expect(missingOrganizationDatabase.organizationMember.create).not.toHaveBeenCalled();
  });
});
