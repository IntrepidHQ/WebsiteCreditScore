import "server-only";
import { randomUUID } from "crypto";
import { createClient } from "@/lib/supabase/server";
import type { WCSReport } from "@/lib/schema";
import { buildScanResultSummary } from "@/lib/scan-result-summary";

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

/** Dev / limited-time: create a paid scan row without Stripe (guard with env on the API route). */
export async function createFreeBypassScan(domain: string): Promise<{ id: string }> {
  const supabase = await createClient();
  const id = randomUUID();
  const { error } = await supabase.from("scans").insert({
    id,
    domain,
    status: "pending" as ScanStatus,
    paid: true,
    stripe_session_id: `free_scan_${id.replace(/-/g, "").slice(0, 12)}`,
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
    })
    .eq("id", id);
  if (error) throw new Error(`Failed to save scan result: ${error.message}`);
}

export async function saveScanError(id: string, message: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("scans")
    .update({ status: "error", result: { error: message } as unknown as WCSReport })
    .eq("id", id);
}

/** Fetch the most recent completed public scans for the homepage feed. */
export async function getRecentScans(limit = 6): Promise<Array<{
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
  const { data } = await supabase
    .from("scans")
    .select("id, domain, result, created_at")
    .eq("status", "done")
    .eq("paid", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data) return [];

  return data
    .filter((row) => row.result?.overall)
    .map((row) => {
      const summary = buildScanResultSummary(row.result);
      const strongest = summary.strongestCategories[0];
      const weakest = summary.weakestCategories[0];

      return {
        id: row.id,
        domain: row.domain,
        grade: row.result.overall.grade,
        score: row.result.overall.score,
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
