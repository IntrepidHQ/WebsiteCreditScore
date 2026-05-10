import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { isTier, isTierMode, priceCents, priceLookupKey, tierLabel, BUNDLE_SIZE } from "@/lib/pricing";
import { getOrCreateWallet } from "@/lib/db/wallets";
import { readWalletIdFromRequest, setWalletCookie } from "@/lib/wallet-cookie";
import { createStripeClient } from "@/lib/stripe/server";

function cleanDomain(raw: unknown): string | null {
  if (!raw || typeof raw !== "string") return null;
  const d = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
  if (!d || d.length > 253) return null;
  return d;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain: rawDomain, tier, mode, quantity } = body ?? {};

    if (!isTier(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }
    const resolvedMode = isTierMode(mode) ? mode : "standard";
    const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

    // Two flows:
    // - Single scan (qty=1, domain present) → success_url goes straight to /scan/{id} + adds credit fallback
    // - Credit bundle (qty>=BUNDLE_SIZE OR no domain) → success_url goes to /checkout/success
    const isBundle = qty >= BUNDLE_SIZE || !rawDomain;
    const domain = isBundle ? null : cleanDomain(rawDomain);
    if (!isBundle && !domain) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
    }

    // Resolve (or create) wallet for this customer.
    const existingWalletId = readWalletIdFromRequest(req);
    const wallet = await getOrCreateWallet(existingWalletId);

    const cents = priceCents(tier, resolvedMode, qty);
    if (cents < 50) {
      // Stripe minimum is 50¢ in USD. Reject anything below that.
      return NextResponse.json({ error: "Amount below Stripe minimum" }, { status: 400 });
    }

    const stripe = createStripeClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const scanId = isBundle ? null : randomUUID();

    const productName = qty > 1
      ? `${tierLabel(tier, resolvedMode)} × ${qty}`
      : tierLabel(tier, resolvedMode);
    const productDescription = qty > 1
      ? `${qty} prepaid scan credits — ${resolvedMode === "max" ? "MAX mode" : "Standard mode"}.`
      : `1 ${resolvedMode === "max" ? "MAX mode" : ""} scan credit.`;

    const successUrl = isBundle
      ? `${appUrl}/checkout/success?wallet=${wallet.id}&session_id={CHECKOUT_SESSION_ID}`
      : `${appUrl}/scan/${scanId}?source=stripe&wallet=${wallet.id}`;

    const prices = await stripe.prices.list({
      active: true,
      lookup_keys: [priceLookupKey(tier, resolvedMode, qty)],
      limit: 1,
    });
    const catalogPrice = prices.data[0];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        catalogPrice
          ? { quantity: 1, price: catalogPrice.id }
          : {
              quantity: 1,
              price_data: {
                currency: "usd",
                unit_amount: cents,
                product_data: {
                  name: productName,
                  description: productDescription,
                },
              },
            },
      ],
      success_url: successUrl,
      cancel_url: `${appUrl}/?cancelled=1`,
      // Email collected here is used for credit recovery if cookies are cleared.
      customer_creation: "always",
      // client_reference_id is what we look up in the webhook.
      client_reference_id: wallet.id,
      metadata: {
        wallet_id: wallet.id,
        tier,
        mode: resolvedMode,
        quantity: String(qty),
        ...(domain && scanId ? { domain, scan_id: scanId, scan_credit: "1" } : {}),
      },
    });

    const res = NextResponse.json({ checkoutUrl: session.url, walletId: wallet.id });
    setWalletCookie(res, wallet.id);
    return res;
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
