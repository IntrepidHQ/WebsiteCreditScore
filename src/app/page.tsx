import { ArrowRight, ChartColumnBig, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSampleAuditCards } from "@/lib/mock/report-builder";
import { LandingForm } from "@/features/landing/components/landing-form";
import { SampleAuditCard } from "@/features/landing/components/sample-audit-card";

const featureCards = [
  {
    step: "01",
    title: "Audit",
    description:
      "Scan a live site, score the core categories, and surface the issues that shape the pitch.",
    icon: Sparkles,
  },
  {
    step: "02",
    title: "Packet",
    description: "Turn the audit into a short outreach email and a client-ready packet you can actually send.",
    icon: ChartColumnBig,
  },
  {
    step: "03",
    title: "Brief",
    description: "Use discovery answers to lock scope, priorities, and the brief before any build work starts.",
    icon: ShieldCheck,
  },
] as const;

export default function Home() {
  const samples = getSampleAuditCards();

  return (
    <main id="main-content">
      <section className="presentation-section pb-8 pt-12 sm:pt-16">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:px-8">
          <div className="space-y-8">
            <Badge variant="accent">Craydl for designers, developers, and web product providers</Badge>
            <div className="space-y-6">
              <h1 className="font-display text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-7xl">
                Turn a live website into a{" "}
                <span className="gradient-type">sendable audit and scoped web deal.</span>
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted sm:text-xl">
                Built for agencies and website providers serving service businesses.
              </p>
            </div>
            <LandingForm />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-panel rounded-[calc(var(--theme-radius-lg))] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Client packet</p>
                <p className="mt-3 font-display text-3xl font-semibold text-foreground">
                  3 to 4 pages
                </p>
              </div>
              <div className="glass-panel rounded-[calc(var(--theme-radius-lg))] p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted">Shared process</p>
                <p className="mt-3 font-display text-3xl font-semibold text-foreground">
                  Research to approval
                </p>
              </div>
            </div>
          </div>

          <div className="glass-panel relative overflow-hidden rounded-[calc(var(--theme-radius-lg))] p-6">
            <div className="texture-grid absolute inset-0 opacity-35" />
            <div className="relative space-y-6">
              <Badge variant="neutral">Recent workspaces</Badge>
              <div className="space-y-4">
                {samples.map((sample) => (
                  <Link
                    className="flex items-center justify-between gap-4 rounded-[8px] border border-border/70 bg-background-alt/70 px-4 py-4 transition hover:border-accent/30"
                    href={`/audit/${sample.id}`}
                    key={sample.id}
                  >
                    <div>
                      <p className="font-semibold text-foreground">{sample.title}</p>
                      <p className="text-sm text-muted">{sample.summary}</p>
                    </div>
                    <ArrowRight className="size-4 shrink-0 text-accent" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Live examples"
            title="Real sites, real example reports"
            description="These sample workspaces are grounded in live websites."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {samples.map((audit) => (
              <SampleAuditCard audit={audit} key={audit.id} />
            ))}
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl space-y-5 px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {featureCards.map((card) => (
                <Card key={card.title} className="h-full">
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex size-12 items-center justify-center rounded-[8px] border border-accent/20 bg-accent/10 text-accent">
                      <card.icon className="size-5" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                      Step {card.step}
                    </span>
                  </div>
                  <CardTitle className="text-2xl">{card.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-6 text-muted">{card.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/examples">
                Browse all examples
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary">
              <Link href="/platform">
                Platform overview
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
