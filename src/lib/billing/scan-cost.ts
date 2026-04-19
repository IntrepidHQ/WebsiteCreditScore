/**
 * Per-scan provider cost estimator + recorder.
 *
 * The customer pays us either $1 per scan (pay-per-scan) or $50 for 50 scans
 * (pro-50 / privacy-pro = $1 attributed per scan). What we pay our providers
 * for each scan varies with LLM token counts, crawler calls, and screenshots.
 * This module centralizes those costs so docs/BILLING.md, admin reporting,
 * and downstream finance all agree on one source of truth.
 *
 * Units are always cents (integers). Estimation returns a conservative ceiling.
 */

import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const CLAUDE_SONNET_INPUT_PER_MTOK_CENTS = 300; // $3.00 per 1M input tokens
export const CLAUDE_SONNET_OUTPUT_PER_MTOK_CENTS = 1500; // $15.00 per 1M output tokens
export const FIRECRAWL_CALL_CENTS = 1; // hobby plan amortized
export const BROWSERLESS_CALL_CENTS = 0.3; // ~3s render amortized

/**
 * Default per-scan cost to charge to the internal ledger when we haven't
 * captured exact token usage yet. Tuned to reflect a typical audit today
 * (~6k input tokens + ~1.5k output tokens + 1 Firecrawl call + 1 screenshot +
 * storage/egress overhead). Keep in sync with docs/BILLING.md.
 */
export const DEFAULT_SCAN_COST_CENTS = 10;

/** Revenue we book per completed scan. One credit == one scan == $1 attributed. */
export const REVENUE_PER_SCAN_CENTS = 100;

export interface ScanCostInputs {
  claudeInputTokens?: number;
  claudeOutputTokens?: number;
  firecrawlCalls?: number;
  browserlessCalls?: number;
  /** Flat overhead to add on top (storage/egress/misc). */
  overheadCents?: number;
}

/**
 * Ceiling estimate. Always at least 1¢ — we never log a free scan. Use when we
 * know token counts; fall back to `DEFAULT_SCAN_COST_CENTS` when we don't.
 */
export function estimateScanCostCents(parts: ScanCostInputs): number {
  const inCost =
    ((parts.claudeInputTokens ?? 0) / 1_000_000) * CLAUDE_SONNET_INPUT_PER_MTOK_CENTS;
  const outCost =
    ((parts.claudeOutputTokens ?? 0) / 1_000_000) * CLAUDE_SONNET_OUTPUT_PER_MTOK_CENTS;
  const fc = (parts.firecrawlCalls ?? 0) * FIRECRAWL_CALL_CENTS;
  const bl = (parts.browserlessCalls ?? 0) * BROWSERLESS_CALL_CENTS;
  const overhead = parts.overheadCents ?? 0;
  const total = inCost + outCost + fc + bl + overhead;
  return Math.max(1, Math.ceil(total));
}

export type ScanPlanSource = "free" | "pay-per-scan" | "pro-50" | "privacy-pro";
export type ScanStatus = "running" | "complete" | "failed";

export interface RecordScanArgs {
  workspaceId: string | null;
  userId?: string | null;
  url: string;
  score: number | null;
  providerCostCents: number;
  revenueCents: number;
  planSource: ScanPlanSource;
  status?: ScanStatus;
}

/**
 * Fire-and-forget scan recorder. Never throws — callers should invoke as
 * `void recordScan(...)` and never await it, so a DB outage can't fail an
 * in-flight audit response.
 *
 * No-op when Supabase service-role env is missing (e.g. preview deploys).
 */
export async function recordScan(args: RecordScanArgs): Promise<void> {
  if (!args.workspaceId) {
    return;
  }

  const client = getSupabaseServiceClient();
  if (!client) {
    return;
  }

  try {
    const { error } = await client.from("scans").insert({
      workspace_id: args.workspaceId,
      user_id: args.userId ?? null,
      url: args.url,
      status: args.status ?? "complete",
      score: args.score,
      provider_cost_cents: Math.max(0, Math.round(args.providerCostCents)),
      revenue_cents: Math.max(0, Math.round(args.revenueCents)),
      plan_source: args.planSource,
      completed_at:
        args.status === "running" ? null : new Date().toISOString(),
    });
    if (error) {
      console.warn("[scans] recordScan insert failed", error.message);
    }
  } catch (err) {
    console.warn("[scans] recordScan threw", err);
  }
}
