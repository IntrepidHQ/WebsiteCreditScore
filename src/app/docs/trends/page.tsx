import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/common/section-heading";
import { TREND_ARTICLES } from "@/lib/content/trends";

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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TREND_ARTICLES.map((article) => (
            <Card
              key={article.slug}
              className="group flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:border-accent/30"
            >
              <CardHeader className="space-y-3">
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
                <CardTitle className="text-xl leading-snug">
                  <Link
                    href={`/docs/trends/${article.slug}`}
                    className="transition hover:text-accent"
                  >
                    {article.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-4">
                <p className="flex-1 text-sm leading-7 text-muted">{article.excerpt}</p>
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-muted">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="size-3" />
                    {formatDate(article.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-3" />
                    {article.readMinutes} min read
                  </span>
                </div>
                <Link
                  href={`/docs/trends/${article.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent transition hover:gap-3"
                >
                  Read article <ArrowRight className="size-4" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
