import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const clerkWebhooks = vi.hoisted(() => ({
  verifyWebhook: vi.fn(),
}));

const clerkWebhookHandler = vi.hoisted(() => ({
  handleClerkWebhookEvent: vi.fn(),
}));

vi.mock("@clerk/nextjs/webhooks", () => ({
  verifyWebhook: clerkWebhooks.verifyWebhook,
}));

vi.mock("@/server/clerk/webhook", () => ({
  handleClerkWebhookEvent: clerkWebhookHandler.handleClerkWebhookEvent,
}));

const createWebhookRequest = (): NextRequest => {
  return new Request("http://localhost:3000/api/clerk/webhook", {
    body: "{}",
    method: "POST",
  }) as NextRequest;
};

describe("POST /api/clerk/webhook", () => {
  const originalSigningSecret = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
  const originalLegacySecret = process.env.CLERK_WEBHOOK_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CLERK_WEBHOOK_SIGNING_SECRET = "whsec_test";
    delete process.env.CLERK_WEBHOOK_SECRET;
  });

  afterEach(() => {
    if (originalSigningSecret === undefined) {
      delete process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    } else {
      process.env.CLERK_WEBHOOK_SIGNING_SECRET = originalSigningSecret;
    }

    if (originalLegacySecret === undefined) {
      delete process.env.CLERK_WEBHOOK_SECRET;
    } else {
      process.env.CLERK_WEBHOOK_SECRET = originalLegacySecret;
    }
  });

  it("verifies the Clerk webhook signature before dispatching the event", async () => {
    const event = {
      data: {
        id: "user_clerk_123",
      },
      type: "user.created",
    };

    clerkWebhooks.verifyWebhook.mockResolvedValueOnce(event);
    clerkWebhookHandler.handleClerkWebhookEvent.mockResolvedValueOnce({
      action: "synced",
      handled: true,
      type: "user.created",
    });

    const { POST } = await import("../route");
    const response = await POST(createWebhookRequest());

    await expect(response.json()).resolves.toEqual({
      ok: true,
      result: {
        action: "synced",
        handled: true,
        type: "user.created",
      },
    });
    expect(response.status).toBe(200);
    expect(clerkWebhooks.verifyWebhook).toHaveBeenCalledWith(expect.any(Request), {
      signingSecret: "whsec_test",
    });
    expect(clerkWebhookHandler.handleClerkWebhookEvent).toHaveBeenCalledWith(event);
  });

  it("rejects requests that fail Clerk webhook verification", async () => {
    clerkWebhooks.verifyWebhook.mockRejectedValueOnce(new Error("bad signature"));

    const { POST } = await import("../route");
    const response = await POST(createWebhookRequest());

    await expect(response.json()).resolves.toEqual({
      error: "Invalid Clerk webhook signature.",
    });
    expect(response.status).toBe(400);
    expect(clerkWebhookHandler.handleClerkWebhookEvent).not.toHaveBeenCalled();
  });

  it("returns a safe server error when the signing secret is not configured", async () => {
    delete process.env.CLERK_WEBHOOK_SIGNING_SECRET;
    delete process.env.CLERK_WEBHOOK_SECRET;

    const { POST } = await import("../route");
    const response = await POST(createWebhookRequest());

    await expect(response.json()).resolves.toEqual({
      error: "Clerk webhook signing secret is not configured.",
    });
    expect(response.status).toBe(500);
    expect(clerkWebhooks.verifyWebhook).not.toHaveBeenCalled();
  });
});
