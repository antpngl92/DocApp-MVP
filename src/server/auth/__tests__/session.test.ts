import { describe, expect, it, vi } from "vitest";

import { requireAuthenticatedSession } from "../session";

const clerkAuth = vi.hoisted(() => ({
  protectedAuth: { sessionId: "session_123", userId: "user_123" },
  protect: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: {
    protect: clerkAuth.protect,
  },
}));

describe("requireAuthenticatedSession", () => {
  it("delegates to Clerk auth.protect and returns the protected session", async () => {
    clerkAuth.protect.mockResolvedValueOnce(clerkAuth.protectedAuth);

    await expect(requireAuthenticatedSession()).resolves.toEqual(clerkAuth.protectedAuth);

    expect(clerkAuth.protect).toHaveBeenCalledTimes(1);
  });
});
