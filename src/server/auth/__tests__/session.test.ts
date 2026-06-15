import { describe, expect, it, vi } from "vitest";

import { getAuthenticatedSession, requireAuthenticatedSession } from "../session";

const clerkAuth = vi.hoisted(() => ({
  auth: vi.fn(),
  protectedAuth: { sessionId: "session_123", userId: "user_123" },
  protect: vi.fn(),
}));

vi.mock("@clerk/nextjs/server", () => ({
  auth: Object.assign(clerkAuth.auth, {
    protect: clerkAuth.protect,
  }),
}));

describe("getAuthenticatedSession", () => {
  it("reads Clerk auth without forcing a redirect", async () => {
    clerkAuth.auth.mockResolvedValueOnce({ sessionId: null, userId: null });

    await expect(getAuthenticatedSession()).resolves.toEqual({ sessionId: null, userId: null });

    expect(clerkAuth.auth).toHaveBeenCalledTimes(1);
    expect(clerkAuth.protect).not.toHaveBeenCalled();
  });
});

describe("requireAuthenticatedSession", () => {
  it("delegates to Clerk auth.protect and returns the protected session", async () => {
    clerkAuth.protect.mockResolvedValueOnce(clerkAuth.protectedAuth);

    await expect(requireAuthenticatedSession()).resolves.toEqual(clerkAuth.protectedAuth);

    expect(clerkAuth.protect).toHaveBeenCalledTimes(1);
  });
});
