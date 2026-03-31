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
  | "max-stealth";
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

export const TOKEN_ACTIONS: TokenActionDefinition[] = [
  {
    id: "scan-site",
    label: "Scan a live website",
    cost: 1,
    detail: "Runs the live score and saves the audit to the workspace.",
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
    includedTokens: 10,
    description:
      "Start with enough balance to score real sites, review the breakdown, and see how the product fits your workflow.",
    highlights: [
      "10 included tokens",
      "Public scan history and workspace storage",
      "Audit, packet, and brief workflow",
    ],
    ctaLabel: "Start free",
  },
  {
    id: "pro",
    label: "Pro",
    priceCents: 4900,
    includedTokens: 100,
    description:
      "Enough balance to make scanning, outreach prep, and follow-up a repeatable habit instead of a one-off review.",
    highlights: [
      "100 included tokens",
      "Best fit for weekly scans and outreach",
      "Works with optional unlocks and token top-ups",
    ],
    ctaLabel: "Buy Pro",
    recommended: true,
  },
] as const;

export const BILLING_ADD_ONS: BillingAddOnDefinition[] = [
  {
    id: "extra-50-tokens",
    label: "50 extra tokens",
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
