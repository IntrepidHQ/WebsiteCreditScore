import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Code2,
  Globe2,
  Rocket,
  Sparkles,
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
  { href: "#animation", label: "Animation" },
  { href: "#seo", label: "SEO" },
  { href: "#max", label: "MAX workflow" },
  { href: "#domains", label: "Custom domains" },
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
            description="The docs stay short, visual, and practical. Each page explains what the app scores, how to read it, and what to do next."
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
              <CardContent className="space-y-3">
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
              <CardContent className="space-y-3">
                <p className="text-base leading-8 text-muted">
                  The benchmark library scans a broader pool, then only features the strongest measured examples. This keeps the references grounded in what good actually looks like.
                </p>
                <Button asChild variant="secondary">
                  <Link href="/app/benchmarks">
                    Open benchmarks
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
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
        </div>
      </div>
    </main>
  );
}
