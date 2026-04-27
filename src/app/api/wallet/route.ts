import { NextRequest, NextResponse } from "next/server";
import { getWallet, getWalletBalances, EMPTY_BALANCES } from "@/lib/db/wallets";
import { readWalletIdFromRequest } from "@/lib/wallet-cookie";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const walletId = readWalletIdFromRequest(req);
  if (!walletId) {
    return NextResponse.json({ walletId: null, email: null, balances: EMPTY_BALANCES });
  }

  const wallet = await getWallet(walletId);
  if (!wallet) {
    return NextResponse.json({ walletId: null, email: null, balances: EMPTY_BALANCES });
  }

  const balances = await getWalletBalances(walletId);
  return NextResponse.json({
    walletId: wallet.id,
    email: wallet.email,
    balances,
  });
}
