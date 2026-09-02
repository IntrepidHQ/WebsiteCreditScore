import { NextRequest, NextResponse } from "next/server";
import { getOrCreateWallet, getWalletBalances } from "@/lib/db/wallets";
import { createScanGift, getRewardBalance, PRIVATE_SCAN_POINT_COST, redeemPrivateScanCredit, rewardSystemAvailable } from "@/lib/db/rewards";
import { readWalletIdFromRequest, setWalletCookie } from "@/lib/wallet-cookie";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const walletId = readWalletIdFromRequest(req);
  try {
    if (!(await rewardSystemAvailable())) {
      return NextResponse.json({ available: false, points: 0, redeemAt: PRIVATE_SCAN_POINT_COST });
    }
    if (!walletId) return NextResponse.json({ available: true, points: 0, redeemAt: PRIVATE_SCAN_POINT_COST });
    const points = await getRewardBalance(walletId);
    return NextResponse.json({ available: true, points, redeemAt: PRIVATE_SCAN_POINT_COST }, { headers: { "cache-control": "private, no-store" } });
  } catch {
    return NextResponse.json({ available: false, points: 0, redeemAt: PRIVATE_SCAN_POINT_COST });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({})) as { action?: unknown };
    const wallet = await getOrCreateWallet(readWalletIdFromRequest(req));

    if (body.action === "gift") {
      const code = await createScanGift(wallet.id);
      const url = new URL("/", req.url);
      url.searchParams.set("gift", code);
      const res = NextResponse.json({ giftUrl: url.toString() });
      setWalletCookie(res, wallet.id);
      return res;
    }

    if (body.action === "redeem") {
      const redeemed = await redeemPrivateScanCredit(wallet.id);
      if (!redeemed) {
        return NextResponse.json({ error: `You need ${PRIVATE_SCAN_POINT_COST} points to redeem a private scan.` }, { status: 409 });
      }
      const [points, balances] = await Promise.all([getRewardBalance(wallet.id), getWalletBalances(wallet.id)]);
      const res = NextResponse.json({ redeemed: true, points, balances });
      setWalletCookie(res, wallet.id);
      return res;
    }

    return NextResponse.json({ error: "Unknown reward action" }, { status: 400 });
  } catch (error) {
    console.error("[rewards]", error);
    return NextResponse.json({ error: "Rewards are not available yet" }, { status: 503 });
  }
}
