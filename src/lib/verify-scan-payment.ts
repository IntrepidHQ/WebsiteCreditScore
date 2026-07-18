import "server-only";
import Stripe from "stripe";
import { upsertPaidScan } from "@/lib/db/scans";
import { creditWallet, updateWalletContact } from "@/lib/db/wallets";
import { isTier, isTierMode } from "@/lib/pricing";

/**
 * Self-heal a paid single-scan on the Stripe return, WITHOUT depending on the
 * webhook.
 *
 * The webhook (POST /api/stripe/webhook) is the normal path that marks a scan
 * paid, but it is a single point of failure: if STRIPE_WEBHOOK_SECRET is unset
 * or the endpoint isn't registered on the (Brainztem-shared) Stripe account,
 * the scan row is never created and the /scan/{id} page waits forever on
 * "Scan Starting".
 *
 * On the Stripe redirect the success_url carries session_id, so the scan page
 * can verify the payment straight from Stripe (using STRIPE_SECRET_KEY, which
 * is always set) and create/mark the scan paid itself. Idempotent: safe to run
 * even after the webhook already handled it.
 *
 * Returns true when the scan is confirmed paid (now or already).
 */
export async function verifyAndUpsertPaidScanFromSession(
  sessionId: string,
  expectedScanId: string,
): Promise<boolean> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !sessionId) return false;

  const stripe = new Stripe(secret, { apiVersion: "2025-02-24.acacia" });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[verify-scan-payment] could not retrieve session:", err);
    return false;
  }

  // Must be actually paid.
  if (session.payment_status !== "paid") return false;

  // The session must be the one minted for THIS scan — prevents unlocking an
  // arbitrary scan id by pasting someone else's session_id.
  const metadata = session.metadata ?? {};
  const domain = metadata.domain;
  if (metadata.scan_id !== expectedScanId || !domain) return false;

  try {
    await upsertPaidScan({
      id: expectedScanId,
      domain,
      stripeSessionId: session.id,
    });
    return true;
  } catch (err) {
    console.error("[verify-scan-payment] upsert failed:", err);
    return false;
  }
}

/**
 * Self-heal a credit-bundle purchase on the /checkout/success return, WITHOUT
 * depending on the webhook — same rationale as the single-scan version. Credits
 * the wallet from the paid session's metadata. Idempotent: creditWallet keys on
 * the Stripe session id, so this is safe alongside the webhook.
 *
 * Returns true when credits are confirmed applied (now or already).
 */
export async function verifyAndCreditWalletFromSession(
  sessionId: string,
  expectedWalletId: string,
): Promise<boolean> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !sessionId) return false;

  const stripe = new Stripe(secret, { apiVersion: "2025-02-24.acacia" });

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[verify-scan-payment] could not retrieve session:", err);
    return false;
  }

  if (session.payment_status !== "paid") return false;

  const metadata = session.metadata ?? {};
  if (metadata.wallet_id !== expectedWalletId) return false;

  const tier = metadata.tier;
  const mode = metadata.mode;
  const quantity = Number.parseInt(metadata.quantity ?? "1", 10) || 1;
  if (!isTier(tier) || !isTierMode(mode) || quantity <= 0) return false;

  try {
    // Keep contact info for recovery, mirroring the webhook.
    await updateWalletContact({
      walletId: expectedWalletId,
      email: session.customer_details?.email ?? session.customer_email ?? null,
      stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
    });
    await creditWallet({
      walletId: expectedWalletId,
      tier,
      mode,
      quantity,
      stripeSessionId: session.id,
    });
    return true;
  } catch (err) {
    console.error("[verify-scan-payment] credit failed:", err);
    return false;
  }
}
