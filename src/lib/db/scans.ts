import "server-only";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import type { WCSReport } from "@/lib/schema";
import { buildScanResultSummary } from "@/lib/scan-result-summary";
import { gradeFromScore, computeOverallScore } from "@/lib/scoring";

export type ScanStatus = "pending" | "streaming" | "done" | "error";

export interface Scan {
  id: string;
  domain: string;
  status: ScanStatus;
  paid: boolean;
  stripe_session_id: string | null;
  result: WCSReport | null;
  source_count: number | null;
  cost_cents: number | null;
  created_at: string;
  ip_hash: string | null;
  user_agent: string | null;
  is_public_example?: boolean;
  scan_attempts?: number;
  run_started_at?: string | null;
  run_lease_expires_at?: string | null;
  last_error?: string | null;
  progress?: Record<string, unknown>;
  completed_at?: string | null;
}

export async function getScan(id: string): Promise<Scan | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scans")
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Scan;
}

/**
 * Create a paid scan row without Stripe checkout — used for the one free
 * first scan (`kind: "free"`, the default) and for wallet-credit scans
 * (`kind: "wallet"`). The synthetic stripe_session_id prefix distinguishes
 * them so the first-scan-free gate only counts genuinely free scans.
 */
export async function createFreeBypassScan(
  domain: string,
  opts?: { ipHash?: string | null; userAgent?: string | null; kind?: "free" | "wallet" | "comp" }
): Promise<{ id: string }> {
  const supabase = await createClient();
  const id = randomUUID();
  // Synthetic session ids mark non-Stripe rows so they stay auditable and
  // distinguishable in the scans table: wallet credit, the one free scan, or
  // an owner comp (see WCS_COMP_CODE in /api/scan/start).
  const prefix =
    opts?.kind === "wallet" ? "wallet_scan_" : opts?.kind === "comp" ? "comp_scan_" : "free_scan_";
  const { error } = await supabase.from("scans").insert({
    id,
    domain,
    status: "pending" as ScanStatus,
    paid: true,
    stripe_session_id: `${prefix}${id.replace(/-/g, "").slice(0, 12)}`,
    ip_hash: opts?.ipHash ?? null,
    user_agent: opts?.userAgent ?? null,
  });
  if (error) throw new Error(`Failed to create scan: ${error.message}`);
  return { id };
}

export async function createScan(opts: {
  domain: string;
  stripeSessionId: string;
  ipHash?: string;
  userAgent?: string;
}): Promise<Scan> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("scans")
    .insert({
      domain: opts.domain,
      status: "pending",
      paid: false,
      stripe_session_id: opts.stripeSessionId,
      ip_hash: opts.ipHash,
      user_agent: opts.userAgent,
    })
    .select()
    .single();
  if (error) throw new Error(`Failed to create scan: ${error.message}`);
  return data as Scan;
}

export async function markScanPaid(stripeSessionId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scans")
    .update({ paid: true })
    .eq("stripe_session_id", stripeSessionId);
  if (error) throw new Error(`Failed to mark scan paid: ${error.message}`);
}

export async function upsertPaidScan(opts: {
  id: string;
  domain: string;
  stripeSessionId: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scans")
    .upsert(
      {
        id: opts.id,
        domain: opts.domain,
        status: "pending" as ScanStatus,
        paid: true,
        stripe_session_id: opts.stripeSessionId,
      },
      { onConflict: "id" }
    );
  if (error) throw new Error(`Failed to upsert scan: ${error.message}`);
}

export async function updateScanStatus(id: string, status: ScanStatus): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scans")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(`Failed to update scan status: ${error.message}`);
}

/** Explicit operator curation only. Payment never grants publication consent. */
export async function setScanPublicExample(id: string, isPublicExample: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scans")
    .update({ is_public_example: isPublicExample })
    .eq("id", id);
  if (error) throw new Error(`Failed to update public-example status: ${error.message}`);
}

/** Atomically lease a paid scan to one worker. Expired workers are reclaimable. */
export async function claimScanRun(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("claim_scan_run", { p_scan_id: id });
  if (error) throw new Error(`Failed to claim scan: ${error.message}`);
  return data === true;
}

export async function updateScanProgress(id: string, progress: Record<string, unknown>): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scans")
    .update({ progress: { ...progress, updated_at: new Date().toISOString() } })
    .eq("id", id);
  if (error) throw new Error(`Failed to update scan progress: ${error.message}`);
}

export async function saveScanResult(
  id: string,
  result: WCSReport,
  opts: { sourceCount: number; costCents: number }
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("scans")
    .update({
      status: "done",
      result,
      source_count: opts.sourceCount,
      cost_cents: opts.costCents,
      completed_at: new Date().toISOString(),
      run_lease_expires_at: null,
      last_error: null,
      progress: { phase: "complete", updated_at: new Date().toISOString() },
    })
    .eq("id", id);
  if (error) throw new Error(`Failed to save scan result: ${error.message}`);
}

export async function saveScanError(id: string, message: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("scans")
    .update({
      status: "error",
      result: { error: message } as unknown as WCSReport,
      last_error: message,
      run_lease_expires_at: null,
      progress: { phase: "error", message, updated_at: new Date().toISOString() },
    })
    .eq("id", id);
}

/**
 * Public discovery is opt-in. Until the database curation migration is applied,
 * only domains deliberately listed in WCS_PUBLIC_SCAN_DOMAINS can appear on the
 * marketing site. Customer payment is never publication consent.
 */
export async function getRecentScans(limit: number | null = 6): Promise<Array<{
  id: string;
  domain: string;
  grade: string;
  score: number;
  headline: string;
  one_liner: string;
  strongest_label: string;
  strongest_score: number;
  weakest_label: string;
  weakest_score: number;
  red_flags: number;
  green_flags: number;
  sources: number;
  created_at: string;
}>> {
  const supabase = await createClient();
  // Pull newest-first, unbounded, so we can dedupe by domain before limiting —
  // a re-scanned domain shows only its latest report, never a stale duplicate.
  const { data } = await supabase
    .from("scans")
    .select("id, domain, result, created_at")
    .eq("status", "done")
    .eq("paid", true)
    .eq("is_public_example", true)
    .order("created_at", { ascending: false });

  if (!data) return [];

  const seenDomains = new Set<string>();
  const deduped = data.filter((row) => {
    const key = row.domain.trim().toLowerCase();
    if (seenDomains.has(key)) return false;
    seenDomains.add(key);
    return true;
  });

  const limited = limit !== null ? deduped.slice(0, limit) : deduped;

  return limited
    .filter((row) => row.result?.overall)
    .map((row) => {
      const summary = buildScanResultSummary(row.result);
      const strongest = summary.strongestCategories[0];
      const weakest = summary.weakestCategories[0];

      // Recompute the overall + grade from the dimension scores so a card
      // always matches its report page, even for reports saved before
      // server-side score normalization.
      const score = row.result.dimensions?.length
        ? computeOverallScore(row.result.dimensions)
        : row.result.overall.score;
      return {
        id: row.id,
        domain: row.domain,
        grade: gradeFromScore(score),
        score,
        headline: row.result.overall.headline,
        one_liner: row.result.overall.one_liner,
        strongest_label: strongest?.label ?? "Strong signal",
        strongest_score: strongest?.score ?? row.result.overall.score,
        weakest_label: weakest?.label ?? "Needs review",
        weakest_score: weakest?.score ?? row.result.overall.score,
        red_flags: row.result.red_flags?.length ?? 0,
        green_flags: row.result.green_flags?.length ?? 0,
        sources: row.result.sources?.length ?? 0,
        created_at: row.created_at,
      };
    });
}

/** Check for a cached result for this domain (last 7 days). */
export async function getCachedResult(domain: string): Promise<WCSReport | null> {
  const supabase = await createClient();
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("scans")
    .select("result")
    .eq("domain", domain)
    .eq("status", "done")
    .eq("paid", true)
    .gt("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data?.result ?? null;
}
