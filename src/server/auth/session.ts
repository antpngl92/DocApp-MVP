import { auth } from "@clerk/nextjs/server";

const requireAuthenticatedSession = async () => {
  return auth.protect();
};

export { requireAuthenticatedSession };
