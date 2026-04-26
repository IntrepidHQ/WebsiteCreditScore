import { NextRequest, NextResponse } from "next/server";
import { upsertPaidScan } from "@/lib/db/scans";

export const runtime = "nodejs";

function getStripe() {
  const Stripe = require("stripe").default;
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { domain, scan_id } = session.metadata ?? {};

    if (domain && scan_id) {
      try {
        await upsertPaidScan({
          id: scan_id,
          domain,
          stripeSessionId: session.id,
        });
      } catch (err) {
        console.error("[stripe/webhook] failed to upsert scan:", err);
        // Return 200 so Stripe doesn't retry — webhook was received correctly
      }
    }
  }

  return NextResponse.json({ received: true });
}
