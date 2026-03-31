import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Coins } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  formatUsd,
  getBillingPlan,
} from "@/lib/billing/catalog";
import {
  fulfillCheckoutSession,
  getCheckoutSessionPurchaseSummary,
} from "@/lib/billing/fulfillment";
import { getStripeServerClient, hasStripeServerEnv } from "@/lib/billing/stripe";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";

export default async function PricingSuccessPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const sessionId =
    typeof resolvedSearchParams.session_id === "string"
      ? resolvedSearchParams.session_id
      : null;

  if (!sessionId) {
    redirect("/pricing");
  }
  const session = await getOptionalWorkspaceSession();

  if (!session) {
    redirect("/app/login?next=/pricing");
  }

  if (!hasStripeServerEnv()) {
    return (
      <main className="presentation-section" id="main-content">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Stripe is not configured in this environment.</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </main>
    );
  }

  const stripe = getStripeServerClient();
  const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
  const ownerFromSession = checkoutSession.metadata?.workspaceOwnerId ?? null;

  if (ownerFromSession && ownerFromSession !== session.userId) {
    return (
      <main className="presentation-section" id="main-content">
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Checkout verified</CardTitle>
              <p className="text-sm leading-7 text-muted">
                This purchase exists, but it is attached to a different workspace.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary">
                <Link href="/pricing">Back to pricing</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }
  const purchase = getCheckoutSessionPurchaseSummary(checkoutSession);
  let appliedBalance = 0;
  let appliedWorkspaceName: string | null = null;

  if (checkoutSession.payment_status === "paid") {
    const updatedWorkspace = await fulfillCheckoutSession(checkoutSession);

    if (updatedWorkspace) {
      appliedBalance = updatedWorkspace.tokenBalance;
      appliedWorkspaceName = updatedWorkspace.name;
    }
  }

  return (
    <main className="presentation-section" id="main-content">
      <div className="mx-auto grid w-full max-w-5xl gap-6 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:px-8">
        <Card className="border-accent/25 bg-accent/8 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2 text-accent">
              <CheckCircle2 className="size-4" />
              <span className="text-xs uppercase tracking-[0.18em]">Payment complete</span>
            </div>
            <CardTitle className="text-[clamp(3rem,2.45rem+0.8vw,4rem)]">
              The balance is ready for more scoring
            </CardTitle>
            <p className="text-sm leading-7 text-muted">
              Stripe confirmed the payment. The tokens and unlocks were applied from the Checkout Session, so the balance does not depend on the browser reaching this page.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 pt-0 md:grid-cols-2">
            <div className="rounded-[18px] border border-border/60 bg-background/35 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                Purchase total
              </p>
              <p className="mt-2 font-display text-[2.6rem] leading-none text-foreground">
                {formatUsd(checkoutSession.amount_total ?? 0)}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="accent">{getBillingPlan(purchase.planId).label}</Badge>
                {purchase.addOnLabels.map((label) => (
                  <Badge key={label} variant="neutral">
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="rounded-[18px] border border-border/60 bg-panel/45 p-4">
              <div className="flex items-center gap-2 text-accent">
                <Coins className="size-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Tokens added
                </p>
              </div>
              <p className="mt-2 font-display text-[2.6rem] leading-none text-foreground">
                +{purchase.purchasedTokens}
              </p>
              <p className="mt-3 text-sm leading-6 text-muted">
                {appliedWorkspaceName
                  ? `${appliedWorkspaceName} now has ${appliedBalance} tokens available.`
                  : "The purchase has been recorded. If the balance is still missing, double-check that the Checkout Session has workspace metadata and webhook delivery configured."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-[clamp(2.2rem,1.95rem+0.35vw,2.7rem)]">
              Next step
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            <Button asChild className="w-full">
              <Link href="/app">
                Open workspace
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild className="w-full" variant="secondary">
              <Link href="/pricing">Back to pricing</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
