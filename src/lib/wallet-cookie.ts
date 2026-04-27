import "server-only";
import type { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export const WALLET_COOKIE = "wcs_wallet";
const ONE_YEAR = 60 * 60 * 24 * 365;

const COOKIE_OPTS = {
  httpOnly: true as const,
  sameSite: "lax" as const,
  path: "/",
  maxAge: ONE_YEAR,
  secure: process.env.NODE_ENV === "production",
};

export function readWalletIdFromRequest(req: NextRequest): string | null {
  return req.cookies.get(WALLET_COOKIE)?.value ?? null;
}

export function setWalletCookie(res: NextResponse, walletId: string): void {
  res.cookies.set(WALLET_COOKIE, walletId, COOKIE_OPTS);
}

/** For server components / route handlers using next/headers cookies(). */
export async function readWalletIdFromCookies(): Promise<string | null> {
  const store = await cookies();
  return store.get(WALLET_COOKIE)?.value ?? null;
}

/** For route handlers writing through next/headers cookies() (e.g. server actions). */
export async function writeWalletCookie(walletId: string): Promise<void> {
  const store = await cookies();
  store.set(WALLET_COOKIE, walletId, COOKIE_OPTS);
}
