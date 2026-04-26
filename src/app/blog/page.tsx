import type { Metadata } from "next";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Blog — WebsiteCreditScore",
  description: "How we score websites across 10 dimensions: legitimacy, reputation, visual design, UX, transparency, technical health, content quality, social presence, longevity, and financial signals.",
};

export default function BlogPage() {
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
        <a href="/" className="text-xs hover:opacity-80 transition-opacity" style={{ color: "var(--theme-muted)" }}>
          ← Run a scan
        </a>
      </nav>

      <section className="px-6 py-16" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <div className="max-w-3xl mx-auto space-y-4">
          <div
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
            style={{ border: "1px solid var(--theme-border)", backgroundColor: "color-mix(in srgb, var(--theme-panel) 60%, transparent)", color: "var(--theme-muted)" }}
          >
            10 angles · one score
          </div>
          <h1 className="font-display" style={{ fontSize: "clamp(2rem,4vw,3rem)", color: "var(--theme-foreground)" }}>
            How We Score Websites
          </h1>
          <p className="text-base max-w-xl" style={{ color: "var(--theme-muted)" }}>
            Every audit evaluates 10 weighted dimensions. These articles explain exactly what our AI looks for — and what you can do about it.
          </p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-4">
          {BLOG_POSTS.map((post) => (
            <a
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block rounded-2xl p-6 group transition-all hover:scale-[1.01]"
              style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
            >
              <div className="flex items-start gap-4">
                <div
                  className="shrink-0 w-1.5 rounded-full mt-1"
                  style={{ height: "3rem", backgroundColor: post.dimensionColor }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="text-xs font-semibold uppercase tracking-wider"
                      style={{ color: post.dimensionColor }}
                    >
                      {post.dimension}
                    </span>
                    <span className="text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 50%, transparent)" }}>
                      · {post.readTime}
                    </span>
                  </div>
                  <h2
                    className="font-display mb-1 group-hover:opacity-80 transition-opacity"
                    style={{ fontSize: "clamp(1.1rem,2vw,1.35rem)", color: "var(--theme-foreground)" }}
                  >
                    {post.title}
                  </h2>
                  <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "var(--theme-muted)" }}>
                    {post.excerpt}
                  </p>
                  <p className="text-xs mt-3" style={{ color: "color-mix(in srgb, var(--theme-muted) 55%, transparent)" }}>
                    {post.date}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </section>

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
