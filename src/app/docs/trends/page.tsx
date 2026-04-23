import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/common/section-heading";
import { TREND_ARTICLES } from "@/lib/content/trends";

const FEATURED_SLUG = "audit-reports-seo-discoverability";

export const metadata: Metadata = {
  title: "Trends & Design Insights — Thought Leadership for Web Designers",
  description:
    "Research-backed insights on website conversion, trust design, audit methodology, and what separates high-scoring sites from low-converting ones.",
  openGraph: {
    title: "Trends & Design Insights",
    description:
      "Practitioner-grade articles on web design, conversion, trust signals, and audit methodology.",
  },
};

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default function TrendsIndexPage() {
  return (
    <main className="presentation-section pt-10 sm:pt-14" id="main-content">
      <div className="mx-auto w-full max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Trends & insights"
          title="What separates high-converting sites from low-scoring ones"
          description="Research-backed writing on web design, trust, conversion, and audit methodology. Written for designers and agencies who want evidence, not opinions."
        />
        {(() => {
          const featured = TREND_ARTICLES.find((a) => a.slug === FEATURED_SLUG);
          const rest = TREND_ARTICLES.filter((a) => a.slug !== FEATURED_SLUG);
          return (
            <div className="space-y-6">
              {featured && (
                <Link
                  aria-label={featured.title}
                  className="group block rounded-[14px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  href={`/docs/trends/${featured.slug}`}
                >
                  <Card className="overflow-hidden border-accent/30 bg-[linear-gradient(135deg,color-mix(in_srgb,var(--theme-accent)_8%,var(--theme-panel)),color-mix(in_srgb,var(--theme-background-alt)_95%,transparent))] transition hover:-translate-y-0.5 hover:border-accent/50">
                    <div className="grid sm:grid-cols-[1fr_auto]">
                      <CardHeader className="space-y-3 px-6 pb-0 pt-6 sm:px-8 sm:pt-8">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="accent" className="flex items-center gap-1.5">
                            <Star aria-hidden className="size-3" />
                            Editor&apos;s pick
                          </Badge>
                          {featured.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="neutral"
                              className="text-[10px] uppercase tracking-[0.12em]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <CardTitle className="font-display text-[clamp(2.2rem,1.8rem+1vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground transition group-hover:text-accent">
                          {featured.title}
                        </CardTitle>
                      </CardHeader>
                      <div className="hidden items-center justify-end pr-8 sm:flex">
                        <div className="flex size-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10 text-accent transition group-hover:bg-accent/20">
                          <ArrowRight aria-hidden className="size-5" />
                        </div>
                      </div>
                    </div>
                    <CardContent className="flex flex-col gap-4 px-6 pb-6 pt-3 sm:px-8 sm:pb-8">
                      <p className="max-w-2xl text-base leading-7 text-muted">{featured.excerpt}</p>
                      <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-muted">
                        <span className="flex items-center gap-1.5">
                          <Calendar aria-hidden className="size-3 shrink-0" />
                          {formatDate(featured.publishedAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock aria-hidden className="size-3 shrink-0" />
                          {featured.readMinutes} min read
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article) => (
                  <Link
                    key={article.slug}
                    aria-label={`${article.title}`}
                    className="group block h-full rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    href={`/docs/trends/${article.slug}`}
                  >
                    <Card className="flex h-full flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-accent/30">
                      <CardHeader className="space-y-3 px-6 pb-0 pt-6 sm:px-7 sm:pt-7">
                        <div className="flex flex-wrap gap-2">
                          {article.tags.slice(0, 2).map((tag) => (
                            <Badge
                              key={tag}
                              variant="neutral"
                              className="text-[10px] uppercase tracking-[0.12em]"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <CardTitle className="font-display text-2xl font-semibold leading-snug tracking-tight text-foreground transition group-hover:text-accent sm:text-[1.7rem] sm:leading-snug">
                          {article.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-1 flex-col gap-4 px-6 pb-6 pt-3 sm:px-7 sm:pb-7">
                        <p className="flex-1 text-sm leading-7 text-muted">{article.excerpt}</p>
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted">
                          <span className="flex items-center gap-1.5">
                            <Calendar aria-hidden className="size-3 shrink-0" />
                            {formatDate(article.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock aria-hidden className="size-3 shrink-0" />
                            {article.readMinutes} min read
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition group-hover:gap-3">
                          Read article <ArrowRight aria-hidden className="size-4 shrink-0" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}
      </div>
    </main>
  );
}
