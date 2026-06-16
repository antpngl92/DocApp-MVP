import {
  PUBLIC_REGISTRATION_AUDIT_ACTION,
  PUBLIC_REGISTRATION_AUDIT_SOURCE,
  PUBLIC_REGISTRATION_AUDIT_TARGET_TYPE,
  USER_SYNC_ORGANIZATION_STATUS,
  USER_SYNC_STAFF_MEMBER_STATUS,
} from "./consts";

type ClerkEmailAddressPayload = {
  email_address?: string | null;
  id?: string | null;
};

type ClerkUserPayload = {
  email_addresses?: ClerkEmailAddressPayload[] | null;
  first_name?: string | null;
  id?: string | null;
  last_name?: string | null;
  primary_email_address_id?: string | null;
  username?: string | null;
};

type LocalUserSyncInput = {
  clerkUserId: string;
  email: string;
  name: string | null;
};

type LocalUserSyncRecord = LocalUserSyncInput & {
  id: string;
};

type UserUpsertArgs = {
  create: LocalUserSyncInput;
  update: Pick<LocalUserSyncInput, "email" | "name">;
  where: Pick<LocalUserSyncInput, "clerkUserId">;
};

type UserSyncAuditEvent = {
  id: string;
};

type SyncClerkUserToLocalUserOptions = {
  auditPublicRegistration?: boolean;
};

type UserSyncDatabase = {
  auditEvent: {
    create: (args: {
      data: {
        action: string;
        actorUserId: string;
        metadata: {
          clerkUserId: string;
          email: string;
          source: string;
        };
        organizationId: string;
        targetId: string;
        targetType: string;
      };
    }) => Promise<unknown>;
    findFirst: (args: {
      where: {
        action: string;
        organizationId: string;
        targetId: string;
        targetType: string;
      };
    }) => Promise<UserSyncAuditEvent | null>;
  };
  organization: {
    findFirst: (args: {
      orderBy: {
        createdAt: "asc";
      };
      where: {
        status: typeof USER_SYNC_ORGANIZATION_STATUS.active;
      };
    }) => Promise<{ id: string } | null>;
  };
  organizationMember: {
    findFirst: (args: {
      where: {
        invitedEmail: string;
        status: typeof USER_SYNC_STAFF_MEMBER_STATUS.invited;
      };
    }) => Promise<{ id: string } | null>;
  };
  user: {
    upsert: (args: UserUpsertArgs) => Promise<LocalUserSyncRecord>;
  };
};

const getDefaultDatabase = async (): Promise<UserSyncDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const normalizeEmail = (email: string): string => {
  return email.trim().toLowerCase();
};

const extractPrimaryEmail = (payload: ClerkUserPayload): string => {
  const emailAddresses = payload.email_addresses ?? [];
  const primaryEmail = emailAddresses.find((emailAddress) => {
    return emailAddress.id === payload.primary_email_address_id;
  });

  const email = primaryEmail?.email_address ?? emailAddresses[0]?.email_address;
  const normalizedEmail = email ? normalizeEmail(email) : "";

  if (!normalizedEmail) {
    throw new Error("Clerk user webhook payload is missing an email address.");
  }

  return normalizedEmail;
};

const buildDisplayName = (payload: ClerkUserPayload): string | null => {
  const fullName = [payload.first_name, payload.last_name]
    .map((namePart) => namePart?.trim())
    .filter(Boolean)
    .join(" ");

  return fullName || payload.username?.trim() || null;
};

const mapClerkUserToLocalUserInput = (payload: ClerkUserPayload): LocalUserSyncInput => {
  const clerkUserId = payload.id?.trim();

  if (!clerkUserId) {
    throw new Error("Clerk user webhook payload is missing a user ID.");
  }

  return {
    clerkUserId,
    email: extractPrimaryEmail(payload),
    name: buildDisplayName(payload),
  };
};

const createPublicRegistrationAuditEvent = async ({
  database,
  localUser,
}: {
  database: UserSyncDatabase;
  localUser: LocalUserSyncRecord;
}): Promise<void> => {
  const pendingStaffInvitation = await database.organizationMember.findFirst({
    where: {
      invitedEmail: localUser.email,
      status: USER_SYNC_STAFF_MEMBER_STATUS.invited,
    },
  });

  if (pendingStaffInvitation) {
    return;
  }

  const organization = await database.organization.findFirst({
    orderBy: {
      createdAt: "asc",
    },
    where: {
      status: USER_SYNC_ORGANIZATION_STATUS.active,
    },
  });

  if (!organization) {
    return;
  }

  const existingAuditEvent = await database.auditEvent.findFirst({
    where: {
      action: PUBLIC_REGISTRATION_AUDIT_ACTION,
      organizationId: organization.id,
      targetId: localUser.id,
      targetType: PUBLIC_REGISTRATION_AUDIT_TARGET_TYPE,
    },
  });

  if (existingAuditEvent) {
    return;
  }

  await database.auditEvent.create({
    data: {
      action: PUBLIC_REGISTRATION_AUDIT_ACTION,
      actorUserId: localUser.id,
      metadata: {
        clerkUserId: localUser.clerkUserId,
        email: localUser.email,
        source: PUBLIC_REGISTRATION_AUDIT_SOURCE,
      },
      organizationId: organization.id,
      targetId: localUser.id,
      targetType: PUBLIC_REGISTRATION_AUDIT_TARGET_TYPE,
    },
  });
};

const syncClerkUserToLocalUser = async (
  payload: ClerkUserPayload,
  database?: UserSyncDatabase,
  options: SyncClerkUserToLocalUserOptions = {},
) => {
  const userInput = mapClerkUserToLocalUserInput(payload);
  const userSyncDatabase = database ?? (await getDefaultDatabase());

  const localUser = await userSyncDatabase.user.upsert({
    where: {
      clerkUserId: userInput.clerkUserId,
    },
    create: userInput,
    update: {
      email: userInput.email,
      name: userInput.name,
    },
  });

  if (options.auditPublicRegistration) {
    await createPublicRegistrationAuditEvent({
      database: userSyncDatabase,
      localUser,
    });
  }

  return localUser;
};

export { mapClerkUserToLocalUserInput, syncClerkUserToLocalUser };
export type {
  ClerkUserPayload,
  LocalUserSyncInput,
  LocalUserSyncRecord,
  SyncClerkUserToLocalUserOptions,
  UserSyncDatabase,
  UserUpsertArgs,
};
