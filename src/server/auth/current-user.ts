import { CURRENT_AUTHENTICATED_USER_STATUS } from "./consts";
import { findLocalUserByClerkUserId, type LocalUserLookupDatabase } from "./local-user";
import type {
  AuthenticatedUserRecord,
  CurrentAuthenticatedUserResult,
  CurrentAuthenticatedUserStatus,
  CurrentUserAuthReader,
  GetCurrentAuthenticatedUserOptions,
} from "./type";
import { readCurrentClerkAuth } from "./utils";

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
