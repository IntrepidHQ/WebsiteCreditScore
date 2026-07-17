import type { ReactNode } from "react";

/**
 * Static, server-rendered visuals for the docs page. Everything is HTML/CSS
 * on theme tokens (no client JS) so it inherits light/dark theming for free.
 */

const panelStyle = {
  backgroundColor: "var(--theme-panel)",
  border: "1px solid var(--theme-border)",
} as const;

/* ── 1. Scan pipeline ─────────────────────────────────────────────── */

function Arrow() {
  return (
    <div
      aria-hidden
      className="hidden sm:flex items-center justify-center shrink-0 px-1 font-mono text-lg"
      style={{ color: "var(--theme-muted)" }}
    >
      →
    </div>
  );
}

function PipelineCard({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex-1 min-w-0 rounded-xl p-4 space-y-3" style={panelStyle}>
      <div
        className="text-[10px] font-mono uppercase tracking-widest"
        style={{ color: "var(--theme-muted)" }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

export function ScanPipelineVisual() {
  const sources = ["Reviews", "BBB", "Reddit", "LinkedIn", "Press", "SSL/Tech", "Archive", "+5 more"];
  return (
    <figure aria-label="How a scan flows from domain to graded report" className="not-prose">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 items-stretch">
        <PipelineCard label="01 · Input">
          <div
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ backgroundColor: "var(--theme-background)", border: "1px solid var(--theme-border)" }}
          >
            <span className="font-mono text-[10px]" style={{ color: "var(--theme-muted)" }}>
              https://
            </span>
            <span className="font-mono text-xs" style={{ color: "var(--theme-foreground)" }}>
              yourdomain.com
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            Any public domain. No account.
          </p>
        </PipelineCard>
        <Arrow />
        <PipelineCard label="02 · Live research">
          <div className="flex flex-wrap gap-1.5">
            {sources.map((s) => (
              <span
                key={s}
                className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--theme-accent) 10%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)",
                  color: "var(--theme-foreground)",
                }}
              >
                {s}
              </span>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            Claude runs 8–10 live searches.
          </p>
        </PipelineCard>
        <Arrow />
        <PipelineCard label="03 · Weighted scoring">
          <div className="space-y-1.5" aria-hidden>
            {[82, 64, 91].map((w, i) => (
              <div key={i} className="flex items-center gap-2">
                <div
                  className="h-1.5 flex-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: "var(--theme-background)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${w}%`, backgroundColor: "var(--theme-accent)", opacity: 0.5 + i * 0.25 }}
                  />
                </div>
                <span className="font-mono text-[10px] w-6 text-right" style={{ color: "var(--theme-muted)" }}>
                  {w}
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            10 dimensions, each 0–100, weighted.
          </p>
        </PipelineCard>
        <Arrow />
        <PipelineCard label="04 · Graded report">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-display text-2xl shrink-0"
              style={{
                backgroundColor: "color-mix(in srgb, #3dd598 14%, transparent)",
                border: "1px solid color-mix(in srgb, #3dd598 40%, transparent)",
                color: "#3dd598",
              }}
            >
              A
            </div>
            <div className="min-w-0">
              <div className="font-mono text-lg leading-none" style={{ color: "var(--theme-foreground)" }}>
                91<span className="text-xs" style={{ color: "var(--theme-muted)" }}>/100</span>
              </div>
              <div className="text-[10px] mt-1" style={{ color: "var(--theme-muted)" }}>
                Permanent shareable URL
              </div>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            Evidence-linked, ~90 seconds.
          </p>
        </PipelineCard>
      </div>
    </figure>
  );
}

/* ── 2. Dimension weight chart ────────────────────────────────────── */

export function WeightChart({
  dimensions,
}: {
  dimensions: { key: string; label: string; weight: string; color: string }[];
}) {
  const rows = [...dimensions]
    .map((d) => ({ ...d, pct: parseInt(d.weight, 10) }))
    .sort((a, b) => b.pct - a.pct);
  const max = rows[0]?.pct ?? 1;

  return (
    <figure aria-label="Relative weight of each scoring dimension" className="not-prose rounded-xl p-5" style={panelStyle}>
      <figcaption
        className="text-[10px] font-mono uppercase tracking-widest mb-4"
        style={{ color: "var(--theme-muted)" }}
      >
        Where the weight sits
      </figcaption>
      <div className="space-y-2">
        {rows.map((d) => (
          <div key={d.key} className="grid items-center gap-3" style={{ gridTemplateColumns: "minmax(7.5rem, 12rem) 1fr 2.5rem" }}>
            <span className="text-xs truncate" style={{ color: "var(--theme-foreground)" }}>
              {d.label}
            </span>
            <div
              className="h-3 rounded-sm overflow-hidden"
              style={{ backgroundColor: "color-mix(in srgb, var(--theme-border) 40%, transparent)" }}
            >
              <div
                className="h-full"
                style={{
                  width: `${(d.pct / max) * 100}%`,
                  backgroundColor: d.color,
                  borderRadius: "2px 4px 4px 2px",
                }}
              />
            </div>
            <span className="font-mono text-xs text-right" style={{ color: "var(--theme-muted)" }}>
              {d.weight}
            </span>
          </div>
        ))}
      </div>
    </figure>
  );
}

/* ── 3. Grade scale ───────────────────────────────────────────────── */

const GRADE_SEGMENTS = [
  { grades: "F – D+", from: 0, to: 55, color: "#f87171" },
  { grades: "C− / C / C+", from: 55, to: 70, color: "#f7b21b" },
  { grades: "B− / B / B+", from: 70, to: 85, color: "#60a5fa" },
  { grades: "A− / A / A+", from: 85, to: 100, color: "#3dd598" },
];

export function GradeScaleVisual() {
  return (
    <figure aria-label="Score ranges mapped to letter grades" className="not-prose rounded-xl p-5" style={panelStyle}>
      <figcaption
        className="text-[10px] font-mono uppercase tracking-widest mb-4"
        style={{ color: "var(--theme-muted)" }}
      >
        Score → grade
      </figcaption>
      <div className="flex h-8 rounded-lg overflow-hidden" style={{ gap: 2 }}>
        {GRADE_SEGMENTS.map((s) => (
          <div
            key={s.grades}
            className="flex items-center justify-center text-[11px] font-semibold"
            style={{
              width: `${s.to - s.from}%`,
              backgroundColor: `color-mix(in srgb, ${s.color} 22%, transparent)`,
              borderTop: `2px solid ${s.color}`,
              color: s.color,
            }}
          >
            {s.grades}
          </div>
        ))}
      </div>
      <div className="relative mt-1.5 h-4 font-mono text-[10px]" style={{ color: "var(--theme-muted)" }}>
        {[0, 55, 70, 85, 100].map((t) => (
          <span
            key={t}
            className="absolute"
            style={{ left: `${t}%`, transform: t === 0 ? "none" : t === 100 ? "translateX(-100%)" : "translateX(-50%)" }}
          >
            {t}
          </span>
        ))}
      </div>
    </figure>
  );
}

/* ── 4. Mini report anatomy ───────────────────────────────────────── */

const ANATOMY_DIMS = [
  { label: "Business Legitimacy", score: 88, color: "#3dd598" },
  { label: "Online Reputation", score: 74, color: "#38bdf8" },
  { label: "Visual Design", score: 91, color: "#818cf8" },
];

export function ReportAnatomyVisual() {
  return (
    <figure aria-label="Anatomy of a WebsiteCreditScore report" className="not-prose rounded-xl overflow-hidden" style={panelStyle}>
      <div
        className="flex items-center gap-2 px-4 py-2.5"
        style={{ borderBottom: "1px solid var(--theme-border)" }}
      >
        <div className="flex gap-1.5" aria-hidden>
          <div className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
          <div className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        </div>
        <div
          className="mx-2 flex-1 rounded-md px-3 py-1 font-mono text-[10px]"
          style={{ backgroundColor: "var(--theme-background)", color: "var(--theme-muted)" }}
        >
          websitecreditscore.com/scan/…
        </div>
      </div>
      <div className="p-5 grid sm:grid-cols-[auto_1fr] gap-5 items-start">
        <div className="flex sm:flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center font-display text-4xl"
            style={{
              backgroundColor: "color-mix(in srgb, #3dd598 12%, transparent)",
              border: "1px solid color-mix(in srgb, #3dd598 40%, transparent)",
              color: "#3dd598",
            }}
          >
            A
          </div>
          <div className="text-center">
            <div className="font-mono text-xl leading-none" style={{ color: "var(--theme-foreground)" }}>
              91
            </div>
            <div className="text-[10px]" style={{ color: "var(--theme-muted)" }}>
              overall
            </div>
          </div>
        </div>
        <div className="space-y-4 min-w-0">
          <div>
            <div className="text-sm font-semibold mb-0.5" style={{ color: "var(--theme-foreground)" }}>
              Headline verdict
            </div>
            <div className="text-xs" style={{ color: "var(--theme-muted)" }}>
              One-paragraph plain-English summary of what the evidence shows.
            </div>
          </div>
          <div className="space-y-1.5">
            {ANATOMY_DIMS.map((d) => (
              <div key={d.label} className="grid items-center gap-3" style={{ gridTemplateColumns: "minmax(7rem, 10rem) 1fr 2rem" }}>
                <span className="text-[11px] truncate" style={{ color: "var(--theme-foreground)" }}>
                  {d.label}
                </span>
                <div
                  className="h-2 rounded-sm overflow-hidden"
                  style={{ backgroundColor: "color-mix(in srgb, var(--theme-border) 40%, transparent)" }}
                >
                  <div
                    className="h-full"
                    style={{ width: `${d.score}%`, backgroundColor: d.color, borderRadius: "2px 4px 4px 2px" }}
                  />
                </div>
                <span className="font-mono text-[11px] text-right" style={{ color: "var(--theme-muted)" }}>
                  {d.score}
                </span>
              </div>
            ))}
            <div className="text-[10px] pt-0.5" style={{ color: "var(--theme-muted)" }}>
              …7 more dimensions
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.3)",
                color: "#86efac",
              }}
            >
              ✓ 9 green flags
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: "rgba(248,113,113,0.10)",
                border: "1px solid rgba(248,113,113,0.3)",
                color: "#fca5a5",
              }}
            >
              ⚑ 2 red flags
            </span>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-medium"
              style={{
                backgroundColor: "color-mix(in srgb, var(--theme-accent) 10%, transparent)",
                border: "1px solid color-mix(in srgb, var(--theme-accent) 30%, transparent)",
                color: "var(--theme-foreground)",
              }}
            >
              12 cited sources
            </span>
          </div>
        </div>
      </div>
    </figure>
  );
}
