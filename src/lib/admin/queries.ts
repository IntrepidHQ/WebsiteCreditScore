/**
 * Live Supabase-backed admin data source. Exports the same function names as
 * `./mock-data` so `./data-source` can swap between them at module load time.
 *
 * When Supabase is unreachable or returns errors, each function logs once and
 * returns an empty / zero-value shape — the admin UI renders cleanly rather
 * than 500ing. The mock fallback is selected by `hasSupabaseEnv()` upstream.
 */

import { getSupabaseServiceClient } from "@/lib/supabase/service";
import type {
  AdminCustomer,
  AdminDailyPoint,
  AdminPlan,
  AdminScan,
  AdminSummary,
} from "./mock-data";
import { applyPrivacyToCustomer, applyPrivacyToScan } from "./privacy";

const DAY = 24 * 60 * 60 * 1000;

const toIsoDay = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * DAY).toISOString();

const formatDateKey = (iso: string) => iso.slice(0, 10);

interface ScanRow {
  id: string;
  workspace_id: string;
  url: string;
  status: "complete" | "failed" | "running";
  score: number | null;
  provider_cost_cents: number;
  revenue_cents: number;
  plan_source: "free" | "pay-per-scan" | "pro-50" | "privacy-pro";
  started_at: string;
}

interface WorkspaceRow {
  id: string;
  name: string;
  slug: string;
  owner_user_id: string;
  created_at: string;
  payload: {
    billingPlan?: string;
    entitlements?: string[];
    name?: string;
    ownerEmail?: string;
  };
}

const planFromRow = (row: WorkspaceRow): AdminPlan => {
  const entitlements = row.payload?.entitlements ?? [];
  if (entitlements.includes("privacy-pro")) return "privacy-pro";
  if (row.payload?.billingPlan === "pro") return "pro-50";
  return "pay-per-scan";
};

const buildCustomerFromAggregates = (
  workspace: WorkspaceRow,
  aggregates: {
    scansUsed: number;
    revenueCents: number;
    costCents: number;
    lastScanAt: string | null;
  },
): AdminCustomer => {
  const plan = planFromRow(workspace);
  const scansIncluded = plan === "pay-per-scan" ? null : 50;
  const displayName = workspace.payload?.name ?? workspace.name ?? "Workspace";
  const email = workspace.payload?.ownerEmail ?? "—";
  return applyPrivacyToCustomer({
    id: workspace.id,
    displayName,
    email,
    joinedAt: workspace.created_at,
    plan,
    scansUsed: aggregates.scansUsed,
    scansIncluded,
    lifetimeRevenueCents: aggregates.revenueCents,
    lifetimeCostCents: aggregates.costCents,
    lastScanAt: aggregates.lastScanAt,
    isPrivacyProtected: plan === "privacy-pro",
  });
};

export async function getAdminCustomers(): Promise<AdminCustomer[]> {
  const client = getSupabaseServiceClient();
  if (!client) return [];

  const [{ data: workspaces, error: wsErr }, { data: scans, error: sErr }] = await Promise.all([
    client
      .from("workspaces")
      .select("id, name, slug, owner_user_id, created_at, payload")
      .order("created_at", { ascending: false }),
    client
      .from("scans")
      .select("workspace_id, provider_cost_cents, revenue_cents, started_at"),
  ]);

  if (wsErr) {
    console.warn("[admin/queries] workspaces fetch failed", wsErr.message);
    return [];
  }
  if (sErr) {
    console.warn("[admin/queries] scans fetch failed", sErr.message);
  }

  const byWorkspace = new Map<
    string,
    { scansUsed: number; revenueCents: number; costCents: number; lastScanAt: string | null }
  >();

  for (const scan of (scans ?? []) as Array<Pick<ScanRow, "workspace_id" | "provider_cost_cents" | "revenue_cents" | "started_at">>) {
    const agg = byWorkspace.get(scan.workspace_id) ?? {
      scansUsed: 0,
      revenueCents: 0,
      costCents: 0,
      lastScanAt: null as string | null,
    };
    agg.scansUsed += 1;
    agg.revenueCents += scan.revenue_cents;
    agg.costCents += scan.provider_cost_cents;
    if (!agg.lastScanAt || scan.started_at > agg.lastScanAt) {
      agg.lastScanAt = scan.started_at;
    }
    byWorkspace.set(scan.workspace_id, agg);
  }

  return ((workspaces ?? []) as WorkspaceRow[])
    .map((w) =>
      buildCustomerFromAggregates(
        w,
        byWorkspace.get(w.id) ?? {
          scansUsed: 0,
          revenueCents: 0,
          costCents: 0,
          lastScanAt: null,
        },
      ),
    )
    .sort((a, b) => b.lifetimeRevenueCents - a.lifetimeRevenueCents);
}

export async function getAdminCustomer(id: string): Promise<AdminCustomer | null> {
  const client = getSupabaseServiceClient();
  if (!client) return null;

  const [{ data: workspace, error: wErr }, { data: scans, error: sErr }] = await Promise.all([
    client
      .from("workspaces")
      .select("id, name, slug, owner_user_id, created_at, payload")
      .eq("id", id)
      .maybeSingle(),
    client
      .from("scans")
      .select("provider_cost_cents, revenue_cents, started_at")
      .eq("workspace_id", id),
  ]);

  if (wErr || !workspace) {
    if (wErr) console.warn("[admin/queries] workspace fetch failed", wErr.message);
    return null;
  }
  if (sErr) {
    console.warn("[admin/queries] scans fetch failed", sErr.message);
  }

  const rows = (scans ?? []) as Array<Pick<ScanRow, "provider_cost_cents" | "revenue_cents" | "started_at">>;
  const agg = rows.reduce(
    (acc, r) => {
      acc.scansUsed += 1;
      acc.revenueCents += r.revenue_cents;
      acc.costCents += r.provider_cost_cents;
      if (!acc.lastScanAt || r.started_at > acc.lastScanAt) {
        acc.lastScanAt = r.started_at;
      }
      return acc;
    },
    { scansUsed: 0, revenueCents: 0, costCents: 0, lastScanAt: null as string | null },
  );

  return buildCustomerFromAggregates(workspace as WorkspaceRow, agg);
}

export async function getAdminScansForCustomer(customerId: string): Promise<AdminScan[]> {
  const client = getSupabaseServiceClient();
  if (!client) return [];

  const customer = await getAdminCustomer(customerId);
  if (!customer) return [];

  const { data, error } = await client
    .from("scans")
    .select("id, workspace_id, url, status, score, provider_cost_cents, revenue_cents, started_at")
    .eq("workspace_id", customerId)
    .order("started_at", { ascending: false });

  if (error) {
    console.warn("[admin/queries] scans for customer failed", error.message);
    return [];
  }

  return ((data ?? []) as ScanRow[]).map((row) =>
    applyPrivacyToScan(
      {
        id: row.id,
        customerId: row.workspace_id,
        url: row.url,
        startedAt: row.started_at,
        score: row.score ?? 0,
        costCents: row.provider_cost_cents,
        revenueCents: row.revenue_cents,
        status: row.status,
      },
      { isPrivacyProtected: customer.isPrivacyProtected },
    ),
  );
}

export async function getAdminDailySeries(days = 30): Promise<AdminDailyPoint[]> {
  const client = getSupabaseServiceClient();
  if (!client) return [];

  const cutoffIso = toIsoDay(-(days - 1));

  const { data, error } = await client
    .from("scans")
    .select("started_at, revenue_cents, provider_cost_cents")
    .gte("started_at", cutoffIso);

  if (error) {
    console.warn("[admin/queries] daily series failed", error.message);
    return [];
  }

  const buckets = new Map<string, AdminDailyPoint>();
  for (let offset = -(days - 1); offset <= 0; offset++) {
    const date = formatDateKey(toIsoDay(offset));
    buckets.set(date, { date, scans: 0, revenueCents: 0, costCents: 0 });
  }

  for (const row of (data ?? []) as Array<Pick<ScanRow, "started_at" | "revenue_cents" | "provider_cost_cents">>) {
    const key = formatDateKey(row.started_at);
    const point = buckets.get(key);
    if (!point) continue;
    point.scans += 1;
    point.revenueCents += row.revenue_cents;
    point.costCents += row.provider_cost_cents;
  }

  return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export async function getAdminSummary(): Promise<AdminSummary> {
  const client = getSupabaseServiceClient();
  const zero: AdminSummary = {
    totalCustomers: 0,
    payingCustomers: 0,
    scansLast30Days: 0,
    revenueCentsLast30Days: 0,
    costCentsLast30Days: 0,
    marginCentsLast30Days: 0,
    marginPercentLast30Days: 0,
  };
  if (!client) return zero;

  const [customers, series] = await Promise.all([
    getAdminCustomers(),
    getAdminDailySeries(30),
  ]);

  const scansLast30Days = series.reduce((sum, p) => sum + p.scans, 0);
  const revenueCentsLast30Days = series.reduce((sum, p) => sum + p.revenueCents, 0);
  const costCentsLast30Days = series.reduce((sum, p) => sum + p.costCents, 0);
  const marginCentsLast30Days = revenueCentsLast30Days - costCentsLast30Days;
  const marginPercentLast30Days =
    revenueCentsLast30Days === 0
      ? 0
      : Math.round((marginCentsLast30Days / revenueCentsLast30Days) * 1000) / 10;

  return {
    totalCustomers: customers.length,
    payingCustomers: customers.filter((c) => c.scansUsed > 0).length,
    scansLast30Days,
    revenueCentsLast30Days,
    costCentsLast30Days,
    marginCentsLast30Days,
    marginPercentLast30Days,
  };
}
