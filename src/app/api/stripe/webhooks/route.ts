import { NextResponse } from "next/server";

import { fulfillCheckoutSession } from "@/lib/billing/fulfillment";
import { getStripeServerClient, validateStripeWebhookSecretMode } from "@/lib/billing/stripe";
import {
  logStripeWebhookReceived,
  markStripeWebhookProcessed,
} from "@/lib/billing/webhook-log";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing Stripe signature." },
      { status: 400 },
    );
  }

  const payload = await request.text();
  try {
    validateStripeWebhookSecretMode();
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe webhook mode mismatch.",
      },
      { status: 400 },
    );
  }
  const stripe = getStripeServerClient();

  let event: ReturnType<typeof stripe.webhooks.constructEvent>;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Stripe webhook verification failed.",
      },
      { status: 400 },
    );
  }

  // Log receipt + dedupe. Only skip the handler when the previous attempt
  // succeeded; a failed-and-retrying replay still runs through fulfillment.
  const { shouldProcess } = await logStripeWebhookReceived({
    eventId: event.id,
    type: event.type,
    payload: event as unknown,
  });

  if (!shouldProcess) {
    return NextResponse.json({ received: true, replay: true });
  }

  let processedOk = true;
  let errorMessage: string | null = null;

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillCheckoutSession(event.data.object);
    }
  } catch (error) {
    processedOk = false;
    errorMessage = error instanceof Error ? error.message : String(error);
    console.error("[stripe-webhook] handler failed", errorMessage);
  }

  await markStripeWebhookProcessed(event.id, { ok: processedOk, errorMessage });

  if (!processedOk) {
    // Return 500 so Stripe retries. The log row stays for audit; dedupe will
    // skip the insert on retry but the handler still runs via a separate path.
    return NextResponse.json({ error: errorMessage ?? "handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
