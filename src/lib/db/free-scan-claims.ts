import "server-only";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";

const IP_DAILY_LIMIT = 5;
const DOMAIN_DAILY_LIMIT = 8;

export function normalizeEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) return null;
  return normalized;
}

export function hashFreeScanSignal(value: string | null): string | null {
  if (!value) return null;
  const salt =
    process.env.FREE_SCAN_HASH_SALT ??
    process.env.SUPABASE_SECRET_KEY ??
    process.env.STORAGE_SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.STORAGE_SUPABASE_SERVICE_ROLE_KEY;
  if (!salt) {
    throw new Error("Missing FREE_SCAN_HASH_SALT or Supabase secret key for abuse-signal hashing.");
  }
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

export async function getFreeScanClaim(email: string): Promise<{ scan_id: string | null; claimed_at: string } | null> {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("free_scan_claims")
    .select("scan_id, claimed_at")
    .eq("email", normalized)
    .single();

  return data ?? null;
}

export async function assertFreeScanVelocity(opts: {
  domain: string;
  ipHash: string | null;
}): Promise<{ ok: true } | { ok: false; reason: "ip_limit" | "domain_limit" }> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  if (opts.ipHash) {
    const { count } = await supabase
      .from("free_scan_claims")
      .select("email", { count: "exact", head: true })
      .eq("ip_hash", opts.ipHash)
      .gte("claimed_at", since);

    if ((count ?? 0) >= IP_DAILY_LIMIT) {
      return { ok: false, reason: "ip_limit" };
    }
  }

  const { count: domainCount } = await supabase
    .from("free_scan_claims")
    .select("email", { count: "exact", head: true })
    .eq("domain", opts.domain)
    .gte("claimed_at", since);

  if ((domainCount ?? 0) >= DOMAIN_DAILY_LIMIT) {
    return { ok: false, reason: "domain_limit" };
  }

  return { ok: true };
}

export async function claimVerifiedFreeScan(opts: {
  email: string;
  domain: string;
  ipHash: string | null;
  userAgentHash: string | null;
}): Promise<string | null> {
  const normalized = normalizeEmail(opts.email);
  if (!normalized) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_verified_free_scan", {
    p_email: normalized,
    p_domain: opts.domain,
    p_ip_hash: opts.ipHash,
    p_user_agent_hash: opts.userAgentHash,
  });

  if (error) {
    throw error;
  }

  return typeof data === "string" ? data : null;
}
