import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { findWalletByStripeSession, getWallet, getWalletBalances } from "@/lib/db/wallets";
import { setWalletCookie } from "@/lib/wallet-cookie";
import { createStripeClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

/**
 * Restore a wallet from a Stripe checkout session id.
 * The session id is in the customer's Stripe receipt email — that's the recovery token.
 * We validate the session against Stripe to make sure it actually exists & belongs to us,
 * then resolve the wallet via the recorded purchase transaction.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const sessionId: string | undefined = typeof body?.sessionId === "string" ? body.sessionId.trim() : undefined;

    if (!sessionId || !sessionId.startsWith("cs_")) {
      return NextResponse.json({ error: "Provide your Stripe session id (starts with cs_)" }, { status: 400 });
    }

    // Validate session exists in Stripe (catches typos and prevents arbitrary lookup probes).
    const stripe = createStripeClient();
    let session: Stripe.Checkout.Session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Prefer the recorded transaction (it's been processed by the webhook).
    let walletId = await findWalletByStripeSession(session.id);

    // Fallback: webhook hasn't fired yet — fall back to client_reference_id / metadata.
    if (!walletId) {
      walletId = session.client_reference_id ?? session.metadata?.wallet_id ?? null;
    }

    if (!walletId) {
      return NextResponse.json({ error: "No wallet linked to this session" }, { status: 404 });
    }

    const wallet = await getWallet(walletId);
    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
    }

    const balances = await getWalletBalances(wallet.id);
    const res = NextResponse.json({
      walletId: wallet.id,
      email: wallet.email,
      balances,
    });
    setWalletCookie(res, wallet.id);
    return res;
  } catch (err) {
    console.error("[wallet/restore]", err);
    return NextResponse.json({ error: "Failed to restore wallet" }, { status: 500 });
  }
}
