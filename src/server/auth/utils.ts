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
  STAFF_MEMBER_ROLE,
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
  StaffMemberRole,
} from "./type";

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isOwnerBootstrapRole = (role: unknown): role is OwnerBootstrapRole => {
  return role === OWNER_BOOTSTRAP_ROLE.owner || role === OWNER_BOOTSTRAP_ROLE.admin;
};

const isStaffMemberRole = (role: unknown): role is StaffMemberRole => {
  return (
    role === STAFF_MEMBER_ROLE.owner ||
    role === STAFF_MEMBER_ROLE.admin ||
    role === STAFF_MEMBER_ROLE.manager ||
    role === STAFF_MEMBER_ROLE.receptionist ||
    role === STAFF_MEMBER_ROLE.doctor
  );
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
  return new URL(
    publicEnv.NEXT_PUBLIC_CLERK_SIGN_UP_URL,
    publicEnv.NEXT_PUBLIC_APP_URL,
  ).toString();
};

const createClerkStaffInvitation: ClerkInvitationCreator = async (input) => {
  const client = await clerkClient();

  return client.invitations.createInvitation({
    emailAddress: input.emailAddress,
    redirectUrl: input.redirectUrl,
  });
};

const upsertLocalUserFromClerkProfile = async (
  database: OwnerBootstrapDatabase,
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
  getStaffInvitationRedirectUrl,
  hasDocAppBootstrapMetadata,
  isOwnerBootstrapRole,
  isStaffMemberRole,
  mapClerkBackendUserToBootstrapProfile,
  normalizeEmail,
  parseOwnerBootstrapRole,
  readClerkBootstrapProfile,
  readCurrentClerkAuth,
  upsertLocalUserFromClerkProfile,
};
