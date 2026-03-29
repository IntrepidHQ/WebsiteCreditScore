import { HandCoins, TicketPercent } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyLinkButton } from "@/features/app/components/copy-link-button";
import { getWorkspaceAppContext } from "@/lib/product/context";

export default async function ReferralsPage() {
  const { repository, session, workspace } = await getWorkspaceAppContext();
  const dashboard = await repository.getDashboard(workspace.id, session);
  const referralCode = dashboard.referralCode;
  const coupon = dashboard.promos.find((promo) => promo.code === "FIFTEEN") ?? dashboard.promos[0];
  const pendingCredits = dashboard.referralEvents
    .filter((entry) => entry.status === "pending")
    .reduce((sum, entry) => sum + entry.creditAmount, 0);
  const earnedCredits = dashboard.credits.reduce((sum, entry) => sum + entry.amount, 0);
  const remainingCouponUses =
    coupon?.maxRedemptions !== undefined
      ? Math.max(0, coupon.maxRedemptions - (coupon.redemptionsUsed ?? 0))
      : null;

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
        <CardContent className="grid gap-3">
          {coupon ? (
            <div className="rounded-[10px] border border-accent/25 bg-accent/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Use this code at checkout</p>
                  <p className="mt-2 font-display text-4xl font-semibold text-accent">{coupon.code}</p>
                  <p className="mt-2 text-sm text-muted">{coupon.description}</p>
                </div>
                <div className="rounded-full border border-accent/25 bg-background/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {remainingCouponUses !== null ? `${remainingCouponUses} remaining` : `${coupon.value}% off`}
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-foreground">
                Use the code to make the first checkout feel like a deal without changing the scope or the score.
              </p>
            </div>
          ) : null}
          {dashboard.promos.map((promo) => (
            <div
              className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4"
              key={promo.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-foreground">{promo.label}</p>
                  <p className="mt-2 text-sm text-muted">{promo.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                    {promo.code}
                  </div>
                  {promo.maxRedemptions !== undefined ? (
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">
                      {Math.max(0, promo.maxRedemptions - (promo.redemptionsUsed ?? 0))} remaining
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
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
