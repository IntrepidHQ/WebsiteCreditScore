import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";

type Tier = "quick" | "standard" | "deep";

const TIER_PRICE_IDS: Record<Tier, string | undefined> = {
  quick: process.env.STRIPE_PRICE_ID_QUICK ?? process.env.STRIPE_PRICE_ID,
  standard: process.env.STRIPE_PRICE_ID_STANDARD ?? process.env.STRIPE_PRICE_ID,
  deep: process.env.STRIPE_PRICE_ID_DEEP ?? process.env.STRIPE_PRICE_ID,
};

function getStripe() {
  const Stripe = require("stripe").default;
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
}

function isValidTier(t: unknown): t is Tier {
  return t === "quick" || t === "standard" || t === "deep";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domain, tier } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "domain is required" }, { status: 400 });
    }

    const cleanDomain = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/^www\./, "")
      .split("/")[0];

    if (!cleanDomain || cleanDomain.length > 253) {
      return NextResponse.json({ error: "Invalid domain" }, { status: 400 });
    }

    const resolvedTier: Tier = isValidTier(tier) ? tier : "quick";
    const priceId = TIER_PRICE_IDS[resolvedTier];

    if (!priceId) {
      return NextResponse.json({ error: "Stripe price not configured" }, { status: 500 });
    }

    const scanId = randomUUID();
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/scan/${scanId}?source=stripe`,
      cancel_url: `${appUrl}/?cancelled=1`,
      metadata: { domain: cleanDomain, scan_id: scanId, tier: resolvedTier },
    });

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
