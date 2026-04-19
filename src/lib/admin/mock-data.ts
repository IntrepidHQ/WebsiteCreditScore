/**
 * Stub data source for the admin dashboard. Phase 2 will replace this with
 * a real Supabase-backed query layer (scans + customers + subscriptions).
 *
 * Keep the shapes stable — dashboard components import from here, and the
 * swap to live data should only need to change the implementation, not the
 * exports.
 */

export type AdminPlan = "pay-per-scan" | "pro-50" | "privacy-pro";

export interface AdminCustomer {
  id: string;
  displayName: string; // may be "Private account" when privacy-pro
  email: string; // may be redacted string when privacy-pro
  joinedAt: string; // ISO date
  plan: AdminPlan;
  scansUsed: number;
  scansIncluded: number | null; // null for pay-per-scan
  lifetimeRevenueCents: number;
  lifetimeCostCents: number;
  lastScanAt: string | null;
  isPrivacyProtected: boolean;
}

export interface AdminScan {
  id: string;
  customerId: string;
  url: string;
  startedAt: string;
  score: number;
  costCents: number; // inference + observation cost we paid
  revenueCents: number; // what customer paid for this scan
  status: "complete" | "failed" | "running";
}

export interface AdminDailyPoint {
  date: string; // YYYY-MM-DD
  scans: number;
  revenueCents: number;
  costCents: number;
}

export interface AdminSummary {
  totalCustomers: number;
  payingCustomers: number;
  scansLast30Days: number;
  revenueCentsLast30Days: number;
  costCentsLast30Days: number;
  marginCentsLast30Days: number;
  marginPercentLast30Days: number; // 0..100
}

// ---------- Deterministic seed data ----------

const DAY = 24 * 60 * 60 * 1000;

const mulberry32 = (seed: number) => {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const rng = mulberry32(20260418);
const pick = <T,>(items: T[]): T => items[Math.floor(rng() * items.length)]!;

const FIRST_NAMES = [
  "Dana",
  "Elena",
  "Ravi",
  "Marcus",
  "Priya",
  "Owen",
  "Sofia",
  "Isabelle",
  "Theo",
  "Noor",
  "Jordan",
  "Bea",
];
const LAST_NAMES = [
  "Kellerman",
  "Okafor",
  "Park",
  "Vasquez",
  "Lindgren",
  "Hollis",
  "Barnard",
  "Chen",
  "Ward",
  "Patel",
];
const DOMAINS = [
  "atelier.studio",
  "forge.agency",
  "studiobright.co",
  "marquee-digital.com",
  "northwind.design",
  "candescent.io",
  "riverstone.agency",
  "fieldnotes.studio",
];

const isoDay = (offsetDaysFromToday: number) => {
  const d = new Date(Date.now() + offsetDaysFromToday * DAY);
  return d.toISOString();
};

const formatDate = (iso: string) => iso.slice(0, 10);

// Build 24 customers with varied plans.
const CUSTOMERS: AdminCustomer[] = Array.from({ length: 24 }, (_, i) => {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  const domain = pick(DOMAINS);
  const joinedOffset = -(Math.floor(rng() * 90) + 1);
  const planRoll = rng();
  const plan: AdminPlan =
    planRoll < 0.18 ? "privacy-pro" : planRoll < 0.5 ? "pro-50" : "pay-per-scan";
  const scansUsed =
    plan === "pro-50"
      ? Math.floor(rng() * 48) + 2
      : plan === "privacy-pro"
        ? Math.floor(rng() * 48) + 2
        : Math.floor(rng() * 12) + 1;
  const scansIncluded = plan === "pay-per-scan" ? null : 50;
  const revenueCents =
    plan === "pay-per-scan"
      ? scansUsed * 100
      : 5000; // $50 flat for the bundles
  const costCents = Math.floor(scansUsed * (22 + rng() * 18));
  const lastScanOffset = -Math.floor(rng() * 10);

  return {
    id: `cust_${String(i + 1).padStart(4, "0")}`,
    displayName: `${first} ${last}`,
    email: `${first.toLowerCase()}@${domain}`,
    joinedAt: isoDay(joinedOffset),
    plan,
    scansUsed,
    scansIncluded,
    lifetimeRevenueCents: revenueCents,
    lifetimeCostCents: costCents,
    lastScanAt: scansUsed > 0 ? isoDay(lastScanOffset) : null,
    isPrivacyProtected: plan === "privacy-pro",
  };
});

// Build scans across customers.
const SAMPLE_URLS = [
  "https://example.com",
  "https://northwind.design",
  "https://fieldnotes.studio",
  "https://candescent.io",
  "https://marquee-digital.com",
  "https://atelier.studio",
  "https://rivergrove.co",
  "https://studiobright.co",
];

const SCANS: AdminScan[] = [];
for (const customer of CUSTOMERS) {
  for (let i = 0; i < customer.scansUsed; i++) {
    const daysAgo = -Math.floor(rng() * 30);
    const status: AdminScan["status"] = rng() < 0.04 ? "failed" : "complete";
    const costCents = Math.floor(22 + rng() * 18);
    const revenueCents = customer.plan === "pay-per-scan" ? 100 : 100; // attributed per-scan
    SCANS.push({
      id: `scan_${customer.id}_${i}`,
      customerId: customer.id,
      url: pick(SAMPLE_URLS),
      startedAt: isoDay(daysAgo),
      score: Math.round((3 + rng() * 6.5) * 10) / 10,
      costCents,
      revenueCents,
      status,
    });
  }
}

// ---------- Queries ----------

const applyPrivacy = (customer: AdminCustomer): AdminCustomer => {
  if (!customer.isPrivacyProtected) {
    return customer;
  }
  return {
    ...customer,
    displayName: "Private account",
    email: `•••@${customer.email.split("@")[1] ?? "hidden"}`,
  };
};

const applyScanPrivacy = (scan: AdminScan, customer: AdminCustomer): AdminScan => {
  if (!customer.isPrivacyProtected) {
    return scan;
  }
  try {
    const host = new URL(scan.url).hostname;
    const [first, ...rest] = host.split(".");
    const masked =
      first && first.length > 1
        ? `${first[0]}${"•".repeat(Math.max(1, first.length - 1))}`
        : "•••";
    return { ...scan, url: `https://${masked}${rest.length ? "." + rest.join(".") : ""}` };
  } catch {
    return { ...scan, url: "https://•••.hidden" };
  }
};

export const getAdminCustomers = (): AdminCustomer[] =>
  CUSTOMERS.map(applyPrivacy).sort(
    (a, b) => b.lifetimeRevenueCents - a.lifetimeRevenueCents,
  );

export const getAdminCustomer = (id: string): AdminCustomer | null => {
  const raw = CUSTOMERS.find((c) => c.id === id);
  return raw ? applyPrivacy(raw) : null;
};

export const getAdminScansForCustomer = (customerId: string): AdminScan[] => {
  const raw = CUSTOMERS.find((c) => c.id === customerId);
  if (!raw) {
    return [];
  }
  return SCANS.filter((s) => s.customerId === customerId)
    .map((s) => applyScanPrivacy(s, raw))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
};

export const getAdminDailySeries = (days = 30): AdminDailyPoint[] => {
  const buckets = new Map<string, AdminDailyPoint>();
  for (let offset = -(days - 1); offset <= 0; offset++) {
    const date = formatDate(isoDay(offset));
    buckets.set(date, { date, scans: 0, revenueCents: 0, costCents: 0 });
  }
  const cutoff = new Date(Date.now() - days * DAY).getTime();
  for (const scan of SCANS) {
    const ts = new Date(scan.startedAt).getTime();
    if (ts < cutoff) continue;
    const key = formatDate(scan.startedAt);
    const point = buckets.get(key);
    if (!point) continue;
    point.scans += 1;
    point.revenueCents += scan.revenueCents;
    point.costCents += scan.costCents;
  }
  return [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
};

export const getAdminSummary = (): AdminSummary => {
  const series = getAdminDailySeries(30);
  const scansLast30Days = series.reduce((sum, p) => sum + p.scans, 0);
  const revenueCentsLast30Days = series.reduce((sum, p) => sum + p.revenueCents, 0);
  const costCentsLast30Days = series.reduce((sum, p) => sum + p.costCents, 0);
  const marginCentsLast30Days = revenueCentsLast30Days - costCentsLast30Days;
  const marginPercentLast30Days =
    revenueCentsLast30Days === 0
      ? 0
      : Math.round((marginCentsLast30Days / revenueCentsLast30Days) * 1000) / 10;

  const payingCustomers = CUSTOMERS.filter((c) => c.scansUsed > 0).length;

  return {
    totalCustomers: CUSTOMERS.length,
    payingCustomers,
    scansLast30Days,
    revenueCentsLast30Days,
    costCentsLast30Days,
    marginCentsLast30Days,
    marginPercentLast30Days,
  };
};

export const formatCents = (cents: number): string => {
  const dollars = cents / 100;
  return dollars.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: dollars % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
};

export const planLabel = (plan: AdminPlan): string => {
  if (plan === "pay-per-scan") return "Pay per scan";
  if (plan === "pro-50") return "Pro 50";
  return "Privacy Pro";
};
