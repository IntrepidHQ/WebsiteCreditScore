import { NextRequest, NextResponse } from "next/server";
import { createScan } from "@/lib/db/scans";
import { createClient } from "@/lib/supabase/server";
import { createHash } from "crypto";

function getStripe() {
  const Stripe = require("stripe").default;
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
}

function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + (process.env.STRIPE_SECRET_KEY ?? ""))
    .digest("hex")
    .slice(0, 16);
}

export async function POST(req: NextRequest) {
  try {
    const { domain } = await req.json();

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

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const userAgent = req.headers.get("user-agent") ?? undefined;

    // Create scan row first so we have a UUID for the success_url
    const scan = await createScan({
      domain: cleanDomain,
      stripeSessionId: "__pending__",
      ipHash: hashIp(ip),
      userAgent,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${appUrl}/scan/${scan.id}?source=stripe`,
      cancel_url: `${appUrl}/?cancelled=1`,
      metadata: { domain: cleanDomain, scan_id: scan.id },
    });

    // Back-fill the real stripe session id
    const supabase = await createClient();
    await supabase
      .from("scans")
      .update({ stripe_session_id: session.id })
      .eq("id", scan.id);

    return NextResponse.json({ checkoutUrl: session.url });
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
