import { auth } from "@clerk/nextjs/server";

type AuthenticatedUserRecord = {
  clerkUserId: string;
  createdAt: Date;
  email: string;
  id: string;
  name: string | null;
  updatedAt: Date;
};

const CURRENT_AUTHENTICATED_USER_STATUS = {
  authenticated: "authenticated",
  missingLocalUser: "missing_local_user",
  signedOut: "signed_out",
} as const;

type CurrentAuthenticatedUserStatus =
  (typeof CURRENT_AUTHENTICATED_USER_STATUS)[keyof typeof CURRENT_AUTHENTICATED_USER_STATUS];

type CurrentAuthenticatedUserState<
  TStatus extends CurrentAuthenticatedUserStatus,
  TClerkUserId extends string | null,
  TUser extends AuthenticatedUserRecord | null,
> = {
  clerkUserId: TClerkUserId;
  status: TStatus;
  user: TUser;
};

type CurrentAuthenticatedUserResult =
  | CurrentAuthenticatedUserState<typeof CURRENT_AUTHENTICATED_USER_STATUS.signedOut, null, null>
  | CurrentAuthenticatedUserState<
      typeof CURRENT_AUTHENTICATED_USER_STATUS.missingLocalUser,
      string,
      null
    >
  | CurrentAuthenticatedUserState<
      typeof CURRENT_AUTHENTICATED_USER_STATUS.authenticated,
      string,
      AuthenticatedUserRecord
    >;

type CurrentUserAuthReader = () => Promise<{
  userId: string | null;
}>;

type CurrentUserDatabase = {
  user: {
    findUnique: (args: {
      where: {
        clerkUserId: string;
      };
    }) => Promise<AuthenticatedUserRecord | null>;
  };
};

type GetCurrentAuthenticatedUserOptions = {
  authReader?: CurrentUserAuthReader;
  database?: CurrentUserDatabase;
};

const readCurrentClerkAuth: CurrentUserAuthReader = async () => {
  return auth();
};

const getDefaultDatabase = async (): Promise<CurrentUserDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

const getCurrentAuthenticatedUser = async ({
  authReader = readCurrentClerkAuth,
  database,
}: GetCurrentAuthenticatedUserOptions = {}): Promise<CurrentAuthenticatedUserResult> => {
  const { userId } = await authReader();

  if (!userId) {
    return {
      clerkUserId: null,
      status: CURRENT_AUTHENTICATED_USER_STATUS.signedOut,
      user: null,
    };
  }

  const currentUserDatabase = database ?? (await getDefaultDatabase());
  const localUser = await currentUserDatabase.user.findUnique({
    where: {
      clerkUserId: userId,
    },
  });

  if (!localUser) {
    return {
      clerkUserId: userId,
      status: CURRENT_AUTHENTICATED_USER_STATUS.missingLocalUser,
      user: null,
    };
  }

  return {
    clerkUserId: userId,
    status: CURRENT_AUTHENTICATED_USER_STATUS.authenticated,
    user: localUser,
  };
};

export { CURRENT_AUTHENTICATED_USER_STATUS, getCurrentAuthenticatedUser };
export type {
  AuthenticatedUserRecord,
  CurrentAuthenticatedUserResult,
  CurrentAuthenticatedUserStatus,
  CurrentUserAuthReader,
  CurrentUserDatabase,
};
