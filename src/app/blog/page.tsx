import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { getBlogIconForSlug } from "@/lib/blog/icons";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Blog — WebsiteCreditScore",
  description: "How we score websites across 10 dimensions: legitimacy, reputation, visual design, UX, transparency, technical health, content quality, social presence, longevity, and financial signals.",
};

export default function BlogPage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

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
          <p className="text-base max-w-xl leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            Every audit evaluates 10 weighted dimensions. These articles explain exactly what our AI looks for — and what you can do about it.
          </p>
        </div>
      </section>

      <section className="px-6 py-12">
        <div className="max-w-3xl mx-auto space-y-4">
          {BLOG_POSTS.map((post) => {
            const Icon = getBlogIconForSlug(post.slug);
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-2xl p-6 group transition-all hover:scale-[1.01]"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="shrink-0 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      border: `1px solid color-mix(in srgb, ${post.dimensionColor} 32%, var(--theme-border))`,
                      backgroundColor: `color-mix(in srgb, ${post.dimensionColor} 12%, var(--theme-panel))`,
                    }}
                  >
                    <Icon className="h-6 w-6" style={{ color: post.dimensionColor }} aria-hidden />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-2">
                      <span
                        className="text-xs font-semibold uppercase tracking-wider"
                        style={{ color: "var(--theme-muted)" }}
                      >
                        {post.dimension}
                      </span>
                      <span className="text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 50%, transparent)" }}>
                        · {post.readTime}
                      </span>
                    </div>
                    <h2
                      className="font-display mb-2 group-hover:opacity-85 transition-opacity"
                      style={{ fontSize: "clamp(1.15rem,2vw,1.4rem)", color: "var(--theme-foreground)", lineHeight: 1.2 }}
                    >
                      {post.title}
                    </h2>
                    <p className="text-[15px] leading-relaxed line-clamp-2" style={{ color: "var(--theme-muted)" }}>
                      {post.excerpt}
                    </p>
                    <p className="text-xs mt-3" style={{ color: "color-mix(in srgb, var(--theme-muted) 55%, transparent)" }}>
                      {post.date}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
