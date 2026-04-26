import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BLOG_POSTS, getPost } from "@/lib/blog/posts";
import { ScrollToTop } from "@/components/ScrollToTop";

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
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="font-display mt-10 mb-4"
          style={{ fontSize: "clamp(1.3rem,2.5vw,1.75rem)", color: "var(--theme-foreground)" }}
        >
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith("**") && line.endsWith("**") && !line.slice(2, -2).includes("**")) {
      elements.push(
        <p key={i} className="text-sm font-semibold mt-5 mb-1" style={{ color: "var(--theme-foreground)" }}>
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.match(/^\d+\. \*\*/)) {
      // numbered list item starting with bold
      const match = line.match(/^(\d+)\. \*\*(.+?)\*\*(.*)$/);
      if (match) {
        elements.push(
          <p key={i} className="text-sm leading-relaxed mb-2 pl-4" style={{ color: "var(--theme-muted)" }}>
            <span className="font-semibold" style={{ color: "var(--theme-foreground)" }}>
              {match[1]}. {match[2]}
            </span>
            {match[3]}
          </p>
        );
      }
    } else if (line.startsWith("- ")) {
      elements.push(
        <li key={i} className="text-sm leading-relaxed ml-4 mb-1" style={{ color: "var(--theme-muted)" }}>
          {line.slice(2)}
        </li>
      );
    } else if (line.trim() === "") {
      // skip blanks between paragraphs
    } else {
      // Check for inline bold segments
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
          <p key={i} className="text-sm leading-relaxed mb-3" style={{ color: "var(--theme-muted)" }}>
            {parts}
          </p>
        );
      } else {
        elements.push(
          <p key={i} className="text-sm leading-relaxed mb-3" style={{ color: "var(--theme-muted)" }}>
            {line}
          </p>
        );
      }
    }

    i++;
  }

  return elements;
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const currentIndex = BLOG_POSTS.findIndex((p) => p.slug === slug);
  const prev = currentIndex > 0 ? BLOG_POSTS[currentIndex - 1] : null;
  const next = currentIndex < BLOG_POSTS.length - 1 ? BLOG_POSTS[currentIndex + 1] : null;

  return (
    <main className="min-h-screen">
      <ScrollToTop />
      <nav
        className="px-6 py-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid var(--theme-border)" }}
      >
        <a href="/" className="text-sm font-semibold tracking-tight hover:opacity-80 transition-opacity" style={{ color: "var(--theme-foreground)" }}>
          WebsiteCreditScore
        </a>
        <a href="/blog" className="text-xs hover:opacity-80 transition-opacity" style={{ color: "var(--theme-muted)" }}>
          ← All articles
        </a>
      </nav>

      <article className="px-6 py-16 max-w-2xl mx-auto">
        {/* Meta */}
        <div className="mb-8 space-y-3">
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{ backgroundColor: `${post.dimensionColor}18`, color: post.dimensionColor }}
            >
              {post.dimension}
            </span>
            <span className="text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 55%, transparent)" }}>
              {post.readTime} · {post.date}
            </span>
          </div>
          <h1
            className="font-display"
            style={{ fontSize: "clamp(1.6rem,3.5vw,2.5rem)", color: "var(--theme-foreground)", lineHeight: 1.2 }}
          >
            {post.title}
          </h1>
          <p className="text-base" style={{ color: "var(--theme-muted)" }}>
            {post.excerpt}
          </p>
        </div>

        {/* Divider */}
        <div className="mb-8" style={{ borderTop: "1px solid var(--theme-border)" }} />

        {/* Body */}
        <div>{renderBody(post.body)}</div>

        {/* CTA */}
        <div
          className="mt-16 rounded-2xl p-8 text-center space-y-4"
          style={{ border: `1px solid ${post.dimensionColor}30`, backgroundColor: `color-mix(in srgb, var(--theme-panel) 80%, ${post.dimensionColor}08)` }}
        >
          <p className="font-display" style={{ fontSize: "clamp(1.2rem,2.5vw,1.6rem)", color: "var(--theme-foreground)" }}>
            See how your site scores on {post.dimension}
          </p>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            Get a full audit — all 10 dimensions, cited sources, and a shareable report — for $1.
          </p>
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: post.dimensionColor, color: "#0e0e07" }}
          >
            Run a free preview →
          </a>
        </div>

        {/* Prev / Next */}
        {(prev || next) && (
          <div className="mt-12 grid grid-cols-2 gap-4">
            {prev ? (
              <a
                href={`/blog/${prev.slug}`}
                className="rounded-xl p-4 group hover:opacity-90 transition-opacity"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <p className="text-xs mb-1" style={{ color: "var(--theme-muted)" }}>← Previous</p>
                <p className="text-sm font-medium group-hover:opacity-80" style={{ color: "var(--theme-foreground)" }}>
                  {prev.dimension}
                </p>
              </a>
            ) : <div />}
            {next ? (
              <a
                href={`/blog/${next.slug}`}
                className="rounded-xl p-4 text-right group hover:opacity-90 transition-opacity"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <p className="text-xs mb-1" style={{ color: "var(--theme-muted)" }}>Next →</p>
                <p className="text-sm font-medium group-hover:opacity-80" style={{ color: "var(--theme-foreground)" }}>
                  {next.dimension}
                </p>
              </a>
            ) : <div />}
          </div>
        )}
      </article>

      <footer
        className="px-6 py-6 text-center text-xs"
        style={{ borderTop: "1px solid var(--theme-border)", color: "color-mix(in srgb, var(--theme-muted) 55%, transparent)" }}
      >
        <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
          <a href="/pricing" className="hover:opacity-80 transition-opacity">Pricing</a>
          <a href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</a>
          <a href="/terms" className="hover:opacity-80 transition-opacity">Terms</a>
          <a href="/benchmarks" className="hover:opacity-80 transition-opacity">Benchmarks</a>
          <a href="/docs" className="hover:opacity-80 transition-opacity">Docs</a>
        </div>
        WebsiteCreditScore · Not financial advice · Reports reflect AI research at time of scan
      </footer>
    </main>
  );
}
