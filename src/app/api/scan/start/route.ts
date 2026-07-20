import { NextRequest, NextResponse } from "next/server";
import { createFreeBypassScan } from "@/lib/db/scans";
import { consumeWalletCredit, getWalletBalances } from "@/lib/db/wallets";
import { readWalletIdFromRequest } from "@/lib/wallet-cookie";
import { isTier, isTierMode, type Tier, type TierMode } from "@/lib/pricing";
import {
  FIRST_SCAN_COOKIE,
  hasUsedFreeScan,
  ipHashFromRequest,
} from "@/lib/free-scan";

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
  let body: { domain?: unknown; tier?: unknown; mode?: unknown; compCode?: unknown };
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
  const ipHash = ipHashFromRequest(req);
  const userAgent = req.headers.get("user-agent");

  // 1. Wallet credit first (paid balance trumps everything).
  if (walletId) {
    try {
      const balances = await getWalletBalances(walletId);
      const key = `${tier}_${mode}` as const;
      if (balances[key] > 0) {
        const { id } = await createFreeBypassScan(domain, { ipHash, userAgent, kind: "wallet" });
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
      // Don't block the user — fall through to the free-scan check.
    }
  }

  // 1b. Owner comp code — unlimited scans for the operator, without punching a
  // hole in the paywall. Requires WCS_COMP_CODE to be set server-side and matched
  // exactly; if the env var is unset the branch can never trigger. Comped rows
  // carry a `comp_scan_` session id so they stay auditable and are trivially
  // separable from revenue in the scans table. Deliberately checked BEFORE the
  // free-scan gate so it doesn't burn the visitor's one free scan.
  const compCode = typeof body.compCode === "string" ? body.compCode.trim() : "";
  const expectedComp = process.env.WCS_COMP_CODE;
  if (compCode && expectedComp && compCode === expectedComp) {
    try {
      const { id } = await createFreeBypassScan(domain, { ipHash, userAgent, kind: "comp" });
      return NextResponse.json({ scanId: id, source: "comp" });
    } catch (err) {
      console.error("[scan/start] comp scan failed:", err);
      return NextResponse.json({ error: "Failed to start scan" }, { status: 500 });
    }
  }

  // 2. One free scan per visitor: cookie + salted IP hash must both be clean.
  const cookieClaimed = req.cookies.get(FIRST_SCAN_COOKIE)?.value === "1";
  const ipClaimed = !cookieClaimed && ipHash ? await hasUsedFreeScan(ipHash) : false;

  if (cookieClaimed || ipClaimed) {
    // 402: client falls back to Stripe checkout.
    return NextResponse.json(
      { error: "Free scan already used", reason: "claimed", checkoutRequired: true },
      { status: 402 }
    );
  }

  try {
    const { id } = await createFreeBypassScan(domain, { ipHash, userAgent });
    const res = NextResponse.json({ scanId: id, source: "first-free" });
    res.cookies.set(FIRST_SCAN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[scan/start]", err);
    return NextResponse.json(
      { error: "Failed to start scan", detail },
      { status: 500 }
    );
  }
}
