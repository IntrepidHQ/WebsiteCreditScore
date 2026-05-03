import Link from "next/link";
import { buildStrategyCallCalendlyUrl } from "@/lib/strategy-call";

const FOOTER_LINKS = [
  { href: "/pricing", label: "Pricing" },
  { href: "/blog", label: "Blog" },
  { href: "/benchmarks", label: "Benchmarks" },
  { href: "/docs", label: "Docs" },
  { href: "/restore", label: "Restore credits" },
  { href: "/privacy", label: "Privacy" },
  { href: "/cookies", label: "Cookies" },
  { href: "/terms", label: "Terms" },
] as const;

export function SiteFooter() {
  return (
    <footer
      className="px-6 py-8 mt-auto"
      style={{ borderTop: "1px solid var(--theme-border)" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <span
          className="text-sm font-semibold font-display"
          style={{ color: "var(--theme-foreground)" }}
        >
          WebsiteCreditScore.com
        </span>
        <div
          className="flex flex-wrap items-center justify-center gap-4 text-xs"
          style={{ color: "color-mix(in srgb, var(--theme-muted) 70%, transparent)" }}
        >
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:opacity-80 transition-opacity">
              {link.label}
            </Link>
          ))}
          <a
            href={buildStrategyCallCalendlyUrl({ medium: "footer" })}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity font-semibold"
            style={{ color: "var(--theme-accent)" }}
          >
            Strategy Call
          </a>
        </div>
        <p
          className="text-xs text-center sm:text-right max-w-xs sm:max-w-none"
          style={{ color: "color-mix(in srgb, var(--theme-muted) 50%, transparent)" }}
        >
          Not financial advice · AI research at time of scan
        </p>
      </div>
    </footer>
  );
}
