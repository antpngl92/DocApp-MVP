import type { WebhookEvent } from "@clerk/nextjs/webhooks";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { handleClerkWebhookEvent } from "../webhook";

const clerkUserSync = vi.hoisted(() => ({
  syncClerkUserToLocalUser: vi.fn(),
}));

vi.mock("../user-sync", () => ({
  syncClerkUserToLocalUser: clerkUserSync.syncClerkUserToLocalUser,
}));

describe("handleClerkWebhookEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("syncs Clerk user create and update events", async () => {
    const event = {
      data: {
        id: "user_clerk_123",
      },
      type: "user.created",
    } as WebhookEvent;

    await expect(handleClerkWebhookEvent(event)).resolves.toEqual({
      action: "synced",
      handled: true,
      type: "user.created",
    });

    expect(clerkUserSync.syncClerkUserToLocalUser).toHaveBeenCalledWith(event.data);
  });

  it("ignores unsupported events without mutating local users", async () => {
    const event = {
      data: {
        id: "user_clerk_123",
      },
      type: "session.created",
    } as WebhookEvent;

    await expect(handleClerkWebhookEvent(event)).resolves.toEqual({
      action: "ignored",
      handled: false,
      type: "session.created",
    });

    expect(clerkUserSync.syncClerkUserToLocalUser).not.toHaveBeenCalledWith(event.data);
  });
});
