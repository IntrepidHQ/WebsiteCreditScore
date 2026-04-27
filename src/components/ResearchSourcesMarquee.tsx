"use client";

export type MarqueeItem = { name: string; domain: string; href?: string };

export function ResearchSourcesMarquee({ items }: { items: MarqueeItem[] }) {
  const loop = [...items, ...items];

  return (
    <div
      className="relative w-full"
      style={{
        borderTop: "1px solid var(--theme-border)",
        borderBottom: "1px solid var(--theme-border)",
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--theme-panel) 82%, transparent), color-mix(in srgb, var(--theme-accent) 06%, transparent), color-mix(in srgb, var(--theme-panel) 82%, transparent))",
      }}
    >
      {/* Heading row above the marquee — full-width, centered, no overlap */}
      <div className="px-6 pt-5 sm:pt-7 text-center">
        <p
          className="font-display leading-tight"
          style={{ color: "var(--theme-foreground)", fontSize: "clamp(1.25rem, 2vw, 1.75rem)" }}
        >
          Researches across
        </p>
        <p className="mt-1 text-[10px] sm:text-xs font-semibold uppercase tracking-[0.22em]" style={{ color: "var(--theme-muted)" }}>
          Live sources in every scan
        </p>
      </div>

      {/* Marquee track */}
      <div className="relative overflow-hidden py-5 sm:py-7 mt-3">
        <div className="research-marquee-track items-center">
          {loop.map((src, i) => {
            const inner = (
              <span className="inline-flex items-center gap-3 whitespace-nowrap">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://www.google.com/s2/favicons?domain=${src.domain}&sz=64`}
                  alt=""
                  width={28}
                  height={28}
                  className="rounded-lg opacity-95 ring-1 ring-white/10"
                />
                <span
                  className="font-medium text-base sm:text-lg"
                  style={{ color: "var(--theme-foreground)" }}
                >
                  {src.name}
                </span>
              </span>
            );
            return src.href ? (
              <a
                key={`${src.name}-${i}`}
                href={src.href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 opacity-90 transition-opacity hover:opacity-100"
              >
                {inner}
              </a>
            ) : (
              <span key={`${src.name}-${i}`} className="shrink-0">
                {inner}
              </span>
            );
          })}
        </div>
      </div>

      {/* Footer caption below the marquee */}
      <div className="px-6 pb-5 sm:pb-6 text-center">
        <p className="text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 75%, transparent)" }}>
          12+ public sources cross-checked per report — Google, Trustpilot, BBB, Reddit, LinkedIn, SSL Labs and more
        </p>
      </div>
    </div>
  );
}
