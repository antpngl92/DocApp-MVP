import { auth } from "@clerk/nextjs/server";

const getAuthenticatedSession = async () => {
  return auth();
};

const requireAuthenticatedSession = async () => {
  return auth.protect();
};

export { getAuthenticatedSession, requireAuthenticatedSession };
