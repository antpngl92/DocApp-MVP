type LocalUserRecord = {
  clerkUserId: string;
  createdAt: Date;
  email: string;
  id: string;
  name: string | null;
  updatedAt: Date;
};

type LocalUserLookupDatabase = {
  user: {
    findUnique: (args: {
      where: {
        clerkUserId: string;
      };
    }) => Promise<LocalUserRecord | null>;
  };
};

const getDefaultLocalUserLookupDatabase = async (): Promise<LocalUserLookupDatabase> => {
  const { prisma } = await import("@/lib/prisma");

  return prisma;
};

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
