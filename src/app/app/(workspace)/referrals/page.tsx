import { HandCoins, TicketPercent } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyLinkButton } from "@/features/app/components/copy-link-button";
import { getWorkspaceAppContext } from "@/lib/product/context";

function PromoCard({
  promo,
  featured = false,
}: {
  promo: {
    code: string;
    label: string;
    description: string;
    type: "percentage" | "fixed" | "workspace-credit";
    value: number;
    maxRedemptions?: number;
    redemptionsUsed?: number;
  };
  featured?: boolean;
}) {
  const remaining =
    promo.maxRedemptions !== undefined
      ? Math.max(0, promo.maxRedemptions - (promo.redemptionsUsed ?? 0))
      : null;

  return (
    <div className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-muted">Use at checkout</p>
          <p className="mt-2 font-display text-3xl font-semibold text-accent">{promo.code}</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{promo.label}</p>
          <p className="mt-1 text-sm text-muted">{promo.description}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <Badge variant={featured ? "accent" : "neutral"}>
            {promo.type === "percentage"
              ? `${promo.value}% off`
              : promo.type === "fixed"
                ? `$${promo.value} fee`
                : promo.label}
          </Badge>
          {remaining !== null ? (
            <p className="text-xs uppercase tracking-[0.16em] text-muted">
              {remaining} remaining
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default async function ReferralsPage() {
  const { repository, session, workspace } = await getWorkspaceAppContext();
  const dashboard = await repository.getDashboard(workspace.id, session);
  const referralCode = dashboard.referralCode;
  const pendingCredits = dashboard.referralEvents
    .filter((entry) => entry.status === "pending")
    .reduce((sum, entry) => sum + entry.creditAmount, 0);
  const earnedCredits = dashboard.credits.reduce((sum, entry) => sum + entry.amount, 0);
  const featuredPromoCodes = ["FIFTEEN", "RUSH24"] as const;
  const featuredPromos = featuredPromoCodes
    .map((code) => dashboard.promos.find((promo) => promo.code === code))
    .filter((promo): promo is (typeof dashboard.promos)[number] => Boolean(promo));
  const secondaryPromos = dashboard.promos.filter(
    (promo) => !featuredPromoCodes.includes(promo.code as (typeof featuredPromoCodes)[number]),
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-accent">
            <HandCoins className="size-4" />
            Referral program
          </div>
          <CardTitle className="text-4xl">Workspace credits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {referralCode ? (
            <>
              <div className="rounded-[10px] border border-accent/25 bg-accent/10 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Your code</p>
                <p className="mt-2 font-display text-4xl font-semibold text-accent">
                  {referralCode.code}
                </p>
                <p className="mt-2 text-sm text-muted">{referralCode.rewardLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyLinkButton label="Copy share URL" value={referralCode.shareUrl} />
                <CopyLinkButton label="Copy code" value={referralCode.code} variant="outline" />
              </div>
            </>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Pending credits</p>
              <p className="mt-2 font-display text-4xl font-semibold text-foreground">
                {pendingCredits}
              </p>
            </div>
            <div className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Earned credits</p>
              <p className="mt-2 font-display text-4xl font-semibold text-foreground">
                {earnedCredits}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-accent">
            <TicketPercent className="size-4" />
            Product promotions
          </div>
          <CardTitle className="text-4xl">Founding offers</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 md:grid-cols-2">
            {featuredPromos.map((promo) => (
              <PromoCard featured={promo.code === "FIFTEEN"} key={promo.id} promo={promo} />
            ))}
          </div>
          {secondaryPromos.length ? (
            <div className="grid gap-3">
              {secondaryPromos.map((promo) => (
                <PromoCard key={promo.id} promo={promo} />
              ))}
            </div>
          ) : null}
          {dashboard.referralEvents.map((event) => (
            <div
              className="rounded-[10px] border border-border/70 bg-panel/60 p-4"
              key={event.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{event.inviteeEmail}</p>
                  <p className="mt-2 text-sm text-muted">
                    {event.status} · {event.creditAmount} credits
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted">
                  {new Date(event.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
