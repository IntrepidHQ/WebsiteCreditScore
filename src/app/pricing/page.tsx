import type { Metadata } from "next";

import { PublicPricingPage } from "@/features/pricing/components/public-pricing-page";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";
import { getStripeServerMode, hasStripeServerEnv } from "@/lib/billing/stripe";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Pricing | WebsiteCreditScore.com",
  description:
    "Choose the free tier, buy the Pro token pack, and unlock deeper scoring layers with Stripe checkout.",
};

export default async function PricingPage() {
  const session = await getOptionalWorkspaceSession();
  const repository = session ? getProductRepository(session) : null;
  const workspace = session && repository ? await repository.ensureWorkspace(session) : null;
  const checkoutSigninHref = hasSupabaseEnv()
    ? "/app/login?next=/pricing"
    : "/auth/demo?next=/pricing";
  const startHref = hasSupabaseEnv() ? "/app/login?next=/app" : "/auth/demo?next=/app";

  return (
    <PublicPricingPage
      billingPlan={workspace?.billingPlan ?? null}
      checkoutSigninHref={checkoutSigninHref}
      hasCheckout={hasStripeServerEnv()}
      stripeMode={getStripeServerMode()}
      sessionEmail={session?.email ?? null}
      startHref={startHref}
      tokenBalance={workspace?.tokenBalance ?? workspace?.creditBalance ?? null}
      workspaceName={workspace?.name ?? null}
    />
  );
}
