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

const scoreCategoryPanels = [
  {
    id: "visual-design",
    title: "Visual design",
    answer:
      "Hierarchy, spacing, and craft still matter, but they are not the heaviest drivers of the total. A polished layout cannot paper over weak sequencing or missing proof.",
  },
  {
    id: "ux-conversion",
    title: "UX / conversion",
    answer:
      "Navigation, pacing, and the path to action carry more weight. When the next step is unclear or late, the score drops faster than styling can recover it.",
  },
  {
    id: "mobile-experience",
    title: "Mobile experience",
    answer:
      "Small-screen clarity is treated as a first-class signal. Friction that only shows up on phones still counts at full weight, not as a footnote.",
  },
  {
    id: "trust-credibility",
    title: "Trust / credibility",
    answer:
      "Proof, legitimacy, and reassurance sit alongside UX in the heaviest band. A single broken trust pattern costs more than incremental visual upgrades help.",
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
            <Badge variant="accent">Benchmarks</Badge>
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted">
                The standard behind the score
              </p>
              <h1 className="max-w-5xl font-display text-[clamp(4.1rem,3.2rem+2vw,6.7rem)] leading-[0.9] tracking-[-0.06em] text-foreground">
                See what benchmark-ready actually looks like.
              </h1>
              <p className="max-w-3xl text-[1.08rem] leading-8 text-muted sm:text-[1.18rem] sm:leading-9">
                WebsiteCreditScore.com weighs message clarity, trust, pacing, mobile
                polish, search structure, accessibility, and visible competence into one
                standard you can understand quickly.
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
                  Browse examples
                  <Compass className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="glass-panel rounded-[20px] p-4 sm:p-5">
                <p className="text-sm font-semibold tracking-[-0.01em] text-foreground">Visual design</p>
                <p className="mt-2 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
                  Finish and composition are scored, but they are weighted lighter than conversion mechanics. Layout
                  should clarify the story, not replace it.
                </p>
              </div>
              <div className="glass-panel rounded-[20px] p-4 sm:p-5">
                <p className="text-sm font-semibold tracking-[-0.01em] text-foreground">UX / conversion</p>
                <p className="mt-2 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
                  Sequencing, CTAs, and momentum carry more weight. A hesitant path costs more than incremental styling
                  can earn back.
                </p>
              </div>
              <div className="glass-panel rounded-[20px] p-4 sm:p-5">
                <p className="text-sm font-semibold tracking-[-0.01em] text-foreground">Mobile experience</p>
                <p className="mt-2 text-xs leading-5 text-muted sm:text-sm sm:leading-6">
                  Tight small-screen clarity is mandatory, not decorative. Benchmark-ready pages usually land around{" "}
                  <span className="font-semibold text-foreground">8.8+</span> overall once the full model is firing.
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
            title="Rules of thumb a business owner can actually use"
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
            <div className="space-y-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Fastest lifts
              </p>
              <div className="grid gap-3 md:grid-cols-3">
                {verticals[0]?.rubric.fastLifts.map((item) => (
                  <div
                    className="rounded-[16px] border border-border/55 bg-panel/60 px-4 py-3 text-sm leading-6 text-foreground shadow-sm shadow-background/15"
                    key={item}
                  >
                    {item}
                  </div>
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
            description="Curated library flagships anchor each vertical. High-scoring public audits (8.8+ overall) are added automatically as we publish more samples — the set grows while staying benchmark-only."
            eyebrow="Reference set"
            title="High-bar examples: curated + public scans"
          />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {featuredExamples.map((reference, index) => (
              <Link
                className="group block"
                href={`/audit/${reference.siteId}?url=${encodeURIComponent(reference.url)}&from=scan`}
                key={reference.id}
              >
                <article className="h-full overflow-hidden rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_90%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] transition-[border-color,box-shadow] duration-200 group-hover:border-accent/40 group-hover:shadow-[0_0_0_1px_color-mix(in_srgb,var(--theme-accent)_18%,transparent)]">
                  <PreviewImage
                    alt={`${reference.name} benchmark preview`}
                    className="aspect-[16/10]"
                    fallbackLabel="Reference image"
                    fallbackSrc={reference.mobilePreviewImage}
                    loadingLabel="Loading preview"
                    priority={index === 0}
                    src={reference.previewImage}
                  />
                  <div className="space-y-4 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="accent">{reference.tier}</Badge>
                      {reference.measuredScore != null ? (
                        <Badge className="tabular-nums" variant="neutral">
                          Scored {reference.measuredScore.toFixed(1)}
                        </Badge>
                      ) : null}
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
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                      View audit report
                      <ArrowRight className="size-3" />
                    </div>
                  </div>
                </article>
              </Link>
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
                How the four scored pillars read on this page
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Accordion className="space-y-2.5" collapsible type="single">
                {scoreCategoryPanels.map((item) => (
                  <AccordionItem
                    key={item.id}
                    className="glass-panel border-border/55 bg-panel/30 px-0 shadow-none backdrop-blur-xl data-[state=open]:border-accent/35"
                    value={item.id}
                  >
                    <AccordionTrigger className="px-4 py-3.5 text-left text-[0.92rem] font-semibold leading-snug text-foreground hover:text-accent sm:px-5 sm:text-[0.98rem] sm:leading-snug [&>svg]:text-muted">
                      {item.title}
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-0 text-xs leading-5 text-muted sm:px-5 sm:text-sm sm:leading-6">
                      {item.answer}
                    </AccordionContent>
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
