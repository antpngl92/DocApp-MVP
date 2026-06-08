import { auth } from "@clerk/nextjs/server";

import {
  findLocalUserByClerkUserId,
  type LocalUserLookupDatabase,
  type LocalUserRecord,
} from "./local-user";

type AuthenticatedUserRecord = LocalUserRecord;

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

type GetCurrentAuthenticatedUserOptions = {
  authReader?: CurrentUserAuthReader;
  database?: LocalUserLookupDatabase;
};

const readCurrentClerkAuth: CurrentUserAuthReader = async () => {
  return auth();
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

  const localUser = await findLocalUserByClerkUserId(userId, database);

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
  LocalUserLookupDatabase as CurrentUserDatabase,
};
