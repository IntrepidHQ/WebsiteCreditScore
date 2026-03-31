"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  FileText,
  MailPlus,
  Minus,
  Plus,
  ScanSearch,
  Sparkles,
} from "lucide-react";

import {
  BILLING_ADD_ONS,
  BILLING_PLANS,
  TOKEN_ACTIONS,
  formatUsd,
  resolveCheckoutSelection,
  type BillingAddOnId,
  type BillingPlanId,
} from "@/lib/billing/catalog";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

const actionIcons = {
  "scan-site": ScanSearch,
  "outreach-draft": MailPlus,
  "packet-export": FileText,
  "max-prompt": Sparkles,
} as const;

export function PublicPricingPage({
  billingPlan,
  checkoutSigninHref,
  hasCheckout,
  stripeMode,
  sessionEmail,
  startHref,
  tokenBalance,
  workspaceName,
}: {
  billingPlan: BillingPlanId | null;
  checkoutSigninHref: string;
  hasCheckout: boolean;
  stripeMode: "test" | "live" | "unknown" | null;
  sessionEmail: string | null;
  startHref: string;
  tokenBalance: number | null;
  workspaceName: string | null;
}) {
  const [selectedPlanId, setSelectedPlanId] = useState<BillingPlanId | null>(null);
  const [addOnQuantities, setAddOnQuantities] = useState<Partial<Record<BillingAddOnId, number>>>(
    {},
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selection = useMemo(
    () => resolveCheckoutSelection({ planId: selectedPlanId, addOnQuantities }),
    [addOnQuantities, selectedPlanId],
  );

  function updateAddOnQuantity(addOnId: BillingAddOnId, nextQuantity: number) {
    setAddOnQuantities((current) => ({
      ...current,
      [addOnId]: Math.max(0, nextQuantity),
    }));
  }

  function handleCheckout() {
    startTransition(async () => {
      setErrorMessage(null);

      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: selectedPlanId,
            addOnQuantities,
            email: sessionEmail,
          }),
        });

        const payload = (await response.json()) as {
          error?: string;
          url?: string;
        };

        if (!response.ok || !payload.url) {
          throw new Error(payload.error ?? "Checkout could not be created.");
        }

        window.location.href = payload.url;
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "Checkout could not be created.",
        );
      }
    });
  }

  return (
    <main className="presentation-section" id="main-content">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,1.08fr)_24rem] lg:px-8">
        <div className="space-y-8">
          <SectionHeading
            eyebrow="Pricing"
            title="Buy tokens once, then spend them where the site needs work"
            description="The free tier gives you enough balance to test the workflow. Pro adds a larger token pack, and the optional upgrades unlock deeper scoring or private delivery when you need it."
          />

          <div className="grid gap-4 xl:grid-cols-2">
            {BILLING_PLANS.map((plan) => {
              const isFree = plan.id === "free";
              const isSelected = selectedPlanId === plan.id;
              const ctaHref = workspaceName ? "/app" : startHref;

              return (
                <Card
                  className={cn(
                    "overflow-hidden border-border/60 bg-panel/55 shadow-none transition",
                    plan.recommended && "border-accent/25 bg-accent/8",
                    isSelected && !isFree && "border-accent/35 bg-accent/10",
                  )}
                  key={plan.id}
                >
                  <CardHeader className="pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant={plan.recommended ? "accent" : "neutral"}>
                          {plan.label}
                        </Badge>
                        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                          {plan.includedTokens} tokens included
                        </span>
                      </div>
                      <p className="font-display text-[clamp(2.5rem,2.1rem+0.5vw,3.2rem)] leading-none text-foreground">
                        {isFree ? "$0" : formatUsd(plan.priceCents)}
                      </p>
                    </div>
                    <CardTitle className="text-[clamp(2.55rem,2.1rem+0.65vw,3.35rem)]">
                      {isFree ? "Start free and score real sites" : "Keep the scoring habit going"}
                    </CardTitle>
                    <p className="max-w-2xl text-sm leading-7 text-muted">
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5 pt-0">
                    <div className="grid gap-3">
                      {plan.highlights.map((item) => (
                        <div
                          className="flex items-start gap-3 rounded-[16px] border border-border/60 bg-background-alt/55 px-4 py-3"
                          key={item}
                        >
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent" />
                          <p className="text-sm leading-6 text-foreground">{item}</p>
                        </div>
                      ))}
                    </div>

                    {isFree ? (
                      <Button asChild className="w-full" size="lg" variant="secondary">
                        <Link href={ctaHref}>
                          {workspaceName ? "Open workspace" : "Start free"}
                          <ArrowRight className="size-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        onClick={() =>
                          setSelectedPlanId((current) => (current === plan.id ? null : plan.id))
                        }
                        size="lg"
                        variant={isSelected ? "default" : "secondary"}
                      >
                        {isSelected ? "Remove from cart" : plan.ctaLabel}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="border-border/60 bg-panel/45 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-accent">
                <Coins className="size-4" />
                <span className="text-xs uppercase tracking-[0.18em]">Token costs</span>
              </div>
              <CardTitle className="text-[clamp(2.6rem,2.15rem+0.7vw,3.35rem)]">
                Keep the token math obvious
              </CardTitle>
              <p className="text-sm leading-7 text-muted">
                The goal is simple: spend one token when a new piece of work is created, and keep the bigger unlocks rare enough that they still feel valuable.
              </p>
            </CardHeader>
            <CardContent className="grid gap-3 pt-0 md:grid-cols-2">
              {TOKEN_ACTIONS.map((action) => {
                const Icon = actionIcons[action.id];

                return (
                  <div
                    className="rounded-[18px] border border-border/60 bg-background-alt/55 px-4 py-4"
                    key={action.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex size-10 items-center justify-center rounded-[12px] border border-accent/20 bg-accent/10 text-accent">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{action.label}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            {action.cost} token{action.cost === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">{action.detail}</p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-border/60 bg-panel/45 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-accent">
                <Sparkles className="size-4" />
                <span className="text-xs uppercase tracking-[0.18em]">Optional upgrades</span>
              </div>
              <CardTitle className="text-[clamp(2.6rem,2.15rem+0.7vw,3.35rem)]">
                Add the deeper layers only when they matter
              </CardTitle>
              <p className="text-sm leading-7 text-muted">
                Keep the base workflow lean. Reach for the extra benchmark layer, private delivery, or a bigger token pack when the opportunity is real enough to justify it.
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 pt-0">
              {BILLING_ADD_ONS.map((item) => {
                const quantity = addOnQuantities[item.id] ?? 0;
                const selected = quantity > 0;

                return (
                  <div
                    className={cn(
                      "rounded-[20px] border px-5 py-5 transition",
                      selected
                        ? "border-accent/30 bg-accent/8"
                        : "border-border/60 bg-background-alt/55",
                    )}
                    key={item.id}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={selected ? "accent" : "neutral"}>
                            {item.tokenAmount ? `+${item.tokenAmount} tokens` : "Unlock"}
                          </Badge>
                          <span className="text-sm font-semibold text-foreground">
                            {formatUsd(item.priceCents)}
                          </span>
                        </div>
                        <h3 className="font-display text-[clamp(2.15rem,1.95rem+0.35vw,2.55rem)] leading-[0.95] tracking-[-0.04em] text-foreground">
                          {item.label}
                        </h3>
                        <p className="max-w-3xl text-sm leading-7 text-muted">
                          {item.description}
                        </p>
                        <p className="text-sm leading-6 text-foreground">{item.detail}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          aria-label={`Remove ${item.label}`}
                          disabled={quantity === 0}
                          onClick={() => updateAddOnQuantity(item.id, quantity - 1)}
                          size="icon"
                          variant="outline"
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="min-w-10 text-center text-sm font-semibold text-foreground">
                          {quantity}
                        </span>
                        <Button
                          aria-label={`Add ${item.label}`}
                          onClick={() => updateAddOnQuantity(item.id, quantity + 1)}
                          size="icon"
                          variant={selected ? "secondary" : "default"}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <Card className="border-accent/20 bg-accent/8 shadow-none">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent">Cart</Badge>
                {billingPlan ? (
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Current plan: {billingPlan}
                  </span>
                ) : null}
              </div>
              <CardTitle className="text-[clamp(2.45rem,2.1rem+0.45vw,3rem)]">
                Build the balance you need
              </CardTitle>
              <p className="text-sm leading-7 text-muted">
                {workspaceName
                  ? `This purchase will attach to ${workspaceName}.`
                  : "Pricing is public. Sign in before checkout so the tokens land in the right workspace."}
              </p>
            </CardHeader>
            <CardContent className="space-y-5 pt-0">
              <div className="rounded-[18px] border border-border/60 bg-background/35 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Current balance
                  </p>
                  <p className="text-sm font-semibold text-foreground">
                    {tokenBalance ?? 0} tokens
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {selection.plan ? (
                    <div className="flex items-center justify-between gap-3 text-sm text-foreground">
                      <span>{selection.plan.label}</span>
                      <span>{formatUsd(selection.plan.priceCents)}</span>
                    </div>
                  ) : (
                    <div className="text-sm leading-6 text-muted">
                      Start free if you only need the included 10 tokens.
                    </div>
                  )}
                  {selection.addOnEntries.map((entry) => (
                    <div
                      className="flex items-center justify-between gap-3 text-sm text-foreground"
                      key={entry.item.id}
                    >
                      <span>
                        {entry.item.label}
                        {entry.quantity > 1 ? ` x${entry.quantity}` : ""}
                      </span>
                      <span>{formatUsd(entry.item.priceCents * entry.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[18px] border border-border/60 bg-panel/45 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                  Result after purchase
                </p>
                <div className="mt-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-display text-[2.6rem] leading-none text-foreground">
                      {(tokenBalance ?? 0) + selection.tokenTotal}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Tokens available once the purchase lands in the workspace.
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      Total
                    </p>
                    <p className="font-display text-[2.2rem] leading-none text-foreground">
                      {formatUsd(selection.totalCents)}
                    </p>
                  </div>
                </div>
              </div>

              {selection.entitlements.length ? (
                <div className="rounded-[18px] border border-border/60 bg-background/35 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                    Unlocks
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selection.entitlements.map((item) => (
                      <Badge key={item} variant="neutral">
                        {item === "seo-benchmark" ? "SEO benchmark" : "MAX + stealth"}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}

              {!hasCheckout ? (
                <div className="rounded-[18px] border border-danger/25 bg-danger/10 p-4 text-sm leading-6 text-foreground">
                  Stripe is not configured in this environment yet. Add `STRIPE_SECRET_KEY` to enable live checkout.
                </div>
              ) : null}
              {hasCheckout && stripeMode ? (
                <div className="rounded-[18px] border border-border/60 bg-background/35 p-4 text-sm leading-6 text-foreground">
                  Stripe mode:{" "}
                  <strong>
                    {stripeMode === "test"
                      ? "Test (no live charges)"
                      : stripeMode === "live"
                        ? "Live"
                        : "Unknown"}
                  </strong>
                </div>
              ) : null}

              {errorMessage ? (
                <div className="rounded-[18px] border border-danger/25 bg-danger/10 p-4 text-sm leading-6 text-foreground">
                  {errorMessage}
                </div>
              ) : null}

              {workspaceName ? (
                <Button
                  className="w-full"
                  disabled={!selection.totalCents || !hasCheckout || isPending}
                  onClick={handleCheckout}
                  size="lg"
                >
                  {isPending ? "Opening Stripe…" : "Checkout with Stripe"}
                  <ArrowRight className="size-4" />
                </Button>
              ) : (
                <div className="space-y-3">
                  <Button asChild className="w-full" size="lg">
                    <Link href={checkoutSigninHref}>
                      Sign in to checkout
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <p className="text-center text-xs leading-5 text-muted">
                    The pricing page stays public. Checkout attaches tokens to a workspace.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
