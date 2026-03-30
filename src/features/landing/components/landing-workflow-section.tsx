import {
  ArrowRight,
  Eye,
  KeyRound,
  Pointer,
  ScanSearch,
  Search,
  ShieldCheck,
  Smartphone,
  SwatchBook,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getScoreMethodologyNotes } from "@/lib/utils/scores";
import { cn } from "@/lib/utils/cn";

const scorePillars = [
  {
    title: "Visual Design",
    description:
      "Hierarchy, spacing, and first-impression confidence. Does the site look intentional or assembled?",
    icon: SwatchBook,
  },
  {
    title: "UX / Conversion",
    description:
      "Page flow, CTA clarity, and friction. Where does the journey support action and where does it leak intent?",
    icon: Pointer,
  },
  {
    title: "Mobile Experience",
    description:
      "Most first visits are small-screen. We check whether the message still holds together where trust usually drops fastest.",
    icon: Smartphone,
  },
  {
    title: "SEO Readiness",
    description:
      "Search visibility depends on structure, metadata, and depth, not just a headline that sounds good.",
    icon: Search,
  },
  {
    title: "Trust / Credibility",
    description:
      "Proof, process, and reassurance shape whether higher-value decisions feel safe enough to make.",
    icon: ShieldCheck,
  },
  {
    title: "Accessibility",
    description:
      "Contrast, usable controls, readable structure, and fewer avoidable dead ends for every visitor.",
    icon: Eye,
  },
  {
    title: "Security Posture",
    description:
      "Observable hardening signals and the basic competence cues that keep avoidable risk from showing through.",
    icon: KeyRound,
  },
] as const;

const methodologyNotes = getScoreMethodologyNotes();

const pillarSpans = [
  "md:col-span-7",
  "md:col-span-5",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-4",
  "md:col-span-6",
  "md:col-span-6",
] as const;

export function LandingWorkflowSection() {
  return (
    <section className="presentation-section py-8" id="workflow">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="space-y-6">
            <Badge className="tracking-[0.16em]" variant="accent">
              What The Score Sees
            </Badge>
            <div className="space-y-4">
              <h2 className="max-w-4xl font-display text-[clamp(4rem,3.25rem+1.7vw,6rem)] font-semibold leading-[0.9] tracking-[-0.055em] text-foreground">
                The audit looks at the parts that actually change whether a redesign gets approved.
              </h2>
              <p className="max-w-2xl text-[1.08rem] leading-8 text-muted sm:text-[1.14rem] sm:leading-9">
                It is not a decorative score. It is a way to turn design quality, trust,
                and conversion friction into a conversation that feels concrete enough to
                price and prioritize.
              </p>
            </div>

            <div className="grid gap-3">
              {methodologyNotes.map((note, index) => (
                <div
                  className="rounded-[22px] border border-border/65 bg-panel/55 px-5 py-4"
                  key={note}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                    0{index + 1}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground">{note}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild className="w-full sm:w-auto" variant="secondary">
                <Link href="/app/benchmarks">
                  Open benchmarks
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild className="w-full sm:w-auto" variant="ghost">
                <Link href="/docs">
                  Read the docs
                  <ScanSearch className="size-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-12">
            {scorePillars.map((card, index) => (
              <Card
                className={cn(
                  "h-full overflow-hidden rounded-[26px] border-border/65 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_90%,transparent),color-mix(in_srgb,var(--theme-background-alt)_88%,transparent))]",
                  pillarSpans[index],
                )}
                key={card.title}
              >
                <CardHeader className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="inline-flex size-12 items-center justify-center rounded-[14px] border border-accent/20 bg-accent/10 text-accent">
                      <card.icon className="size-5" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
                      Signal {index + 1}
                    </span>
                  </div>
                  <CardTitle className="text-[clamp(2.35rem,2rem+0.7vw,3.2rem)]">
                    {card.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-7 text-muted sm:text-[0.98rem]">
                    {card.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
