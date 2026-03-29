"use client";

import Link from "next/link";
import { ArrowUpRight, BadgeDollarSign, Lock, SearchCheck } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditReport } from "@/lib/types/audit";
import type { WorkspaceRecord } from "@/lib/types/product";
import {
  buildSeoScoreCards,
  getSeoUnlockBenefits,
} from "@/lib/seo/scoring";

export function SeoProductPage({
  workspace,
  report,
}: {
  workspace: WorkspaceRecord;
  report: AuditReport | null;
}) {
  const accessGranted = workspace.billingStatus === "active";
  const seoCards = report ? buildSeoScoreCards(report) : [];
  const unlockBenefits = getSeoUnlockBenefits();

  return (
    <div className="grid gap-8">
      <SectionHeading
        eyebrow="SEO add-on"
        title="Keyword ranking and AI searchability"
        description="This is the second benchmark layer. Design tells you whether a site feels premium; SEO tells you whether search engines and AI can understand the business clearly enough to surface it."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <SearchCheck className="size-4" />
              <span className="text-xs uppercase tracking-[0.18em]">SEO benchmark product</span>
            </div>
            <CardTitle className="text-3xl">
              {accessGranted ? "Full SEO scoring is unlocked" : "Unlock the SEO add-on for $20"}
            </CardTitle>
            <p className="text-sm leading-6 text-muted">
              The paid layer adds keyword ranking analysis, AI searchability scoring, and the next-step guidance that turns audit findings into search work.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {accessGranted ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[10px] border border-border/70 bg-background-alt/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Current report</p>
                  <p className="mt-2 text-base font-semibold text-foreground">
                    {report?.title ?? "No saved report yet"}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    The latest saved audit feeds the SEO product so the score is tied to the same live workspace data.
                  </p>
                </div>
                <div className="rounded-[10px] border border-border/70 bg-background-alt/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Billing status</p>
                  <p className="mt-2 text-base font-semibold text-foreground">{workspace.billingStatus}</p>
                  <p className="mt-2 text-sm leading-6 text-muted">
                    Paid access unlocks the full SEO benchmark set for the workspace.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-[12px] border border-border/70 bg-background-alt/60 p-5">
                <div className="flex items-center gap-2 text-accent">
                  <Lock className="size-4" />
                  <p className="text-xs uppercase tracking-[0.18em]">Locked preview</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  The SEO product stays behind a paid gate until checkout is added. The design layer stays open so prospects can see the quality of the feedback before they upgrade.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="neutral">$20 access</Badge>
                  <Badge variant="accent">Sign-in gated</Badge>
                  <Badge variant="neutral">Full product unlock</Badge>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary">
                <Link href="/app/benchmarks">
                  Back to benchmarks
                </Link>
              </Button>
              <Button asChild>
                <Link href="/app/settings">
                  <BadgeDollarSign className="size-4" />
                  Manage access
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <ArrowUpRight className="size-4" />
              <span className="text-xs uppercase tracking-[0.18em]">What unlocks</span>
            </div>
            <CardTitle className="text-2xl">The paid SEO layer adds deeper scoring and lift notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {unlockBenefits.map((benefit) => (
              <div
                className="rounded-[10px] border border-border/70 bg-background-alt/70 p-4"
                key={benefit}
              >
                <p className="text-sm leading-6 text-foreground">{benefit}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {accessGranted && report ? (
        <div className="grid gap-5 lg:grid-cols-2">
          {seoCards.map((card) => (
            <Card key={card.id}>
              <CardHeader className="space-y-3">
                <Badge className="w-fit" variant="accent">
                  {card.label}
                </Badge>
                <CardTitle className="text-3xl">{card.score.toFixed(1)}</CardTitle>
                <p className="text-sm leading-6 text-muted">{card.summary}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2">
                  {card.signals.map((signal) => (
                    <div
                      className="rounded-[10px] border border-border/70 bg-panel/55 px-4 py-3 text-sm leading-6 text-foreground"
                      key={signal}
                    >
                      {signal}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}
    </div>
  );
}
