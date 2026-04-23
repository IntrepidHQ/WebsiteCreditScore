import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Code2,
  Globe2,
  Layers,
  Rocket,
  Sparkles,
  TrendingUp,
  WandSparkles,
} from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const domainGuides = [
  {
    id: "vercel",
    name: "Vercel",
    summary: "Fastest path for most new launches. Add the domain, point the DNS, verify SSL, and ship.",
    steps: [
      "Add the custom domain in your project settings.",
      "Use the DNS records Vercel provides for apex and www.",
      "Wait for verification, then confirm HTTPS and redirects.",
    ],
  },
  {
    id: "cloudflare",
    name: "Cloudflare",
    summary: "Best when the client already manages DNS in Cloudflare and wants faster propagation control.",
    steps: [
      "Set the apex A record and the www CNAME in Cloudflare DNS.",
      "Keep proxy settings aligned with the app’s hosting rules.",
      "Confirm SSL mode, redirects, and the live preview before handoff.",
    ],
  },
  {
    id: "registrar",
    name: "Registrar DNS",
    summary: "Use this when DNS stays with GoDaddy, Namecheap, or another registrar-first setup.",
    steps: [
      "Point the apex domain to the host’s A record.",
      "Add the www CNAME and let the host manage the app target.",
      "Verify TLS, wait for propagation, and check the final redirect chain.",
    ],
  },
] as const;

const docLinks = [
  { href: "#start", label: "Start here" },
  { href: "#score", label: "The score" },
  { href: "#benchmarks", label: "Benchmarks" },
  { href: "#research-trace", label: "Research trace" },
  { href: "#animation", label: "Animation" },
  { href: "#seo", label: "SEO" },
  { href: "#max", label: "MAX workflow" },
  { href: "#domains", label: "Custom domains" },
  { href: "#methodology", label: "Methodology" },
  { href: "#prompt-patterns", label: "Prompt patterns" },
  { href: "/docs/trends", label: "Trends & insights" },
] as const;

export function DocsPage() {
  return (
    <main className="presentation-section pt-10" id="main-content">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:px-8">
        <aside className="space-y-4 lg:sticky lg:top-24 lg:h-fit">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <BookOpenText className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em]">Docs</span>
              </div>
              <CardTitle className="font-display text-3xl">Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {docLinks.map((link) => (
                <a
                  className="block rounded-[8px] border border-border/70 bg-background-alt/60 px-3 py-2 text-sm font-medium text-muted transition hover:border-accent/30 hover:text-foreground"
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </a>
              ))}
            </CardContent>
          </Card>

          <Card className="border-accent/20 bg-accent/8">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2 text-accent">
                <Rocket className="size-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em]">Fast path</span>
              </div>
              <CardTitle className="font-display text-3xl">Open MAX</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-7 text-muted">
                Copy a build prompt, route into Claude, Codex, or Lovable, and move the redesign forward in days.
              </p>
              <Button asChild className="w-full">
                <Link href="/app/max">
                  MAX workflow
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </aside>

        <div className="space-y-8">
          <SectionHeading
            eyebrow="Documentation"
            title="How WebsiteCreditScore.com works"
            description="Each guide gets to the point fast, shows real examples, and ends with the next move so you can apply it right away."
          />

          <section className="grid gap-4 lg:grid-cols-3" id="start">
            {[
              {
                icon: Sparkles,
                title: "Score first",
                description:
                  "Every scan produces a design, motion, and SEO view that the business owner can read quickly.",
              },
              {
                icon: WandSparkles,
                title: "Example heavy",
                description:
                  "The strongest references stay at the top so the bar is visible before the pitch starts.",
              },
              {
                icon: Code2,
                title: "Prompt ready",
                description:
                  "MAX turns the audit into a build brief that can be pasted into your preferred AI workflow.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardHeader className="space-y-3">
                  <div className="inline-flex size-10 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
                    <item.icon className="size-4" />
                  </div>
                  <CardTitle className="font-display text-[2rem]">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-7 text-muted">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]" id="score">
            <Card>
              <CardHeader className="space-y-3">
                <Badge variant="accent">The score</Badge>
                <CardTitle className="font-display text-[2.6rem]">What the number means</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-base leading-8 text-muted">
                  Design, animation, conversion, mobile clarity, trust, accessibility, and security posture all feed the audit score. A high score means the site is easier to trust and easier to act on.
                </p>
                <p className="text-base leading-8 text-muted">
                  Perfect is rare. The goal is to make the next redesign obvious, not to inflate the score with noise.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <Badge variant="neutral">Benchmarks</Badge>
                <CardTitle className="font-display text-[2.6rem]">How the bar is set</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-base leading-8 text-muted">
                  The benchmark library covers 10 industry verticals — home services, healthcare, SaaS, fintech, legal, real estate, fitness, beauty and wellness, construction, and restaurants. Each vertical has a dedicated scoring rubric, curated flagship examples, and fast-lift recommendations specific to that business type.
                </p>
                <p className="text-base leading-8 text-muted">
                  A 7.5 for a law firm and a 7.5 for a restaurant are measured against different peer sets. Context is the point.
                </p>
                <Button asChild variant="secondary">
                  <Link href="/benchmarks">
                    Open benchmarks
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]" id="research-trace">
            <Card>
              <CardHeader className="space-y-3">
                <div className="inline-flex size-10 items-center justify-center rounded-full border border-accent/20 bg-accent/10 text-accent">
                  <Layers className="size-4" />
                </div>
                <Badge variant="accent">Research trace</Badge>
                <CardTitle className="font-display text-[2.6rem]">The audit process, made visible</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <p className="text-base leading-8 text-muted">
                  Every audit includes a research trace — a visible record of what the scanner extracted, what it looked for and did not find, and how the benchmark references were selected. It converts the score from an assertion into an inspectable process.
                </p>
                <p className="text-base leading-8 text-muted">
                  Clients who can see the extraction log, the missing-signal manifest, and the Core Web Vitals evidence arrive at findings already convinced the tool read their site accurately. The trace is what separates a credible audit from a plausible-sounding one.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <CardTitle className="font-display text-[2rem]">What the trace shows</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                {[
                  { label: "Extraction log", detail: "Hero text, meta description, CTAs, trust signals, and heading hierarchy pulled from the live page." },
                  { label: "Missing signals", detail: "What the audit looked for and did not find — classified by severity (critical vs. standard)." },
                  { label: "Core Web Vitals", detail: "LCP, CLS, FCP, and TBT from Google PageSpeed Insights, rated against published thresholds." },
                  { label: "Benchmark selection", detail: "Which reference sites were chosen, their tier, and their measured scores." },
                  { label: "Score derivation", detail: "How each category score was calculated from observed signals, before weighting and aggregation." },
                ].map((item) => (
                  <div
                    className="rounded-[10px] border border-border/70 bg-background-alt/60 px-4 py-3"
                    key={item.label}
                  >
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="mt-0.5 text-sm leading-6 text-muted">{item.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 lg:grid-cols-2" id="animation">
            <Card>
              <CardHeader className="space-y-3">
                <Badge variant="accent">Animation</Badge>
                <CardTitle className="font-display text-[2.6rem]">Motion should earn its place</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-base leading-8 text-muted">
                  Use motion for feedback, guidance, and clearer transitions. A site can score a 10 without being flashy, but it should not score well if motion is absent or distracting.
                </p>
                <p className="text-base leading-8 text-muted">
                  Keep animation lightweight, respect reduced motion, and prefer transforms and opacity over heavy layout work.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3">
                <Badge variant="neutral">SEO</Badge>
                <CardTitle className="font-display text-[2.6rem]">The paid layer adds search depth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-base leading-8 text-muted">
                  The SEO add-on scores keyword ranking and AI searchability so the design story can extend into discoverability.
                </p>
                <Button asChild variant="secondary">
                  <Link href="/app/seo">
                    View SEO add-on
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4" id="max">
            <Card>
              <CardHeader className="space-y-3">
                <Badge variant="accent">MAX workflow</Badge>
                <CardTitle className="font-display text-[2.6rem]">Copy the prompt and move fast</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 lg:grid-cols-3">
                {[
                  "Scan the site and generate a prompt.",
                  "Copy it to the clipboard and open your preferred builder.",
                  "Paste the prompt and use the existing site and socials for brand cues.",
                ].map((item) => (
                  <div
                    className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4"
                    key={item}
                  >
                    <p className="text-sm leading-7 text-foreground">{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4" id="domains">
            <SectionHeading
              eyebrow="Custom domains"
              title="Three practical ways to go live"
              description="Keep the first pass simple. Use the host or DNS layer your client already understands best."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {domainGuides.map((guide) => (
                <Card key={guide.id}>
                  <CardHeader className="space-y-3">
                    <div className="flex items-center gap-2 text-accent">
                      <Globe2 className="size-4" />
                      <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                        {guide.name}
                      </span>
                    </div>
                    <CardTitle className="font-display text-[2rem]">{guide.name}</CardTitle>
                    <p className="text-sm leading-7 text-muted">{guide.summary}</p>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {guide.steps.map((step) => (
                      <div
                        className="rounded-[10px] border border-border/70 bg-panel/55 px-4 py-3 text-sm leading-6 text-foreground"
                        key={step}
                      >
                        {step}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-4" id="methodology">
            <SectionHeading
              eyebrow="Scoring methodology"
              title="How the score is calculated"
              description="The overall score is a weighted average of seven categories. Each category is scored independently so the report shows exactly where a site is strong and where it's costing the business."
            />
            <div className="grid gap-4 lg:grid-cols-2">
              {[
                {
                  category: "Visual design",
                  weight: "20%",
                  detail:
                    "Typography hierarchy, color contrast, logo quality, image production value, and whitespace discipline.",
                },
                {
                  category: "UX & conversion",
                  weight: "22%",
                  detail:
                    "Value proposition clarity, CTA placement and copy, form design, navigation efficiency, and page focus.",
                },
                {
                  category: "Mobile experience",
                  weight: "18%",
                  detail:
                    "Tap target sizing, font readability, layout reflow, CTA visibility on small screens, and scroll performance.",
                },
                {
                  category: "Trust signals",
                  weight: "18%",
                  detail:
                    "Social proof specificity, team visibility, testimonial quality, security indicators, and contact accessibility.",
                },
                {
                  category: "SEO fundamentals",
                  weight: "10%",
                  detail:
                    "Title tags, meta descriptions, heading hierarchy, image alt text, and page speed.",
                },
                {
                  category: "Accessibility",
                  weight: "7%",
                  detail:
                    "Keyboard navigation, screen reader compatibility, color dependence, and error message clarity.",
                },
                {
                  category: "Security posture",
                  weight: "5%",
                  detail:
                    "HTTPS enforcement, cookie consent, privacy policy presence, and third-party script hygiene.",
                },
              ].map((item) => (
                <Card key={item.category}>
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                        {item.weight}
                      </span>
                    </div>
                    <CardTitle className="font-display text-[1.9rem]">{item.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-muted">{item.detail}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="grid gap-4" id="prompt-patterns">
            <SectionHeading
              eyebrow="Prompt patterns"
              title="Using your brief with AI tools"
              description="The MAX workflow generates a structured brief designed to be pasted directly into Claude, ChatGPT, Cursor, or Lovable. Here's how to get the most out of it."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {[
                {
                  tool: "Claude",
                  pattern: "Paste the full brief, then follow with: 'Start with a sitemap and page-by-page content outline.' Claude handles long briefs well and will maintain the audit reasoning throughout.",
                },
                {
                  tool: "Cursor / Windsurf",
                  pattern: "Paste the brief into a new file called BRIEF.md. Then open a chat and reference the file: 'Use the brief in BRIEF.md as the foundation for this build.' The IDE context keeps the brief in scope across sessions.",
                },
                {
                  tool: "Lovable / v0",
                  pattern: "Paste the brief into the initial prompt and request a component-by-component build. Start with the hero section, then expand outward. Smaller scoped requests produce better output than asking for the full site in one go.",
                },
              ].map((item) => (
                <Card key={item.tool}>
                  <CardHeader className="space-y-2">
                    <Badge variant="accent">{item.tool}</Badge>
                    <CardTitle className="font-display text-[1.9rem]">{item.tool}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-7 text-muted">{item.pattern}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <div className="rounded-[24px] border border-accent/20 bg-accent/5 px-6 py-7 sm:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-accent">
                  <TrendingUp className="size-4" />
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                    Trends & insights
                  </span>
                </div>
                <h2 className="font-display text-[2.2rem] leading-[1.05] tracking-[-0.03em] text-foreground">
                  Research-backed writing for designers and agencies
                </h2>
                <p className="text-sm leading-7 text-muted">
                  Articles on conversion design, trust signals, audit methodology, and industry
                  benchmarks. Written for practitioners, not beginners.
                </p>
              </div>
              <Button asChild className="shrink-0">
                <Link href="/docs/trends">
                  Read our design insights
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
