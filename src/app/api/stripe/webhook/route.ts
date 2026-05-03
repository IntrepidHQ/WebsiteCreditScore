import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { upsertPaidScan } from "@/lib/db/scans";
import { creditWallet, updateWalletContact } from "@/lib/db/wallets";
import { isTier, isTierMode } from "@/lib/pricing";

export const runtime = "nodejs";

function getStripe() {
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

  let event: Stripe.Event;
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
    const metadata = session.metadata ?? {};
    const walletId: string | undefined = metadata.wallet_id;
    const tier = metadata.tier;
    const mode = metadata.mode;
    const quantity = Number.parseInt(metadata.quantity ?? "1", 10) || 1;

    // Always: keep contact info on the wallet for future recovery.
    if (walletId) {
      try {
        await updateWalletContact({
          walletId,
          email: session.customer_details?.email ?? session.customer_email ?? null,
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
        });
      } catch (err) {
        console.error("[stripe/webhook] failed to update wallet contact:", err);
      }
    }

    // Credit the wallet for the purchased pack/credit (idempotent on session_id).
    if (walletId && isTier(tier) && isTierMode(mode) && quantity > 0) {
      try {
        await creditWallet({
          walletId,
          tier,
          mode,
          quantity,
          stripeSessionId: session.id,
        });
      } catch (err) {
        console.error("[stripe/webhook] failed to credit wallet:", err);
      }
    }

    // Single-scan flow: also mark the scan as paid so the streamer can run it.
    const { domain, scan_id } = metadata;
    if (domain && scan_id) {
      try {
        await upsertPaidScan({
          id: scan_id,
          domain,
          stripeSessionId: session.id,
        });
      } catch (err) {
        console.error("[stripe/webhook] failed to upsert scan:", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}
