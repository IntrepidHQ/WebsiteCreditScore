import Link from "next/link";
import {
  ArrowRight,
  ChartColumnBig,
  ClipboardList,
  Clock3,
  FileText,
  ScanSearch,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { LandingForm } from "@/features/landing/components/landing-form";

const heroMetrics = [
  {
    label: "Outputs",
    value: "3",
    note: "Audit, packet, and brief from one public URL.",
  },
  {
    label: "Benchmarking",
    value: "7",
    note: "Weighted scoring categories keep the review grounded.",
  },
  {
    label: "Rush option",
    value: "24h",
    note: "For pitches that need to move before the week is gone.",
  },
] as const;

const outputCards = [
  {
    label: "Audit",
    title: "Score the site like a design review, not a vibe check.",
    description:
      "Surface visual, conversion, mobile, search, trust, accessibility, and security gaps with a score that holds up in a client conversation.",
    icon: ScanSearch,
    bullets: ["Weighted categories", "Named findings", "Benchmark context"],
  },
  {
    label: "Packet",
    title: "Turn weak spots into a sendable case for the redesign.",
    description:
      "Package the story into a tighter outreach email and a client-ready packet so the recommendation already feels considered before the call.",
    icon: ChartColumnBig,
    bullets: ["Pitch narrative", "Packet PDF", "Scope momentum"],
  },
  {
    label: "Brief",
    title: "Lock the project shape before the build work starts drifting.",
    description:
      "Use the discovery brief to turn audit energy into scope, priorities, and a sharper next-step conversation with less backtracking.",
    icon: ClipboardList,
    bullets: ["Discovery prompts", "Priority framing", "Cleaner handoff"],
  },
] as const;

const proofPillars = [
  "Benchmark-backed scoring instead of loose critique.",
  "Built for agencies selling higher-value redesign work.",
  "One clean path from first scan to scoped proposal.",
] as const;

export function LandingHeroSection() {
  return (
    <section className="presentation-section pb-8 pt-10 sm:pt-14" id="generate">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[36rem]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--theme-glow)_18%,transparent),transparent_38%)]" />
        <div className="signal-grid absolute inset-x-0 top-16 h-[28rem] opacity-25" />
      </div>
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="editorial-shell relative overflow-hidden rounded-[32px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[36rem] bg-[radial-gradient(circle_at_center,color-mix(in_srgb,var(--theme-glow)_14%,transparent),transparent_66%)] xl:block" />
          <div className="relative grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
            <div className="space-y-8">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
                <div className="space-y-6">
                  <Badge className="tracking-[0.16em]" variant="accent">
                    Website Audits, Reviews, and Redesigns
                  </Badge>
                  <div className="space-y-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-muted">
                      For agencies that need a stronger redesign pitch
                    </p>
                    <h1 className="max-w-5xl font-display text-[clamp(4.4rem,3.5rem+2.25vw,7.2rem)] font-semibold leading-[0.9] tracking-[-0.06em] text-foreground">
                      Turn any prospect website into a case for higher-value work.
                    </h1>
                    <p className="max-w-3xl text-lg leading-8 text-muted sm:text-[1.25rem] sm:leading-9">
                      Score the live site, package the opportunity, and move into a
                      clearer proposal before the momentum cools off.
                    </p>
                  </div>
                </div>
                <div className="rounded-[24px] border border-border/65 bg-background/35 p-4 sm:p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                    From one URL
                  </p>
                  <div className="mt-4 space-y-4">
                    {heroMetrics.map((metric) => (
                      <div
                        className="border-t border-border/55 pt-4 first:border-t-0 first:pt-0"
                        key={metric.label}
                      >
                        <div className="flex items-end justify-between gap-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted">
                            {metric.label}
                          </p>
                          <p className="font-display text-[2.3rem] leading-none tracking-[-0.05em] text-foreground">
                            {metric.value}
                          </p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-muted">{metric.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
                <div className="glass-panel rounded-[28px] p-5 sm:p-6">
                  <LandingForm />
                </div>
                <div className="grid gap-4">
                  <div className="rounded-[24px] border border-accent/25 bg-accent/10 p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-accent">
                      Launch window
                    </p>
                    <p className="mt-3 font-display text-[2.4rem] leading-none tracking-[-0.05em] text-foreground">
                      FIFTEEN
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Use the code for 15% off. Limited to the first 100 redemptions.
                    </p>
                  </div>
                  <div className="rounded-[24px] border border-border/65 bg-background/35 p-5">
                    <div className="flex items-center gap-2 text-accent">
                      <Clock3 className="size-4" />
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em]">
                        Rush turnaround
                      </p>
                    </div>
                    <p className="mt-3 text-lg font-semibold tracking-[-0.03em] text-foreground">
                      24-hour delivery available
                    </p>
                    <p className="mt-2 text-sm leading-6 text-muted">$250 additional fee.</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {proofPillars.map((pillar) => (
                  <div
                    className="rounded-[20px] border border-border/60 bg-background/24 px-4 py-4 text-sm leading-6 text-foreground"
                    key={pillar}
                  >
                    {pillar}
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="pointer-events-none absolute inset-x-3 top-10 bottom-8 rounded-[30px] bg-accent/8 blur-3xl" />
              <div className="relative grid gap-4 pt-2 lg:pt-8">
                {outputCards.map((card, index) => (
                  <article
                    className={cn(
                      "luxury-panel relative overflow-hidden rounded-[28px] p-5 sm:p-6",
                      index === 1 && "lg:ml-12",
                      index === 2 && "lg:mr-10",
                    )}
                    key={card.label}
                  >
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,color-mix(in_srgb,var(--theme-accent)_55%,transparent),transparent)]" />
                    <div className="flex items-start justify-between gap-4">
                      <div className="inline-flex size-12 items-center justify-center rounded-[14px] border border-accent/18 bg-accent/10 text-accent">
                        <card.icon className="size-5" />
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                        0{index + 1} / {card.label}
                      </p>
                    </div>
                    <h2 className="mt-7 max-w-sm font-display text-[clamp(2.7rem,2.2rem+1vw,4rem)] leading-[0.92] tracking-[-0.055em] text-foreground">
                      {card.title}
                    </h2>
                    <p className="mt-3 max-w-lg text-sm leading-7 text-muted sm:text-[1rem]">
                      {card.description}
                    </p>
                    <ul className="mt-5 grid gap-2 text-sm text-foreground/90">
                      {card.bullets.map((bullet) => (
                        <li className="flex items-center gap-2" key={bullet}>
                          <span className="size-1.5 rounded-full bg-accent" />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </div>
          </div>
          <div className="relative mt-8 border-t border-border/60 pt-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <p className="max-w-2xl text-sm leading-7 text-muted">
                Instead of opening with “your site could be better,” open with evidence,
                direction, and a concrete next step.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="sm" variant="secondary">
                  <Link href="/platform">
                    Platform overview
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link href="/examples">
                    Browse examples
                    <FileText className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
