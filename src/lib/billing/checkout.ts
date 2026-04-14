import type Stripe from "stripe";

import {
  formatUsd,
  resolveCheckoutSelection,
  type BillingAddOnId,
  type BillingPlanId,
} from "@/lib/billing/catalog";
import type { WorkspaceRecord } from "@/lib/types/product";

interface CheckoutRequestInput {
  planId?: BillingPlanId | null;
  addOnQuantities?: Partial<Record<BillingAddOnId, number>>;
  email?: string | null;
  origin: string;
  workspace?: WorkspaceRecord | null;
}

export function buildCheckoutSessionParams({
  planId,
  addOnQuantities,
  email,
  origin,
  workspace,
}: CheckoutRequestInput): Stripe.Checkout.SessionCreateParams {
  const selection = resolveCheckoutSelection({ planId, addOnQuantities });

  if (!selection.plan && selection.addOnEntries.length === 0) {
    throw new Error("Choose a paid plan or at least one optional upgrade.");
  }

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  if (selection.plan) {
    lineItems.push({
      quantity: 1,
      price_data: {
        currency: "usd",
        unit_amount: selection.plan.priceCents,
        product_data: {
          name: `${selection.plan.label} credit pack`,
          description: `${selection.plan.includedTokens} credits included for WebsiteCreditScore.com (balance units — not crypto)`,
        },
      },
    });
  }

  for (const entry of selection.addOnEntries) {
    lineItems.push({
      quantity: entry.quantity,
      price_data: {
        currency: "usd",
        unit_amount: entry.item.priceCents,
        product_data: {
          name: entry.item.label,
          description: entry.item.description,
        },
      },
    });
  }

  const itemSummary = [
    selection.plan
      ? `${selection.plan.label} · ${formatUsd(selection.plan.priceCents)}`
      : null,
    ...selection.addOnEntries.map(
      (entry) =>
        `${entry.item.label} x${entry.quantity} · ${formatUsd(entry.item.priceCents * entry.quantity)}`,
    ),
  ]
    .filter(Boolean)
    .join(" | ");

  return {
    mode: "payment",
    allow_promotion_codes: true,
    billing_address_collection: "auto",
    customer_email: email ?? undefined,
    client_reference_id: workspace?.id,
    line_items: lineItems,
    metadata: {
      workspaceId: workspace?.id ?? "",
      workspaceOwnerId: workspace?.ownerUserId ?? "",
      workspaceName: workspace?.name ?? "",
      workspaceOwnerEmail: workspace?.branding.contactEmail ?? "",
      billingPlan: selection.plan?.id ?? "free",
      purchasedTokens: String(selection.tokenTotal),
      entitlements: selection.entitlements.join(","),
      selectedAddOns: selection.addOnEntries
        .map((entry) => `${entry.item.id}:${entry.quantity}`)
        .join(","),
      itemSummary,
    },
    success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing?canceled=1`,
  };
}
