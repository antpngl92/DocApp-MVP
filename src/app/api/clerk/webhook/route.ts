import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { getClerkWebhookSigningSecret, parseClerkWebhookEnv } from "@/lib/env";
import { handleClerkWebhookEvent } from "@/server/clerk/webhook";

export const POST = async (request: NextRequest) => {
  let signingSecret: string;

  try {
    signingSecret = getClerkWebhookSigningSecret(parseClerkWebhookEnv());
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Clerk webhook signing secret is not configured." },
        { status: 500 },
      );
    }

    throw error;
  }

  try {
    const event = await verifyWebhook(request, { signingSecret });

    try {
      const result = await handleClerkWebhookEvent(event);

      return NextResponse.json({
        ok: true,
        result,
      });
    } catch {
      return NextResponse.json({ error: "Clerk webhook processing failed." }, { status: 500 });
    }
  } catch {
    return NextResponse.json({ error: "Invalid Clerk webhook signature." }, { status: 400 });
  }
};
