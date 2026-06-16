import type { WebhookEvent } from "@clerk/nextjs/webhooks";

import { syncClerkUserToLocalUser } from "./user-sync";

type ClerkWebhookSyncResult = {
  action: "ignored" | "synced";
  handled: boolean;
  type: string;
};

const handleClerkWebhookEvent = async (event: WebhookEvent): Promise<ClerkWebhookSyncResult> => {
  if (event.type === "user.created" || event.type === "user.updated") {
    await syncClerkUserToLocalUser(event.data, undefined, {
      auditPublicRegistration: event.type === "user.created",
    });

    return {
      action: "synced",
      handled: true,
      type: event.type,
    };
  }

  return {
    action: "ignored",
    handled: false,
    type: event.type,
  };
};

export { handleClerkWebhookEvent };
export type { ClerkWebhookSyncResult };
