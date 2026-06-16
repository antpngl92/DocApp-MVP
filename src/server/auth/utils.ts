import { auth, clerkClient } from "@clerk/nextjs/server";

import { parsePublicEnv } from "@/lib/env";

import {
  OWNER_BOOTSTRAP_AUDIT_ACTION,
  OWNER_BOOTSTRAP_AUDIT_SOURCE,
  OWNER_BOOTSTRAP_AUDIT_TARGET_TYPE,
  OWNER_BOOTSTRAP_MEMBERSHIP_STATUS,
  OWNER_BOOTSTRAP_METADATA_NAMESPACE,
  OWNER_BOOTSTRAP_METADATA_ROLE_KEY,
  OWNER_BOOTSTRAP_ROLE,
  OWNER_BOOTSTRAP_STATUS,
  PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE,
  STAFF_INVITABLE_ROLE_VALUES,
  STAFF_MEMBER_ROLE_VALUES,
} from "./consts";
import type {
  ClerkBackendUser,
  ClerkBootstrapProfile,
  ClerkBootstrapProfileReader,
  LocalUserLookupDatabase,
  LocalUserRecord,
  OwnerBootstrapDatabase,
  OwnerBootstrapLocalUserInput,
  OwnerBootstrapResult,
  OwnerBootstrapRole,
  ClerkInvitationCreator,
  ClerkInvitationRevoker,
  StaffMemberRole,
} from "./type";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isUniqueConstraintError = (error: unknown): boolean => {
  return isRecord(error) && error.code === PRISMA_UNIQUE_CONSTRAINT_ERROR_CODE;
};

const isOwnerBootstrapRole = (role: unknown): role is OwnerBootstrapRole => {
  return role === OWNER_BOOTSTRAP_ROLE.admin;
};

const isStaffMemberRole = (role: unknown): role is StaffMemberRole => {
  return STAFF_MEMBER_ROLE_VALUES.includes(role as StaffMemberRole);
};

const isInvitableStaffMemberRole = (role: unknown): role is StaffMemberRole => {
  return STAFF_INVITABLE_ROLE_VALUES.includes(role as StaffMemberRole);
};

const parseOwnerBootstrapRole = (privateMetadata: unknown): OwnerBootstrapRole | null => {
  if (!isRecord(privateMetadata)) {
    return null;
  }

  const docappMetadata = privateMetadata[OWNER_BOOTSTRAP_METADATA_NAMESPACE];

  if (!isRecord(docappMetadata)) {
    return null;
  }

  const role = docappMetadata[OWNER_BOOTSTRAP_METADATA_ROLE_KEY];

  if (isOwnerBootstrapRole(role)) {
    return role;
  }

  return null;
};

const hasDocAppBootstrapMetadata = (privateMetadata: unknown): boolean => {
  if (!isRecord(privateMetadata)) {
    return false;
  }

  const docappMetadata = privateMetadata[OWNER_BOOTSTRAP_METADATA_NAMESPACE];

  return isRecord(docappMetadata) && OWNER_BOOTSTRAP_METADATA_ROLE_KEY in docappMetadata;
};

const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

const getPrimaryEmail = (clerkUser: ClerkBackendUser): string | null => {
  const emailAddresses = clerkUser.emailAddresses ?? [];
  const primaryEmailAddress = emailAddresses.find((emailAddress) => {
    return emailAddress.id === clerkUser.primaryEmailAddressId;
  });
  const email = primaryEmailAddress?.emailAddress ?? emailAddresses[0]?.emailAddress;
  const normalizedEmail = email ? normalizeEmail(email) : "";

  return normalizedEmail || null;
};

const getDisplayName = (clerkUser: ClerkBackendUser): string | null => {
  const fullName = [clerkUser.firstName, clerkUser.lastName]
    .map((namePart) => namePart?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || clerkUser.username?.trim() || null;
};

const getLocalUserDisplayName = (localUser: LocalUserRecord | null): string | null => {
  if (!localUser) {
    return null;
  }

  return localUser.name?.trim() || localUser.email;
};

const mapClerkBackendUserToBootstrapProfile = (
  clerkUser: ClerkBackendUser,
): ClerkBootstrapProfile => {
  const clerkUserId = clerkUser.id?.trim();
  const email = getPrimaryEmail(clerkUser);

  return {
    localUserInput:
      clerkUserId && email
        ? {
            clerkUserId,
            email,
            name: getDisplayName(clerkUser),
          }
        : null,
    privateMetadata: clerkUser.privateMetadata,
  };
};

const getDefaultLocalUserLookupDatabase = async (): Promise<LocalUserLookupDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const getDefaultOwnerBootstrapDatabase = async (): Promise<OwnerBootstrapDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const getDefaultStaffInvitationDatabase = async () => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const readCurrentClerkAuth = async () => {
  return auth();
};

const readClerkBootstrapProfile: ClerkBootstrapProfileReader = async (clerkUserId) => {
  const client = await clerkClient();
  const user = await client.users.getUser(clerkUserId);

  return mapClerkBackendUserToBootstrapProfile(user);
};

const getStaffInvitationRedirectUrl = (
  env: Record<string, string | undefined> = process.env,
): string => {
  const publicEnv = parsePublicEnv(env);

  // Clerk resolves relative redirect paths against its own Account Portal
  // domain, so the invitation link must carry an absolute app URL.
  return new URL(publicEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL, publicEnv.NEXT_PUBLIC_APP_URL).toString();
};

const createClerkStaffInvitation: ClerkInvitationCreator = async (input) => {
  const client = await clerkClient();

  return client.invitations.createInvitation({
    emailAddress: input.emailAddress,
    redirectUrl: input.redirectUrl,
  });
};

const revokeClerkStaffInvitation: ClerkInvitationRevoker = async (invitationId) => {
  const client = await clerkClient();

  return client.invitations.revokeInvitation(invitationId);
};

const upsertLocalUserFromClerkProfile = async (
  database: {
    user: {
      upsert: OwnerBootstrapDatabase["user"]["upsert"];
    };
  },
  localUserInput: OwnerBootstrapLocalUserInput,
): Promise<LocalUserRecord> => {
  return database.user.upsert({
    create: localUserInput,
    update: {
      email: localUserInput.email,
      name: localUserInput.name,
    },
    where: {
      clerkUserId: localUserInput.clerkUserId,
    },
  });
};

const createOwnerAdminMembership = async ({
  database,
  localUser,
  role,
}: {
  database: OwnerBootstrapDatabase;
  localUser: LocalUserRecord;
  role: OwnerBootstrapRole;
}): Promise<OwnerBootstrapResult> => {
  const existingMembership = await database.organizationMember.findUnique({
    where: {
      userId: localUser.id,
    },
  });

  if (existingMembership) {
    return {
      membership: existingMembership,
      role: isOwnerBootstrapRole(existingMembership.role) ? existingMembership.role : null,
      status: OWNER_BOOTSTRAP_STATUS.existingMembership,
    };
  }

  const organization = await database.organization.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    where: {
      status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
    },
  });

  if (!organization) {
    return {
      membership: null,
      role,
      status: OWNER_BOOTSTRAP_STATUS.noActiveOrganization,
    };
  }

  const membership = await database.organizationMember.create({
    data: {
      invitedEmail: localUser.email,
      organizationId: organization.id,
      role,
      status: OWNER_BOOTSTRAP_MEMBERSHIP_STATUS.active,
      userId: localUser.id,
    },
  });

  await database.auditEvent.create({
    data: {
      action: OWNER_BOOTSTRAP_AUDIT_ACTION,
      actorUserId: localUser.id,
      metadata: {
        role,
        source: OWNER_BOOTSTRAP_AUDIT_SOURCE,
      },
      organizationId: organization.id,
      targetId: membership.id,
      targetType: OWNER_BOOTSTRAP_AUDIT_TARGET_TYPE,
    },
  });

  return {
    membership,
    role,
    status: OWNER_BOOTSTRAP_STATUS.bootstrapped,
  };
};

export {
  createOwnerAdminMembership,
  createClerkStaffInvitation,
  getDefaultLocalUserLookupDatabase,
  getDefaultOwnerBootstrapDatabase,
  getDefaultStaffInvitationDatabase,
  getLocalUserDisplayName,
  getStaffInvitationRedirectUrl,
  hasDocAppBootstrapMetadata,
  isInvitableStaffMemberRole,
  isOwnerBootstrapRole,
  isStaffMemberRole,
  isUniqueConstraintError,
  mapClerkBackendUserToBootstrapProfile,
  normalizeEmail,
  parseOwnerBootstrapRole,
  readClerkBootstrapProfile,
  readCurrentClerkAuth,
  revokeClerkStaffInvitation,
  upsertLocalUserFromClerkProfile,
};
