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
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <Badge variant="accent">Craydl for designers, developers, and web product providers</Badge>
            <div className="space-y-6">
              <h1 className="max-w-5xl font-display text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-7xl">
                Turn a live website into a{" "}
                <span className="gradient-type">sendable audit and scoped <span className="whitespace-nowrap">web deal.</span></span>
              </h1>
              <p className="max-w-3xl text-lg leading-8 text-muted sm:text-xl">
                Built for agencies and website providers serving service businesses.
              </p>
            </div>
            <div className="max-w-4xl">
              <LandingForm />
            </div>
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Recent workspaces"
            title="Real sites, real example reports"
            description="Use the sample workspaces as quick starting points."
          />
          <div aria-label="Recent workspaces" className="horizontal-rail gap-5" tabIndex={0}>
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
