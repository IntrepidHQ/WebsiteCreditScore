import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getWorkspaceAppContext } from "@/lib/product/context";

export default async function AppSettingsPage() {
  const { workspace } = await getWorkspaceAppContext();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.24em] text-muted">Workspace defaults</p>
          <CardTitle className="mt-2 text-4xl">Brand and delivery settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Agency</p>
              <p className="mt-2 font-semibold text-foreground">
                {workspace.branding.agencyName}
              </p>
              <p className="mt-2 text-sm text-muted">{workspace.branding.contactEmail}</p>
            </div>
            <div className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Saved theme</p>
              <p className="mt-2 font-semibold text-foreground">
                {workspace.savedTheme.mode} · {workspace.savedTheme.accentColor}
              </p>
              <p className="mt-2 text-sm text-muted">
                Font {workspace.savedTheme.fontScale.toFixed(2)} · radius {workspace.savedTheme.radius}px
              </p>
            </div>
          </div>
          <div className="rounded-[10px] border border-border/70 bg-panel/60 p-4">
            <p className="text-sm leading-7 text-muted">
              The live workspace is ready for persistent branding and theme defaults. The visual editor remains available in the dedicated theme screen while billing stays in placeholder mode until checkout is introduced.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href="/settings">Open theme editor</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/platform">View product positioning</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Billing prep</p>
            <CardTitle className="mt-2 text-3xl">Subscription placeholder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Status</p>
              <p className="mt-2 font-semibold text-foreground">{workspace.billingStatus}</p>
            </div>
            <div className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Workspace credits</p>
              <p className="mt-2 font-display text-4xl font-semibold text-accent">
                {workspace.creditBalance}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">Launch controls</p>
            <CardTitle className="mt-2 text-3xl">Keep product experiments internal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              "Coupon code FIFTEEN: 15% off, limited to 100 redemptions.",
              "Referral payout target: 5% of the checkout total on closed work.",
              "Use Lovable prompts and asset pointers here when the product needs a generated starting point.",
              "Cap the build conversation at $9,995 so pricing stays simple to sell.",
            ].map((item) => (
              <div className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4" key={item}>
                <p className="text-sm leading-6 text-muted">{item}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
