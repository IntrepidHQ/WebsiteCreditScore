import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { TREND_ARTICLES } from "@/lib/content/trends";

export function generateStaticParams() {
  return TREND_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = TREND_ARTICLES.find((a) => a.slug === slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      publishedTime: article.publishedAt,
    },
    twitter: {
      card: "summary",
      title: article.title,
      description: article.excerpt,
    },
  };
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

export default async function TrendArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = TREND_ARTICLES.find((a) => a.slug === slug);
  if (!article) notFound();

  return (
    <main className="presentation-section pt-10 sm:pt-14 pb-24" id="main-content">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/docs/trends"
          className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-accent mb-8"
        >
          <ArrowLeft className="size-4" /> Back to Trends
        </Link>

        <div className="space-y-4 mb-10">
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <Badge
                key={tag}
                variant="neutral"
                className="text-[10px] uppercase tracking-[0.12em]"
              >
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="font-display text-[clamp(2.4rem,1.8rem+1.8vw,3.8rem)] leading-[0.95] tracking-[-0.04em] text-foreground">
            {article.title}
          </h1>
          <p className="text-lg leading-8 text-muted">{article.excerpt}</p>
          <div className="flex items-center gap-4 text-[11px] uppercase tracking-[0.14em] text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3" />
              {formatDate(article.publishedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-3" />
              {article.readMinutes} min read
            </span>
          </div>
        </div>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          {article.sections.map((section, i) => (
            <section key={i}>
              <h2 className="font-display text-[1.75rem] leading-[1.1] tracking-[-0.03em] text-foreground mt-10 mb-4">
                {section.heading}
              </h2>
              {section.body.split("\n\n").map((para, j) => (
                <p key={j} className="text-[1.05rem] leading-8 text-muted mb-5">
                  {para.trim()}
                </p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-16 rounded-[20px] border border-accent/20 bg-accent/5 p-6 space-y-3">
          <p className="text-sm font-semibold text-foreground">Ready to score your site?</p>
          <p className="text-sm leading-6 text-muted">
            Run a live audit and get a weighted score breakdown, competitive benchmarks, and a
            redesign brief in seconds.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            Run a free scan →
          </Link>
        </div>
      </div>
    </main>
  );
}
