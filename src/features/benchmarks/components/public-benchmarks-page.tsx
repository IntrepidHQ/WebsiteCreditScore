import Link from "next/link";
import { ArrowRight, Compass, LineChart, Scale, ShieldCheck } from "lucide-react";

import { PreviewImage } from "@/components/common/preview-image";
import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import { ScoreDial } from "@/components/common/score-dial";
import { ScoreRadar } from "@/components/common/score-radar";
import { SectionHeading } from "@/components/common/section-heading";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type {
  AuditCategoryScore,
  BenchmarkReference,
  BenchmarkRubric,
  DesignPatternNote,
} from "@/lib/types/audit";

const comparisonRows = [
  {
    range: "4.0 - 5.9",
    label: "Credible but leaking value",
    description: "The site has something real to sell, but hierarchy, proof, and pace are still working against the ask.",
  },
  {
    range: "6.0 - 7.9",
    label: "Good bones",
    description: "The fundamentals are present, but the story still needs sharper sequencing before it feels premium.",
  },
  {
    range: "8.0 - 8.7",
    label: "Strong foundation",
    description: "The site reads clearly and builds trust, but it is not yet operating like a benchmark example.",
  },
  {
    range: "8.8+",
    label: "Benchmark-ready",
    description: "The page makes the offer obvious, proves competence early, and keeps the next step clean under pressure.",
  },
] as const;

const faqItems = [
  {
    question: "What makes this different from a generic website score?",
    answer:
      "The score is weighted toward the parts that actually change whether a redesign gets approved: hierarchy, trust, pacing, proof, and the distance to action. Weaknesses count against the total faster than surface polish helps it.",
  },
  {
    question: "Why expose benchmarks publicly?",
    answer:
      "Prospects need to understand the standard before they can believe the critique. Public methodology makes the score feel like a system, not a black box.",
  },
  {
    question: "Does a 9 mean the site is perfect?",
    answer:
      "No. It means the site performs like a strong benchmark example for its category. A 10 is intentionally rare.",
  },
  {
    question: "How should an agency use this page?",
    answer:
      "Use it to frame the score before the audit review, then open a live example or sample audit to show exactly how the benchmark thinking becomes a scoped redesign conversation.",
  },
] as const;

export function PublicBenchmarksPage({
  verticals,
  featuredAudit,
  featuredAuditBreakdown,
  targetBreakdown,
  featuredNotes,
  featuredExamples,
}: {
  verticals: Array<{
    id: string;
    label: string;
    rubric: BenchmarkRubric;
  }>;
  featuredAudit: {
    title: string;
    summary: string;
    score: number;
    href: string;
  };
  featuredAuditBreakdown: AuditCategoryScore[];
  targetBreakdown: AuditCategoryScore[];
  featuredNotes: DesignPatternNote[];
  featuredExamples: BenchmarkReference[];
}) {
  return (
    <main className="presentation-section pt-10 sm:pt-14" id="main-content">
      <section className="pb-8">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(22rem,0.75fr)] xl:px-8">
          <div className="space-y-6">
            <Badge variant="accent">Public benchmarks</Badge>
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                The scoring method, not a protected dead-end
              </p>
              <h1 className="max-w-5xl font-display text-[clamp(4.1rem,3.2rem+2vw,6.7rem)] leading-[0.9] tracking-[-0.06em] text-foreground">
                Benchmark the page like a design system with rules, not a mood board with opinions.
              </h1>
              <p className="max-w-3xl text-[1.08rem] leading-8 text-muted sm:text-[1.18rem] sm:leading-9">
                WebsiteCreditScore.com weights message clarity, trust, pacing, mobile
                polish, search structure, accessibility, and visible competence into one
                score the client can understand immediately.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/audit/mark-deford-md">
                  Open sample audit
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/examples">
                  Browse live examples
                  <Compass className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[20px] border border-border/60 bg-panel/45 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Weighted model
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  UX / Conversion and Trust / Credibility carry more weight than decorative polish.
                </p>
              </div>
              <div className="rounded-[20px] border border-border/60 bg-panel/45 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Weakness penalty
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  One broken trust or CTA sequence pulls the score down faster than style can hide it.
                </p>
              </div>
              <div className="rounded-[20px] border border-border/60 bg-panel/45 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                  Benchmark threshold
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  8.8 and above is where the page starts to read like a benchmark example.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <ScoreDial bandLabel="Benchmark-ready" label="Benchmark threshold" score={8.9} />
            <div className="rounded-[24px] border border-border/60 bg-panel/45 p-5">
              <div className="flex items-center gap-2 text-accent">
                <Scale className="size-4" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                  What the score is really measuring
                </p>
              </div>
              <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
                <p>
                  A premium page makes the promise obvious before the visitor has to work.
                </p>
                <p>
                  It earns trust before the ask, then keeps the next step close enough to feel safe.
                </p>
                <p>
                  The benchmark layer exists so those judgments can be named, weighted, and reused.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 xl:px-8">
          <SectionHeading
            description="Different verticals need different proof, but the benchmark logic stays consistent: promise, reassurance, pace, and action."
            eyebrow="10/10 rubrics"
            title="Rules of thumb the client can actually follow"
          />
          <div className="grid gap-5 xl:grid-cols-3">
            {verticals.map((vertical) => (
              <Card className="h-full rounded-[24px] border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))]" key={vertical.id}>
                <CardHeader className="space-y-4">
                  <Badge variant="accent">{vertical.label}</Badge>
                  <CardTitle className="text-[clamp(2.5rem,2rem+0.7vw,3.5rem)]">
                    {vertical.rubric.title}
                  </CardTitle>
                  <p className="text-base leading-7 text-muted">{vertical.rubric.summary}</p>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  {vertical.rubric.fastLifts.map((item) => (
                    <div
                      className="rounded-[18px] border border-border/50 bg-background/30 px-4 py-3 text-sm leading-6 text-foreground"
                      key={item}
                    >
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 sm:px-6 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:px-8">
          <div className="space-y-5 rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_86%,transparent),color-mix(in_srgb,var(--theme-background-alt)_95%,transparent))] p-6 sm:p-7">
            <div className="space-y-3">
              <Badge variant="accent">Live sample, benchmark framing</Badge>
              <h2 className="font-display text-[clamp(3.2rem,2.6rem+1.2vw,4.5rem)] leading-[0.92] tracking-[-0.05em] text-foreground">
                How a real audit gets read against the standard
              </h2>
              <p className="text-base leading-7 text-muted">
                {featuredAudit.summary}
              </p>
            </div>
            <ScoreDial label={featuredAudit.title} score={featuredAudit.score} />
            <ScoreRadar centerLabel="Current site" items={featuredAuditBreakdown} />
            <Button asChild variant="secondary">
              <Link href={featuredAudit.href}>
                Open the full sample audit
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-5 rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_86%,transparent),color-mix(in_srgb,var(--theme-background-alt)_95%,transparent))] p-6 sm:p-7">
            <div className="flex items-center gap-2 text-accent">
              <LineChart className="size-4" />
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em]">
                Weighted category breakdown
              </p>
            </div>
            <ScoreBreakdownBars items={featuredAuditBreakdown} showWeights targetItems={targetBreakdown} />
            <div className="rounded-[22px] border border-accent/20 bg-accent/8 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Fastest lifts
              </p>
              <div className="mt-3 space-y-2">
                {verticals[0]?.rubric.fastLifts.map((item) => (
                  <p className="text-sm leading-6 text-foreground" key={item}>
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 xl:px-8">
          <SectionHeading
            description="The benchmark needs memorable principles, not just categories. These are the reusable judgments the strongest examples make obvious."
            eyebrow="Principles"
            title="Rules the strongest pages keep obeying"
          />
          <div className="grid gap-5 xl:grid-cols-3">
            {featuredNotes.map((note) => (
              <Card className="h-full rounded-[24px] border-border/60 bg-panel/45" key={note.id}>
                <CardHeader className="space-y-4">
                  <div className="flex items-center gap-2 text-accent">
                    <ShieldCheck className="size-4" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em]">
                      {note.source}
                    </span>
                  </div>
                  <CardTitle className="text-[clamp(2.4rem,2rem+0.7vw,3.2rem)]">
                    {note.title}
                  </CardTitle>
                  <p className="text-base leading-7 text-muted">{note.summary}</p>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {note.takeaways.map((takeaway) => (
                    <p className="text-sm leading-6 text-foreground" key={takeaway}>
                      {takeaway}
                    </p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 xl:px-8">
          <SectionHeading
            description="These references are here to anchor the conversation. They are not templates to copy; they are standards to measure against."
            eyebrow="Reference set"
            title="Examples that still count as the benchmark"
          />
          <div className="grid gap-5 xl:grid-cols-3">
            {featuredExamples.map((reference) => (
              <article
                className="overflow-hidden rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_90%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))]"
                key={reference.id}
              >
                <PreviewImage
                  alt={`${reference.name} benchmark preview`}
                  className="aspect-[16/10]"
                  fallbackLabel="Reference image"
                  loadingLabel="Loading benchmark preview"
                  src={reference.previewImage}
                />
                <div className="space-y-4 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{reference.tier}</Badge>
                    <Badge variant="neutral">{reference.sourceLabel}</Badge>
                  </div>
                  <h3 className="font-display text-[clamp(2.2rem,1.8rem+0.5vw,3rem)] leading-[0.95] tracking-[-0.04em] text-foreground">
                    {reference.name}
                  </h3>
                  <p className="text-sm leading-6 text-muted">{reference.note}</p>
                  <div className="space-y-2">
                    {reference.whatWorks.slice(0, 2).map((item) => (
                      <p className="text-sm leading-6 text-foreground" key={item}>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="presentation-section py-8">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 sm:px-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:px-8">
          <Card className="rounded-[24px] border-border/60 bg-panel/45">
            <CardHeader className="space-y-3">
              <Badge variant="accent">Score bands</Badge>
              <CardTitle className="text-[clamp(2.8rem,2.3rem+0.7vw,3.7rem)]">
                How to talk about the score without flattening it
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              {comparisonRows.map((row) => (
                <div
                  className="rounded-[18px] border border-border/50 bg-background/30 px-4 py-4"
                  key={row.range}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-foreground">{row.label}</p>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">
                      {row.range}
                    </p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted">{row.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-[24px] border-border/60 bg-panel/45">
            <CardHeader className="space-y-3">
              <Badge variant="accent">FAQ</Badge>
              <CardTitle className="text-[clamp(2.8rem,2.3rem+0.7vw,3.7rem)]">
                Questions the benchmark page should answer quickly
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Accordion className="space-y-3" collapsible type="single">
                {faqItems.map((item) => (
                  <AccordionItem key={item.question} value={item.question}>
                    <AccordionTrigger>{item.question}</AccordionTrigger>
                    <AccordionContent>{item.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
