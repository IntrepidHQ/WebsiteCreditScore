import type Stripe from "stripe";

import { BILLING_ADD_ONS, getBillingPlan } from "@/lib/billing/catalog";
import { applyLocalBillingPurchase } from "@/lib/product/local-store";
import { applySupabaseBillingPurchase } from "@/lib/product/supabase-store";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type {
  BillingPlan,
  WorkspaceEntitlement,
  WorkspaceRecord,
} from "@/lib/types/product";

function parseSessionEntitlements(
  rawEntitlements: string | undefined,
): WorkspaceEntitlement[] {
  return (rawEntitlements ?? "")
    .split(",")
    .filter(Boolean)
    .filter((entry): entry is WorkspaceEntitlement =>
      entry === "seo-benchmark" || entry === "max-stealth",
    );
}

function parseSessionAddOnIds(rawAddOns: string | undefined) {
  return (rawAddOns ?? "")
    .split(",")
    .map((entry) => entry.split(":")[0])
    .filter(Boolean)
    .filter((entry): entry is (typeof BILLING_ADD_ONS)[number]["id"] =>
      BILLING_ADD_ONS.some((item) => item.id === entry),
    );
}

export function getCheckoutSessionPurchaseSummary(session: Stripe.Checkout.Session) {
  const planId: BillingPlan =
    session.metadata?.billingPlan === "pro" ? "pro" : "free";
  const addOnIds = parseSessionAddOnIds(session.metadata?.selectedAddOns);

  return {
    addOnIds,
    addOnLabels: BILLING_ADD_ONS.filter((item) => addOnIds.includes(item.id)).map(
      (item) => item.label,
    ),
    entitlements: parseSessionEntitlements(session.metadata?.entitlements),
    label:
      session.metadata?.itemSummary || `${getBillingPlan(planId).label} purchase`,
    planId,
    purchasedTokens: Number(session.metadata?.purchasedTokens ?? "0"),
    workspaceId: session.metadata?.workspaceId ?? "",
    workspaceOwnerId: session.metadata?.workspaceOwnerId ?? "demo-owner",
  };
}

export async function fulfillCheckoutSession(
  session: Stripe.Checkout.Session,
): Promise<WorkspaceRecord | null> {
  if (session.payment_status !== "paid") {
    return null;
  }

  const purchase = getCheckoutSessionPurchaseSummary(session);

  if (!purchase.workspaceId) {
    return null;
  }

  if (hasSupabaseEnv()) {
    return applySupabaseBillingPurchase(purchase.workspaceId, {
      checkoutSessionId: session.id,
      label: purchase.label,
      tokenAmount: purchase.purchasedTokens,
      planId: purchase.planId,
      addOnIds: purchase.addOnIds,
      entitlements: purchase.entitlements,
    });
  }

  return applyLocalBillingPurchase(purchase.workspaceId, purchase.workspaceOwnerId, {
    checkoutSessionId: session.id,
    label: purchase.label,
    tokenAmount: purchase.purchasedTokens,
    planId: purchase.planId,
    addOnIds: purchase.addOnIds,
    entitlements: purchase.entitlements,
  });
}
