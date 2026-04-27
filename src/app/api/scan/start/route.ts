import { NextRequest, NextResponse } from "next/server";
import { createFreeBypassScan } from "@/lib/db/scans";
import { consumeWalletCredit, getWalletBalances } from "@/lib/db/wallets";
import { readWalletIdFromRequest } from "@/lib/wallet-cookie";
import { isTier, isTierMode, type Tier, type TierMode } from "@/lib/pricing";

const FIRST_SCAN_COOKIE = "wcs_first_scan_claimed";

function isFreeScanModeEnabled(): boolean {
  return (
    process.env.FREE_SCAN_MODE === "true" ||
    process.env.NEXT_PUBLIC_FREE_SCAN_MODE === "true"
  );
}

function isFirstScanFreeEnabled(): boolean {
  return process.env.FIRST_SCAN_FREE !== "false";
}

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

  // 1. Try wallet credit first (paid balance trumps everything).
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
        // Race with another tab — fall through.
      }
    } catch (err) {
      console.error("[scan/start] wallet check failed:", err);
      // Don't block the user — fall through to free/paid flow.
    }
  }

  // 2. First-scan-free promo (cookie-gated).
  const envFree = isFreeScanModeEnabled();
  const firstScanFree = isFirstScanFreeEnabled();
  const cookieClaimed = req.cookies.get(FIRST_SCAN_COOKIE)?.value === "1";
  const allowFree = envFree || (firstScanFree && !cookieClaimed);

  if (!allowFree) {
    return NextResponse.json(
      { error: "Free scan unavailable", reason: cookieClaimed ? "claimed" : "disabled" },
      { status: 403 }
    );
  }

  try {
    const { id } = await createFreeBypassScan(domain);
    const res = NextResponse.json({ scanId: id, source: "first-free" });
    if (!envFree) {
      res.cookies.set(FIRST_SCAN_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  } catch (err) {
    console.error("[scan/start]", err);
    return NextResponse.json(
      { error: "Failed to start scan" },
      { status: 500 }
    );
  }
}
