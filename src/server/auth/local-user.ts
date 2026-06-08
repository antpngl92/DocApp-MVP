import type { LocalUserLookupDatabase, LocalUserRecord } from "./type";
import { getDefaultLocalUserLookupDatabase } from "./utils";

const findLocalUserByClerkUserId = async (
  clerkUserId: string,
  database?: LocalUserLookupDatabase,
): Promise<LocalUserRecord | null> => {
  const localUserDatabase = database ?? (await getDefaultLocalUserLookupDatabase());

  return localUserDatabase.user.findUnique({
    where: {
      clerkUserId,
    },
  });
};

export { findLocalUserByClerkUserId };
export type { LocalUserLookupDatabase, LocalUserRecord };
