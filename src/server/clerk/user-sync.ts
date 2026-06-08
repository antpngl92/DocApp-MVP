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

type UserUpsertArgs = {
  create: LocalUserSyncInput;
  update: Pick<LocalUserSyncInput, "email" | "name">;
  where: Pick<LocalUserSyncInput, "clerkUserId">;
};

type UserSyncDatabase = {
  user: {
    upsert: (args: UserUpsertArgs) => Promise<unknown>;
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

const syncClerkUserToLocalUser = async (payload: ClerkUserPayload, database?: UserSyncDatabase) => {
  const userInput = mapClerkUserToLocalUserInput(payload);
  const userSyncDatabase = database ?? (await getDefaultDatabase());

  return userSyncDatabase.user.upsert({
    where: {
      clerkUserId: userInput.clerkUserId,
    },
    create: userInput,
    update: {
      email: userInput.email,
      name: userInput.name,
    },
  });
};

export { mapClerkUserToLocalUserInput, syncClerkUserToLocalUser };
export type { ClerkUserPayload, LocalUserSyncInput, UserSyncDatabase, UserUpsertArgs };
