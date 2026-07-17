import type { Metadata } from "next";
import { createElement, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPost, getRelatedPosts, type BlogPost } from "@/lib/blog/posts";
import { getBlogIconForSlug } from "@/lib/blog/icons";
import { DIMENSION_LABELS } from "@/lib/schema";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";

const SITE_URL = "https://www.websitecreditscore.com";

const SCORED_DIMENSIONS = new Set(Object.values(DIMENSION_LABELS));

function isScoredDimension(label: string): boolean {
  return SCORED_DIMENSIONS.has(label);
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  const canonical = `/blog/${post.slug}`;
  return {
    title: `${post.title} — WebsiteCreditScore Blog`,
    description: post.excerpt,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      url: `${SITE_URL}${canonical}`,
      siteName: "WebsiteCreditScore",
      publishedTime: toIsoDate(post.date),
      authors: post.author ? [post.author] : undefined,
    },
  };
}

function toIsoDate(humanDate: string): string | undefined {
  const parsed = new Date(humanDate);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString().slice(0, 10);
}

function buildJsonLd(post: BlogPost): object[] {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const isoDate = toIsoDate(post.date);
  const blocks: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: post.title,
      description: post.excerpt,
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      ...(isoDate ? { datePublished: isoDate, dateModified: isoDate } : {}),
      author: {
        "@type": "Person",
        name: post.author ?? "WebsiteCreditScore",
      },
      publisher: {
        "@type": "Organization",
        name: "WebsiteCreditScore",
        url: SITE_URL,
      },
    },
  ];
  if (post.faq?.length) {
    blocks.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    });
  }
  return blocks;
}

/** Renders inline **bold** spans and [text](url) links inside a line of body text. */
function renderInline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g);
  return parts.map((part, j) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={j} style={{ color: "var(--theme-foreground)" }}>
          {renderInline(part.slice(2, -2))}
        </strong>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const linkStyle = {
        color: "var(--theme-accent)",
        textDecoration: "underline",
        textUnderlineOffset: "3px",
      } as const;
      if (href.startsWith("/")) {
        return (
          <Link key={j} href={href} style={linkStyle} className="hover:opacity-80 transition-opacity">
            {label}
          </Link>
        );
      }
      return (
        <a
          key={j}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          style={linkStyle}
          className="hover:opacity-80 transition-opacity"
        >
          {label}
        </a>
      );
    }
    return part;
  });
}

function renderBody(body: string) {
  const lines = body.split("\n");
  const elements: ReactNode[] = [];
  let i = 0;
  let listBuffer: ReactNode[] = [];

  const flushList = (keyBase: number) => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul
        key={`ul-${keyBase}`}
        className="my-5 list-disc space-y-2 pl-6 marker:text-[var(--theme-muted)]"
        style={{ color: "var(--theme-muted)" }}
      >
        {listBuffer}
      </ul>
    );
    listBuffer = [];
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("- ")) {
      listBuffer.push(
        <li key={i} className="text-base leading-[1.75] pl-0.5">
          {renderInline(line.slice(2))}
        </li>
      );
      i++;
      continue;
    }

    flushList(i);

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="font-display mt-12 mb-4 first:mt-0 scroll-mt-24"
          style={{
            fontSize: "clamp(1.35rem, 2.8vw, 1.85rem)",
            color: "var(--theme-foreground)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
          }}
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("**") && line.endsWith("**") && !line.slice(2, -2).includes("**")) {
      elements.push(
        <p key={i} className="text-base font-semibold mt-8 mb-2" style={{ color: "var(--theme-foreground)" }}>
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.match(/^\d+\. \*\*/)) {
      const match = line.match(/^(\d+)\. \*\*(.+?)\*\*(.*)$/);
      if (match) {
        elements.push(
          <p key={i} className="text-base leading-[1.75] mb-3 pl-1" style={{ color: "var(--theme-muted)" }}>
            <span className="font-semibold" style={{ color: "var(--theme-foreground)" }}>
              {match[1]}. {match[2]}
            </span>
            {renderInline(match[3])}
          </p>
        );
      }
    } else if (line.trim() === "") {
      // skip blanks between paragraphs
    } else {
      elements.push(
        <p key={i} className="text-base leading-[1.75] mb-4" style={{ color: "var(--theme-muted)" }}>
          {renderInline(line)}
        </p>
      );
    }

    i++;
  }

  flushList(i);

  return elements;
}

function BlogPostIcon({ slug, color }: { slug: string; color: string }) {
  const Icon = getBlogIconForSlug(slug);
  return createElement(Icon, { className: "h-5 w-5", style: { color }, "aria-hidden": true });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const prev = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const next = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;
  const related = getRelatedPosts(post);
  const jsonLd = buildJsonLd(post);

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      {jsonLd.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(block) }}
        />
      ))}
      <ScrollToTop />
      <NavBar />

      <article className="px-6 py-16 max-w-2xl mx-auto flex-1 w-full">
        <div className="mb-10 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0"
              style={{
                border: `1px solid color-mix(in srgb, ${post.dimensionColor} 30%, var(--theme-border))`,
                backgroundColor: `color-mix(in srgb, ${post.dimensionColor} 12%, var(--theme-panel))`,
              }}
            >
              <BlogPostIcon slug={post.slug} color={post.dimensionColor} />
            </div>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--theme-muted)" }}>
                {post.dimension}
              </span>
              <span className="text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 55%, transparent)" }}>
                {post.readTime} · {post.date}
                {post.author ? ` · By ${post.author}` : ""}
              </span>
            </div>
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(1.75rem, 3.8vw, 2.65rem)",
              color: "var(--theme-foreground)",
              lineHeight: 1.12,
              letterSpacing: "-0.03em",
            }}
          >
            {post.title}
          </h1>
          <p className="text-lg leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            {post.excerpt}
          </p>
        </div>

        <div className="mb-10" style={{ borderTop: "1px solid var(--theme-border)" }} />

        <div>{renderBody(post.body)}</div>

        {post.faq && post.faq.length > 0 && (
          <section className="mt-14">
            <h2
              className="font-display mb-6"
              style={{
                fontSize: "clamp(1.35rem, 2.8vw, 1.85rem)",
                color: "var(--theme-foreground)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              {post.faq.map((item) => (
                <div
                  key={item.question}
                  className="rounded-xl p-5"
                  style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
                >
                  <p className="text-base font-semibold mb-2" style={{ color: "var(--theme-foreground)" }}>
                    {item.question}
                  </p>
                  <p className="text-base leading-[1.7]" style={{ color: "var(--theme-muted)" }}>
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-14">
            <h2
              className="font-display mb-5"
              style={{
                fontSize: "clamp(1.2rem, 2.4vw, 1.55rem)",
                color: "var(--theme-foreground)",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
              }}
            >
              Related reading
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  href={`/blog/${rp.slug}`}
                  className="rounded-xl p-4 group hover:opacity-90 transition-opacity"
                  style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
                >
                  <p
                    className="text-xs font-semibold uppercase tracking-wider mb-1"
                    style={{ color: rp.dimensionColor }}
                  >
                    {rp.dimension}
                  </p>
                  <p className="text-sm font-medium group-hover:opacity-80" style={{ color: "var(--theme-foreground)" }}>
                    {rp.title}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div
          className="mt-16 rounded-2xl p-8 text-center space-y-4"
          style={{
            border: "1px solid var(--theme-border)",
            backgroundColor: "var(--theme-panel)",
          }}
        >
          <p className="font-display" style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", color: "var(--theme-foreground)" }}>
            {isScoredDimension(post.dimension)
              ? `See how your site scores on ${post.dimension}`
              : "See how your website scores"}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            Full audit — all 10 dimensions, cited sources, and a shareable report.
          </p>
          <Link
            href="/"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
          >
            Start a scan →
          </Link>
        </div>

        {(prev || next) && (
          <div className="mt-12 grid grid-cols-2 gap-4">
            {prev ? (
              <Link
                href={`/blog/${prev.slug}`}
                className="rounded-xl p-4 group hover:opacity-90 transition-opacity"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <p className="text-xs mb-1" style={{ color: "var(--theme-muted)" }}>← Previous</p>
                <p className="text-sm font-medium group-hover:opacity-80" style={{ color: "var(--theme-foreground)" }}>
                  {prev.dimension}
                </p>
              </Link>
            ) : <div />}
            {next ? (
              <Link
                href={`/blog/${next.slug}`}
                className="rounded-xl p-4 text-right group hover:opacity-90 transition-opacity"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <p className="text-xs mb-1" style={{ color: "var(--theme-muted)" }}>Next →</p>
                <p className="text-sm font-medium group-hover:opacity-80" style={{ color: "var(--theme-foreground)" }}>
                  {next.dimension}
                </p>
              </Link>
            ) : <div />}
          </div>
        )}
      </article>

      <SiteFooter />
    </main>
  );
}
