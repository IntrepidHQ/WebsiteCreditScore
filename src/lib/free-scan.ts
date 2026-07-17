import "server-only";
import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * First-scan-free gate.
 *
 * Every visitor gets exactly one free scan; after that, scans must be paid
 * (wallet credit or Stripe checkout). Two independent signals mark a visitor
 * as having claimed their free scan — either one trips the gate:
 *
 *  1. `wcs_first_scan_claimed` httpOnly cookie (1 year)
 *  2. a salted SHA-256 hash of the client IP recorded on the free scan row
 *     (`scans.ip_hash`) — survives cleared cookies / incognito
 *
 * The raw IP is never stored. Hashing requires FREE_SCAN_HASH_SALT; if the
 * salt is missing we fall back to cookie-only gating rather than blocking
 * scans.
 */

export const FIRST_SCAN_COOKIE = "wcs_first_scan_claimed";

/** Synthetic stripe_session_id prefix that marks non-Stripe scan rows. */
const FREE_SCAN_PREFIX = "free_scan_";

export function clientIp(req: NextRequest): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip");
  return ip || null;
}

export function hashIp(ip: string): string | null {
  const salt = process.env.FREE_SCAN_HASH_SALT;
  if (!salt) return null;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function ipHashFromRequest(req: NextRequest): string | null {
  const ip = clientIp(req);
  return ip ? hashIp(ip) : null;
}

/** Has this IP hash already used a free scan? (Cookie check happens in the route.) */
export async function hasUsedFreeScan(ipHash: string): Promise<boolean> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("scans")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .like("stripe_session_id", `${FREE_SCAN_PREFIX}%`);
  if (error) {
    // Fail open: a DB hiccup should never block a first-time visitor.
    console.error("[free-scan] ip_hash lookup failed:", error.message);
    return false;
  }
  return (count ?? 0) > 0;
}
