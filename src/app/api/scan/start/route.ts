import { NextRequest, NextResponse } from "next/server";
import { createFreeBypassScan } from "@/lib/db/scans";
import { consumeWalletCredit, getWalletBalances } from "@/lib/db/wallets";
import { readWalletIdFromRequest } from "@/lib/wallet-cookie";
import { isTier, isTierMode, type Tier, type TierMode } from "@/lib/pricing";

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
  let body: { domain?: unknown; tier?: unknown; mode?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const domain = cleanDomain(body.domain);
  if (!domain) {
    return NextResponse.json({ error: "domain is required" }, { status: 400 });
  }

  const tier: Tier = isTier(body.tier) ? body.tier : "quick";
  const mode: TierMode = isTierMode(body.mode) ? body.mode : "standard";
  const walletId = readWalletIdFromRequest(req);

  // Try wallet credit first (paid balance trumps everything).
  if (walletId) {
    try {
      const balances = await getWalletBalances(walletId);
      const key = `${tier}_${mode}` as const;
      if (balances[key] > 0) {
        const { id } = await createFreeBypassScan(domain);
        const consumed = await consumeWalletCredit({
          walletId,
          tier,
          mode,
          scanId: id,
        });
        if (consumed) {
          return NextResponse.json({ scanId: id, source: "wallet" });
        }
      }
    } catch (err) {
      console.error("[scan/start] wallet check failed:", err);
    }
  }

  // All scans are free — no payment gate.
  try {
    const { id } = await createFreeBypassScan(domain);
    return NextResponse.json({ scanId: id, source: "free" });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[scan/start]", err);
    return NextResponse.json(
      { error: "Failed to start scan", detail },
      { status: 500 }
    );
  }
}
