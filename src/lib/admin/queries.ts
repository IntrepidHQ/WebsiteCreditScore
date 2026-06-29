import "server-only";
import { createClient } from "@/lib/supabase/server";
import { buildScanResultSummary } from "@/lib/scan-result-summary";
import type { WCSReport } from "@/lib/schema";

/**
 * Admin lead-intelligence queries.
 *
 * The $1 scan is a loss-leader: its real value is the INTELLIGENCE it produces —
 * who is scanning, what sites they scan, and which of those are qualified leads
 * for the strategypresentation.com redesign/automation service. These queries
 * power /admin with that lens (not a pure revenue dashboard).
 *
 * All reads go through the service-role client (bypasses RLS).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

interface ScanRow {
  id: string;
  domain: string;
  status: string;
  paid: boolean;
  tier: string | null;
  mode: string | null;
  free_claim_email: string | null;
  result: WCSReport | null;
  cost_cents: number | null;
  search_count: number | null;
  result_grade: string | null;
  result_score: number | null;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  stripe_session_id: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface FunnelStats {
  totalScans: number;
  completed: number;
  failed: number;
  free: number;
  paid: number;
  uniqueDomains: number;
  capturedEmails: number;
  avgScore: number | null;
  avgDurationSec: number | null;
  totalCostCents: number;
}

export interface AdminDashboardData {
  windowDays: number;
  funnel: FunnelStats;
  byTier: Array<{ tier: string; mode: string; count: number; avgCostCents: number }>;
  bySource: Array<{ source: string; count: number }>;
  topUtm: Array<{ source: string; count: number }>;
  recentScans: Array<{
    id: string;
    domain: string;
    grade: string | null;
    score: number | null;
    email: string | null;
    tier: string | null;
    mode: string | null;
    status: string;
    createdAt: string;
  }>;
  /** Qualified handoff candidates → strategypresentation.com */
  spCandidates: Array<{
    id: string;
    domain: string;
    grade: string | null;
    score: number | null;
    email: string | null;
    weakestLabel: string;
    weakestScore: number;
    redFlags: number;
    createdAt: string;
  }>;
}

/** Classify how the scan was paid for, from the stripe_session_id convention. */
function scanSource(row: ScanRow): "free" | "wallet" | "paid" {
  if (row.free_claim_email) return "free";
  if (row.stripe_session_id?.startsWith("free_scan_")) return "wallet";
  return "paid";
}

export async function getAdminDashboard(windowDays = 30): Promise<AdminDashboardData> {
  const supabase = createClient();
  const since = new Date(Date.now() - windowDays * DAY_MS).toISOString();

  const { data, error } = await supabase
    .from("scans")
    .select(
      "id, domain, status, paid, tier, mode, free_claim_email, result, cost_cents, search_count, result_grade, result_score, referrer, utm_source, utm_medium, utm_campaign, stripe_session_id, started_at, completed_at, created_at"
    )
    .gte("created_at", since)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`admin dashboard query failed: ${error.message}`);
  const rows = (data ?? []) as ScanRow[];

  // ── Funnel ───────────────────────────────────────────────────────────────
  const completedRows = rows.filter((r) => r.status === "done");
  const scores = completedRows
    .map((r) => r.result_score ?? r.result?.overall?.score ?? null)
    .filter((s): s is number => typeof s === "number");
  const durations = completedRows
    .filter((r) => r.started_at && r.completed_at)
    .map((r) => (new Date(r.completed_at!).getTime() - new Date(r.started_at!).getTime()) / 1000)
    .filter((d) => d > 0 && d < 3600);

  const funnel: FunnelStats = {
    totalScans: rows.length,
    completed: completedRows.length,
    failed: rows.filter((r) => r.status === "error").length,
    free: rows.filter((r) => scanSource(r) !== "paid").length,
    paid: rows.filter((r) => scanSource(r) === "paid").length,
    uniqueDomains: new Set(rows.map((r) => r.domain)).size,
    capturedEmails: new Set(rows.map((r) => r.free_claim_email).filter(Boolean)).size,
    avgScore: scores.length ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10 : null,
    avgDurationSec: durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null,
    totalCostCents: Math.round(rows.reduce((a, r) => a + (r.cost_cents ?? 0), 0)),
  };

  // ── Tier mix ───────────────────────────────────────────────────────────────
  const tierMap = new Map<string, { tier: string; mode: string; count: number; cost: number }>();
  for (const r of rows) {
    const tier = r.tier ?? "quick";
    const mode = r.mode ?? "standard";
    const key = `${tier}_${mode}`;
    const entry = tierMap.get(key) ?? { tier, mode, count: 0, cost: 0 };
    entry.count += 1;
    entry.cost += r.cost_cents ?? 0;
    tierMap.set(key, entry);
  }
  const byTier = [...tierMap.values()]
    .map((e) => ({ tier: e.tier, mode: e.mode, count: e.count, avgCostCents: e.count ? Math.round((e.cost / e.count) * 100) / 100 : 0 }))
    .sort((a, b) => b.count - a.count);

  // ── Source + UTM ─────────────────────────────────────────────────────────
  const sourceMap = new Map<string, number>();
  const utmMap = new Map<string, number>();
  for (const r of rows) {
    const s = scanSource(r);
    sourceMap.set(s, (sourceMap.get(s) ?? 0) + 1);
    const u = r.utm_source ?? (r.referrer ? hostnameOf(r.referrer) : "direct");
    utmMap.set(u, (utmMap.get(u) ?? 0) + 1);
  }
  const bySource = [...sourceMap.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
  const topUtm = [...utmMap.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  // ── Recent scans ───────────────────────────────────────────────────────────
  const recentScans = rows.slice(0, 25).map((r) => ({
    id: r.id,
    domain: r.domain,
    grade: r.result_grade ?? r.result?.overall?.grade ?? null,
    score: r.result_score ?? r.result?.overall?.score ?? null,
    email: r.free_claim_email,
    tier: r.tier,
    mode: r.mode,
    status: r.status,
    createdAt: r.created_at,
  }));

  // ── SP handoff candidates ──────────────────────────────────────────────────
  // A qualified lead = a COMPLETED scan with a captured email (we can reach them)
  // and a result that shows real upside (mid/low score or red flags). These are
  // the prospects to move into the strategypresentation.com flow.
  const spCandidates = completedRows
    .filter((r) => r.free_claim_email && r.result)
    .map((r) => {
      const summary = buildScanResultSummary(r.result!);
      const weakest = summary.weakestCategories[0];
      return {
        id: r.id,
        domain: r.domain,
        grade: r.result_grade ?? r.result!.overall?.grade ?? null,
        score: r.result_score ?? r.result!.overall?.score ?? null,
        email: r.free_claim_email,
        weakestLabel: weakest?.label ?? "Needs review",
        weakestScore: weakest?.score ?? r.result!.overall?.score ?? 0,
        redFlags: r.result!.red_flags?.length ?? 0,
        createdAt: r.created_at,
      };
    })
    // Best leads first: lower score + more red flags = more redesign upside.
    .sort((a, b) => (a.score ?? 100) - (b.score ?? 100) || b.redFlags - a.redFlags)
    .slice(0, 20);

  return { windowDays, funnel, byTier, bySource, topUtm, recentScans, spCandidates };
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "direct";
  }
}
