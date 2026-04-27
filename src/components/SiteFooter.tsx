import { buildStrategyCallCalendlyUrl } from "@/lib/strategy-call";

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
          <a href="/pricing" className="hover:opacity-80 transition-opacity">
            Pricing
          </a>
          <a href="/blog" className="hover:opacity-80 transition-opacity">
            Blog
          </a>
          <a href="/benchmarks" className="hover:opacity-80 transition-opacity">
            Benchmarks
          </a>
          <a href="/docs" className="hover:opacity-80 transition-opacity">
            Docs
          </a>
          <a href="/restore" className="hover:opacity-80 transition-opacity">
            Restore credits
          </a>
          <a href="/privacy" className="hover:opacity-80 transition-opacity">
            Privacy
          </a>
          <a href="/cookies" className="hover:opacity-80 transition-opacity">
            Cookies
          </a>
          <a href="/terms" className="hover:opacity-80 transition-opacity">
            Terms
          </a>
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
