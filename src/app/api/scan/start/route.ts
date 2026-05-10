import { NextRequest, NextResponse } from "next/server";
import { createFreeBypassScan } from "@/lib/db/scans";
import {
  assertFreeScanVelocity,
  claimVerifiedFreeScan,
  getFreeScanClaim,
  hashFreeScanSignal,
  normalizeEmail,
} from "@/lib/db/free-scan-claims";
import { consumeWalletCredit, getWalletBalances } from "@/lib/db/wallets";
import { readWalletIdFromRequest } from "@/lib/wallet-cookie";
import { isTier, isTierMode, type Tier, type TierMode } from "@/lib/pricing";
import { isTemporaryFreeScanWindow } from "@/lib/free-scan-window";
import { createAuthClient } from "@/lib/supabase/server";

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
  let body: { domain?: unknown; tier?: unknown; mode?: unknown; email?: unknown };
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
  const requestedEmail = typeof body.email === "string" ? normalizeEmail(body.email) : null;
  const ipHash = hashFreeScanSignal(
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip")
  );
  const userAgentHash = hashFreeScanSignal(req.headers.get("user-agent"));

  // 1. Try wallet credit first (paid balance trumps everything).
  if (walletId) {
    try {
      const balances = await getWalletBalances(walletId);
      const key = `${tier}_${mode}` as const;
      if (balances[key] > 0) {
        const { id } = await createFreeBypassScan(domain, { tier, mode, ipHash, userAgentHash });
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

  // 2. First-scan-free promo (verified email gated).
  const envFree = isFreeScanModeEnabled();
  const firstScanFree = isFirstScanFreeEnabled();
  const tempFreeWindow = isTemporaryFreeScanWindow();
  const allowDevFree = tempFreeWindow || envFree;
  let verifiedEmail: string | null = null;
  if (!allowDevFree && requestedEmail) {
    const auth = await createAuthClient();
    const { data } = await auth.auth.getUser();
    verifiedEmail = data.user?.email ? normalizeEmail(data.user.email) : null;
  }
  const allowVerifiedFree =
    firstScanFree &&
    tier === "quick" &&
    mode === "standard" &&
    requestedEmail !== null &&
    verifiedEmail === requestedEmail;

  if (!allowDevFree && !allowVerifiedFree) {
    return NextResponse.json(
      {
        error: "Free scan unavailable",
        reason: tier !== "quick" || mode !== "standard" ? "paid_depth" : "email_verification_required",
      },
      { status: 403 }
    );
  }

  try {
    if (!allowDevFree) {
      const existing = await getFreeScanClaim(verifiedEmail!);
      if (existing) {
        return NextResponse.json(
          { error: "Free scan already claimed", reason: "claimed", scanId: existing.scan_id },
          { status: 403 }
        );
      }

      const velocity = await assertFreeScanVelocity({ domain, ipHash });
      if (!velocity.ok) {
        return NextResponse.json(
          { error: "Free scan limit reached", reason: velocity.reason },
          { status: 429 }
        );
      }
    }

    let id: string;
    if (allowDevFree) {
      const scan = await createFreeBypassScan(domain, {
        tier,
        mode,
        ipHash,
        userAgentHash,
      });
      id = scan.id;
    } else {
      const claimedScanId = await claimVerifiedFreeScan({
        email: verifiedEmail!,
        domain,
        ipHash,
        userAgentHash,
      });
      if (!claimedScanId) {
        return NextResponse.json(
          { error: "Free scan already claimed", reason: "claimed" },
          { status: 403 }
        );
      }
      id = claimedScanId;
    }

    const res = NextResponse.json({ scanId: id, source: "first-free" });
    if (!allowDevFree) {
      res.cookies.set(FIRST_SCAN_COOKIE, "1", {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
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
