import { NextRequest, NextResponse } from "next/server";
import { createFreeBypassScan } from "@/lib/db/scans";
import { consumeWalletCredit, getWalletBalances } from "@/lib/db/wallets";
import { getOrCreateWallet } from "@/lib/db/wallets";
import { readWalletIdFromRequest } from "@/lib/wallet-cookie";
import { setWalletCookie } from "@/lib/wallet-cookie";
import { isTier, isTierMode, type Tier, type TierMode } from "@/lib/pricing";
import {
  FIRST_SCAN_COOKIE,
  hasUsedFreeScan,
  ipHashFromRequest,
} from "@/lib/free-scan";
import { scanAccessCookieName } from "@/lib/scan-access";
import { claimScanGift } from "@/lib/db/rewards";

function withScanAccess(res: NextResponse, scanId: string, token: string): NextResponse {
  res.cookies.set(scanAccessCookieName(scanId), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return res;
}

function maybeWithScanAccess(res: NextResponse, scanId: string, token: string | null): NextResponse {
  return token ? withScanAccess(res, scanId, token) : res;
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
  let body: { domain?: unknown; tier?: unknown; mode?: unknown; compCode?: unknown; intent?: unknown; giftCode?: unknown };
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
  const intent = body.intent === "credit" || body.intent === "operator" ? body.intent : "free";

  // A private credit is consumed only when the visitor explicitly chooses it.
  // This prevents a stored credit from silently replacing their one free scan.
  if (intent === "credit" && walletId) {
    try {
      const balances = await getWalletBalances(walletId);
      const key = `${tier}_${mode}` as const;
      if (balances[key] > 0) {
        const { id, accessToken } = await createFreeBypassScan(domain, {
          ipHash,
          userAgent,
          kind: "wallet",
          walletId,
        });
        const consumed = await consumeWalletCredit({
          walletId,
          tier,
          mode,
          scanId: id,
        });
        if (consumed) {
          return maybeWithScanAccess(NextResponse.json({ scanId: id, source: "wallet", visibility: "private" }), id, accessToken);
        }
        // Race with another tab — fall through.
      }
    } catch (err) {
      console.error("[scan/start] wallet check failed:", err);
      return NextResponse.json({ error: "Could not use this credit" }, { status: 500 });
    }
  }
  if (intent === "credit") {
    return NextResponse.json({ error: "No matching scan credit is available" }, { status: 402 });
  }

  // 1b. Owner comp code — unlimited scans for the operator, without punching a
  // hole in the paywall. Requires WCS_COMP_CODE to be set server-side and matched
  // exactly; if the env var is unset the branch can never trigger. Comped rows
  // carry a `comp_scan_` session id so they stay auditable and are trivially
  // separable from revenue in the scans table. Deliberately checked BEFORE the
  // free-scan gate so it doesn't burn the visitor's one free scan.
  const compCode = typeof body.compCode === "string" ? body.compCode.trim() : "";
  const expectedComp = process.env.WCS_COMP_CODE;
  if (intent === "operator" && compCode && expectedComp && compCode === expectedComp) {
    try {
      const { id, accessToken } = await createFreeBypassScan(domain, { ipHash, userAgent, kind: "comp" });
      return maybeWithScanAccess(NextResponse.json({ scanId: id, source: "comp", visibility: "public" }), id, accessToken);
    } catch (err) {
      console.error("[scan/start] comp scan failed:", err);
      return NextResponse.json({ error: "Failed to start scan" }, { status: 500 });
    }
  }
  if (intent === "operator") {
    return NextResponse.json({ error: "Invalid operator access code" }, { status: 401 });
  }

  // The free offer is the Aerial scan. Deeper scans use paid private compute.
  if (tier !== "quick" || mode !== "standard") {
    return NextResponse.json(
      { error: "The free public scan is available for Aerial Scan only", checkoutRequired: true },
      { status: 402 },
    );
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
    const wallet = await getOrCreateWallet(walletId);
    const { id, accessToken } = await createFreeBypassScan(domain, {
      ipHash,
      userAgent,
      walletId: wallet.id,
    });
    if (typeof body.giftCode === "string" && body.giftCode.trim()) {
      await claimScanGift(body.giftCode.trim().slice(0, 80), wallet.id, id).catch((giftError) => {
        console.error("[scan/start] gift claim failed:", giftError);
      });
    }
    const res = NextResponse.json({ scanId: id, source: "first-free", visibility: "public" });
    res.cookies.set(FIRST_SCAN_COOKIE, "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    setWalletCookie(res, wallet.id);
    return maybeWithScanAccess(res, id, accessToken);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("[scan/start]", err);
    return NextResponse.json(
      { error: "Failed to start scan", detail },
      { status: 500 }
    );
  }
}
