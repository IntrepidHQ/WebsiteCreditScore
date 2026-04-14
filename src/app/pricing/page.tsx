import type { Metadata } from "next";

// Force dynamic so cookies() isn't called during static pre-rendering
export const dynamic = "force-dynamic";

import { PublicPricingPage } from "@/features/pricing/components/public-pricing-page";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";
import { getStripeServerMode, hasStripeServerEnv } from "@/lib/billing/stripe";
import { hasSupabaseEnv } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Pricing | WebsiteCreditScore.com",
  description:
    "DIY scans with credits, optional SEO and MAX unlocks, and human help sized under typical $10K Stripe checkouts — audit + brief, AI-assisted supervision, or white-glove delivery.",
};

export default async function PricingPage() {
  const session = await getOptionalWorkspaceSession();
  const repository = session ? getProductRepository(session) : null;
  const workspace = session && repository ? await repository.ensureWorkspace(session) : null;
  const checkoutSigninHref = hasSupabaseEnv()
    ? "/app/login?next=/pricing"
    : "/auth/demo?next=/pricing";
  const startHref = hasSupabaseEnv() ? "/app/login?next=/" : "/auth/demo?next=/";

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
