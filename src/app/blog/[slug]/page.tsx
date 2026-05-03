import type { Metadata } from "next";
import { createElement, type ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPost } from "@/lib/blog/posts";
import { getBlogIconForSlug } from "@/lib/blog/icons";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";

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
  return {
    title: `${post.title} — WebsiteCreditScore Blog`,
    description: post.excerpt,
  };
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
          {line.slice(2)}
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
            {match[3]}
          </p>
        );
      }
    } else if (line.trim() === "") {
      // skip blanks between paragraphs
    } else {
      const hasBold = /\*\*.+?\*\*/.test(line);
      if (hasBold) {
        const parts = line.split(/(\*\*.+?\*\*)/g).map((part, j) =>
          part.startsWith("**") ? (
            <strong key={j} style={{ color: "var(--theme-foreground)" }}>
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        );
        elements.push(
          <p key={i} className="text-base leading-[1.75] mb-4" style={{ color: "var(--theme-muted)" }}>
            {parts}
          </p>
        );
      } else {
        elements.push(
          <p key={i} className="text-base leading-[1.75] mb-4" style={{ color: "var(--theme-muted)" }}>
            {line}
          </p>
        );
      }
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

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
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

        <div
          className="mt-16 rounded-2xl p-8 text-center space-y-4"
          style={{
            border: "1px solid var(--theme-border)",
            backgroundColor: "var(--theme-panel)",
          }}
        >
          <p className="font-display" style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.6rem)", color: "var(--theme-foreground)" }}>
            See how your site scores on {post.dimension}
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
