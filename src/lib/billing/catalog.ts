import type { BillingPlan, WorkspaceEntitlement } from "@/lib/types/product";

export type TokenActionId =
  | "scan-site"
  | "outreach-draft"
  | "packet-export"
  | "max-prompt";

export type BillingPlanId = BillingPlan;
export type BillingAddOnId =
  | "extra-50-tokens"
  | "seo-benchmark"
  | "max-stealth"
  | "scan-1x"
  | "pro-50-bundle"
  | "privacy-pro-50";
export type BillingItemId = BillingPlanId | BillingAddOnId;

export interface TokenActionDefinition {
  id: TokenActionId;
  label: string;
  cost: number;
  detail: string;
}

export interface BillingPlanDefinition {
  id: BillingPlanId;
  label: string;
  priceCents: number;
  includedTokens: number;
  description: string;
  highlights: string[];
  ctaLabel: string;
  recommended?: boolean;
}

export interface BillingAddOnDefinition {
  id: BillingAddOnId;
  label: string;
  priceCents: number;
  description: string;
  detail: string;
  tokenAmount?: number;
  entitlements?: WorkspaceEntitlement[];
}

/** DIY free-account monthly balance — credits are workspace balance units (not crypto). */
export const FREE_TIER_CREDITS = 5;

/** Paid pack: $49 → 50 credits (1 credit ≈ 1 live scan in typical use). */
export const PRO_PACK_CREDITS = 50;

/** Credits issued to each side when a referral is marked converted (policy hook for fulfillment). */
export const REFERRAL_CONVERSION_CREDITS = 10;

export const TOKEN_ACTIONS: TokenActionDefinition[] = [
  {
    id: "scan-site",
    label: "Scan a live website",
    cost: 1,
    detail: "Spends one credit to run the live score and save the audit to your workspace.",
  },
  {
    id: "outreach-draft",
    label: "Generate an outreach draft",
    cost: 1,
    detail: "Turns the score into a sendable first-touch email.",
  },
  {
    id: "packet-export",
    label: "Export the packet",
    cost: 1,
    detail: "Builds the shorter client-facing packet and PDF.",
  },
  {
    id: "max-prompt",
    label: "Unlock a MAX prompt",
    cost: 2,
    detail: "Generates the build prompt and covers stealth-mode scans.",
  },
] as const;

export const BILLING_PLANS: BillingPlanDefinition[] = [
  {
    id: "free",
    label: "Free",
    priceCents: 0,
    includedTokens: FREE_TIER_CREDITS,
    description:
      "Enough credits to try the DIY loop: scan, read the report, unlock the free MAX-style prompt path, then decide when Ask a Pro is worth it.",
    highlights: [
      `${FREE_TIER_CREDITS} starter credits (≈ ${FREE_TIER_CREDITS} live scans)`,
      "Report, benchmarks, and workspace storage",
      "Credits are a balance meter — not cryptocurrency",
    ],
    ctaLabel: "Start free",
  },
  {
    id: "pro",
    label: "Pro",
    priceCents: 4900,
    includedTokens: PRO_PACK_CREDITS,
    description:
      "Buy a simple credit pack when you are ready to scan a portfolio of sites or keep weekly audits on rhythm.",
    highlights: [
      `${PRO_PACK_CREDITS} credits for $49 (≈ ${PRO_PACK_CREDITS} scans)`,
      "Same unlocks — optional add-ons still apply",
      "Usage is tied to your signed-in workspace to reduce abuse",
    ],
    ctaLabel: "Buy credits",
    recommended: true,
  },
] as const;

export const BILLING_ADD_ONS: BillingAddOnDefinition[] = [
  {
    id: "extra-50-tokens",
    label: "50 extra credits",
    priceCents: 1900,
    description: "Top up the balance when you need more scans and exports.",
    detail: "Best when the free or Pro balance is running low.",
    tokenAmount: 50,
  },
  {
    id: "seo-benchmark",
    label: "SEO benchmark unlock",
    priceCents: 2000,
    description: "Adds keyword-readiness and AI-search scoring to the workspace.",
    detail: "Unlocks the deeper benchmark layer for the current workspace.",
    entitlements: ["seo-benchmark"],
  },
  {
    id: "max-stealth",
    label: "MAX + stealth mode",
    priceCents: 2900,
    description: "Unlock the build prompt flow and keep sensitive scans out of the public feed.",
    detail: "Best when you want private work and a cleaner handoff to AI builders.",
    entitlements: ["max-stealth"],
  },
  {
    id: "scan-1x",
    label: "Single scan ($1)",
    priceCents: 100,
    description: "Pay as you go — one live audit, saved to your workspace.",
    detail: "Best for trying the full report workflow on a single URL.",
    tokenAmount: 1,
  },
  {
    id: "pro-50-bundle",
    label: "Pro 50 bundle ($50)",
    priceCents: 5000,
    description: "50 live scans for $50. Credits never expire while the workspace is active.",
    detail: "Best for weekly audits across a portfolio of client sites.",
    tokenAmount: 50,
  },
  {
    id: "privacy-pro-50",
    label: "Privacy Pro 50 bundle ($50)",
    priceCents: 5000,
    description:
      "50 scans with full redaction on all admin surfaces — name, email, and scanned URLs are masked.",
    detail: "Same capacity as Pro 50, with added privacy guarantees for sensitive client work.",
    tokenAmount: 50,
    entitlements: ["privacy-pro"],
  },
] as const;

export function getBillingPlan(planId: BillingPlanId) {
  return BILLING_PLANS.find((plan) => plan.id === planId) ?? BILLING_PLANS[0];
}

export function getBillingAddOn(addOnId: BillingAddOnId) {
  return BILLING_ADD_ONS.find((item) => item.id === addOnId) ?? null;
}

export function getTokenActionCost(actionId: TokenActionId) {
  return TOKEN_ACTIONS.find((action) => action.id === actionId)?.cost ?? 0;
}

export function formatUsd(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function resolveCheckoutSelection(input: {
  planId?: BillingPlanId | null;
  addOnQuantities?: Partial<Record<BillingAddOnId, number>>;
}) {
  const plan = input.planId && input.planId !== "free" ? getBillingPlan(input.planId) : null;
  const addOnEntries = BILLING_ADD_ONS.map((item) => ({
    item,
    quantity: Math.max(0, Math.floor(input.addOnQuantities?.[item.id] ?? 0)),
  })).filter((entry) => entry.quantity > 0);
  const totalCents =
    (plan?.priceCents ?? 0) +
    addOnEntries.reduce((sum, entry) => sum + entry.item.priceCents * entry.quantity, 0);
  const tokenTotal =
    (plan?.includedTokens ?? 0) +
    addOnEntries.reduce((sum, entry) => sum + (entry.item.tokenAmount ?? 0) * entry.quantity, 0);
  const entitlements = Array.from(
    new Set(
      addOnEntries.flatMap((entry) => entry.item.entitlements ?? []),
    ),
  ) satisfies WorkspaceEntitlement[];

  return {
    plan,
    addOnEntries,
    totalCents,
    tokenTotal,
    entitlements,
  };
}
