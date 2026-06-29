import type { Metadata } from "next";
import Link from "next/link";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { IndustryStandards } from "./industry-standards";
import { SCAN_DEPTH_PROFILES, type ScanDepthKey } from "@/lib/scan-depth";

export const metadata: Metadata = {
  title: "Website Benchmark Standards — WebsiteCreditScore",
  description:
    "Explore the benchmark scoring criteria behind WebsiteCreditScore.com. See how legitimacy, reputation, visual design, and 7 other dimensions are weighted.",
  openGraph: {
    title: "Website Benchmark Standards",
    description:
      "The scoring rubric behind every website credibility report — see what separates A-grade sites from the rest.",
  },
};

// ── Data ─────────────────────────────────────────────────────────────────────

const scoreTiers = [
  { range: "90–100", grade: "A+/A",  label: "Exceptional", color: "#4ade80", score: 95, description: "Sets the bar for the industry. Trust is immediate, evidence is deep, and the experience is friction-free." },
  { range: "75–89",  grade: "A−/B+", label: "Strong",      color: "#f7b21b", score: 82, description: "Solid credibility signals with minor gaps. Converts well but leaves some trust on the table." },
  { range: "55–74",  grade: "B/C",   label: "Average",     color: "#fb923c", score: 65, description: "Adequate presence but significant room for improvement in transparency or technical health." },
  { range: "Below 55",grade: "D/F",  label: "At Risk",     color: "#f87171", score: 38, description: "Red flags outweigh green signals. Visitors are likely to bounce before they commit." },
];

const dimensions = [
  { key: "legitimacy",       label: "Business Legitimacy", weight: 18, color: "#4ade80",  desc: "Business registration, contact info, physical presence, and verifiable identity signals." },
  { key: "reputation",       label: "Online Reputation",   weight: 15, color: "#60a5fa",  desc: "Review sentiment across Google, Trustpilot, BBB, Reddit, and industry-specific platforms." },
  { key: "visual_design",    label: "Visual Design",       weight: 14, color: "#818cf8",  desc: "Homepage design quality, brand consistency, visual hierarchy, and professional polish." },
  { key: "ux_conversion",    label: "UX / Conversion",     weight: 12, color: "#f7b21b",  desc: "Navigation clarity, CTA placement, form friction, mobile responsiveness, and load experience." },
  { key: "transparency",     label: "Transparency",        weight: 10, color: "#34d399",  desc: "Clear pricing, terms, privacy policy, refund policy, and honest representation." },
  { key: "technical",        label: "Technical Health",    weight:  8, color: "#fb923c",  desc: "HTTPS, load speed, Core Web Vitals, uptime signals, and security headers." },
  { key: "content",          label: "Content Quality",     weight:  8, color: "#f472b6",  desc: "Depth, accuracy, and evidence-backed claims vs. vague marketing copy." },
  { key: "social_presence",  label: "Social Presence",     weight:  7, color: "#38bdf8",  desc: "Active LinkedIn, X, YouTube — real engagement vs. ghost accounts." },
  { key: "longevity",        label: "Longevity",           weight:  5, color: "#a78bfa",  desc: "Domain age, business tenure, and stability signals over time." },
  { key: "financial_signals",label: "Financial Signals",   weight:  3, color: "#facc15",  desc: "Funding, revenue signals, financial press coverage, and viability indicators." },
];

const scanDepths: ScanDepthKey[] = ["aerial", "surface", "deep", "trench", "mantle", "core"];

// sample scores for the demo radar (a "B-grade" site)
const DEMO_SCORES = [72, 68, 58, 65, 80, 74, 62, 55, 85, 70];

const GRADE_THRESHOLDS: Array<{ score: number; grade: string; color: string }> = [
  { score: 95, grade: "A+", color: "#4ade80" },
  { score: 88, grade: "A",  color: "#4ade80" },
  { score: 80, grade: "A−", color: "#86efac" },
  { score: 72, grade: "B+", color: "#f7b21b" },
  { score: 65, grade: "B",  color: "#f7b21b" },
  { score: 58, grade: "B−", color: "#fb923c" },
  { score: 50, grade: "C+", color: "#fb923c" },
  { score: 42, grade: "C",  color: "#fca5a5" },
  { score: 35, grade: "C−", color: "#f87171" },
  { score: 0,  grade: "D/F",color: "#f87171" },
];

// ── Graphics ──────────────────────────────────────────────────────────────────

function ScoreSpectrumBar() {
  const markers = [
    { score: 35, grade: "D" },
    { score: 55, grade: "C" },
    { score: 65, grade: "B" },
    { score: 75, grade: "B+" },
    { score: 80, grade: "A−" },
    { score: 88, grade: "A" },
    { score: 95, grade: "A+" },
  ];

  return (
    <div className="w-full space-y-3">
      <div className="w-full overflow-x-auto overscroll-x-contain pb-1 sm:overflow-visible">
        <div className="relative mx-auto min-w-[280px] max-w-full sm:min-w-0">
          <div
            className="h-3 w-full rounded-full sm:h-3.5"
            style={{
              background:
                "linear-gradient(90deg, #f87171 0%, #fb923c 30%, #f7b21b 56%, #86efac 80%, #4ade80 100%)",
              opacity: 0.92,
            }}
          />
          <div className="relative mt-2 min-h-[2.25rem]">
            {markers.map(({ score, grade }) => (
              <div
                key={score}
                className="absolute top-0 flex -translate-x-1/2 flex-col items-center"
                style={{ left: `${score}%` }}
              >
                <div
                  className="h-4 w-px"
                  style={{ backgroundColor: "color-mix(in srgb, var(--theme-foreground) 28%, transparent)" }}
                  aria-hidden
                />
                <span
                  className="font-score mt-1 text-[10px] tracking-tight sm:text-[11px] whitespace-nowrap"
                  style={{ color: "var(--theme-muted)" }}
                >
                  {grade}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex justify-between text-xs font-score" style={{ color: "var(--theme-muted)" }}>
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}

function ProgressRing({ score, color, size = 80 }: { score: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const cx = size / 2;
  const cy = size / 2;
  const grade = GRADE_THRESHOLDS.find((t) => score >= t.score)?.grade ?? "F";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="5" />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${filled} ${circ - filled}`}
        strokeDashoffset={circ / 4}
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color}66)` }}
      />
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={size * 0.22} fontWeight="400" fontFamily="'Instrument Serif', Georgia, serif" fill={color}>{grade}</text>
      <text x={cx} y={cy + size * 0.16} textAnchor="middle" fontSize={size * 0.12} fill="rgba(150,142,106,0.7)" fontFamily="'Instrument Serif', Georgia, serif">{score}</text>
    </svg>
  );
}

function DimensionWeightBar({ dim }: { dim: typeof dimensions[number] }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-36 shrink-0">
        <p className="text-xs font-medium truncate" style={{ color: "var(--theme-foreground)" }}>{dim.label}</p>
      </div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${dim.weight * (100 / 18)}%`,
            backgroundColor: dim.color,
            boxShadow: `0 0 6px ${dim.color}55`,
          }}
        />
      </div>
      <span className="text-xs font-score font-bold w-8 text-right shrink-0" style={{ color: dim.color }}>
        {dim.weight}%
      </span>
    </div>
  );
}

function SampleRadarChart() {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 132;
  const N = dimensions.length;

  function pt(i: number, r: number) {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const avgScore = Math.round(DEMO_SCORES.reduce((a, b) => a + b, 0) / DEMO_SCORES.length);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="mx-auto block w-full max-w-[23rem]">
      <defs>
        {dimensions.map((dim, index) => {
          const next = dimensions[(index + 1) % N];
          return (
            <linearGradient key={dim.key} id={`benchmark-slice-${dim.key}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={dim.color} stopOpacity="0.38" />
              <stop offset="100%" stopColor={next.color} stopOpacity="0.2" />
            </linearGradient>
          );
        })}
        <radialGradient id="benchmark-radar-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgba(247,178,27,0.2)" />
          <stop offset="80%" stopColor="rgba(247,178,27,0)" />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={maxR + 18} fill="url(#benchmark-radar-glow)" />
      {gridLevels.map((level) => {
        const pts = Array.from({ length: N }, (_, i) => pt(i, level * maxR));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
        return <path key={level} d={d} fill="none" stroke="rgba(247,178,27,0.09)" strokeWidth={1.2} />;
      })}
      {Array.from({ length: N }, (_, i) => {
        const outer = pt(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="rgba(247,178,27,0.09)" strokeWidth={1.2} />;
      })}
      {DEMO_SCORES.map((score, index) => {
        const nextScore = DEMO_SCORES[(index + 1) % N];
        const p1 = pt(index, (score / 100) * maxR);
        const p2 = pt((index + 1) % N, (nextScore / 100) * maxR);
        const path = `M${cx},${cy} L${p1.x.toFixed(1)},${p1.y.toFixed(1)} L${p2.x.toFixed(1)},${p2.y.toFixed(1)} Z`;
        return (
          <path
            key={dimensions[index].key}
            d={path}
            fill={`url(#benchmark-slice-${dimensions[index].key})`}
            stroke={dimensions[index].color}
            strokeOpacity={0.58}
            strokeWidth={1.25}
            strokeLinejoin="round"
          />
        );
      })}
      {DEMO_SCORES.map((s, i) => {
        const { x, y } = pt(i, (s / 100) * maxR);
        return (
          <g key={dimensions[i].key}>
            <circle cx={x.toFixed(1)} cy={y.toFixed(1)} r={13} fill="rgba(14,14,7,0.96)" stroke={dimensions[i].color} strokeWidth={1.8} />
            <text
              x={x.toFixed(1)}
              y={(y + 4).toFixed(1)}
              textAnchor="middle"
              fontSize={11}
              fontWeight={650}
              fontFamily="'Instrument Serif', Georgia, serif"
              fill={dimensions[i].color}
            >
              {s}
            </text>
          </g>
        );
      })}
      <circle cx={cx} cy={cy} r={34} fill="rgba(14,14,7,0.97)" />
      <circle cx={cx} cy={cy} r={34} fill="none" stroke="rgba(247,178,27,0.38)" strokeWidth={1.1} />
      <text x={cx} y={cy - 1} textAnchor="middle" fontSize={22} fontWeight="400" fontFamily="'Instrument Serif', Georgia, serif" fill="#f7b21b">
        {GRADE_THRESHOLDS.find((t) => avgScore >= t.score)?.grade}
      </text>
      <text x={cx} y={cy + 17} textAnchor="middle" fontSize={8} letterSpacing={2} fontFamily="ui-monospace, monospace" fill="rgba(150,142,106,0.82)">
        SAMPLE
      </text>
    </svg>
  );
}

function GradeDistributionChart() {
  // Approximate distribution of real website scores (illustrative)
  const bars = [
    { range: "0–20",  pct: 3,  color: "#f87171" },
    { range: "20–35", pct: 7,  color: "#f87171" },
    { range: "35–50", pct: 12, color: "#fb923c" },
    { range: "50–60", pct: 18, color: "#fb923c" },
    { range: "60–70", pct: 24, color: "#f7b21b" },
    { range: "70–80", pct: 19, color: "#f7b21b" },
    { range: "80–90", pct: 11, color: "#86efac" },
    { range: "90–100",pct: 6,  color: "#4ade80" },
  ];
  const maxPct = Math.max(...bars.map((b) => b.pct));

  return (
    <div className="w-full">
      <div className="flex items-end gap-1.5 h-28">
        {bars.map((bar) => (
          <div key={bar.range} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs font-mono font-semibold" style={{ color: bar.color, fontSize: "9px" }}>
              {bar.pct}%
            </span>
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${(bar.pct / maxPct) * 84}px`,
                backgroundColor: bar.color,
                opacity: 0.75,
                boxShadow: `0 0 8px ${bar.color}44`,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 mt-1">
        {bars.map((bar) => (
          <div key={bar.range} className="flex-1 text-center" style={{ fontSize: "8px", color: "var(--theme-muted)" }}>
            {bar.range.split("–")[0]}
          </div>
        ))}
      </div>
      <p className="text-xs text-center mt-1" style={{ color: "color-mix(in srgb, var(--theme-muted) 60%, transparent)" }}>
        Score range →
      </p>
    </div>
  );
}

function ScanDepthStandards() {
  return (
    <section className="px-6 py-16" style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em]" style={{ color: "var(--theme-accent)" }}>
            Scan depth standards
          </p>
          <h2 className="font-display leading-tight" style={{ fontSize: "clamp(2rem, 3.5vw, 2.85rem)", color: "var(--theme-foreground)" }}>
            Each deeper scan adds analysis, not artificial scarcity
          </h2>
          <p className="mt-4 text-sm leading-relaxed sm:text-base" style={{ color: "var(--theme-muted)" }}>
            Aerial keeps the full 10-dimension benchmark. Higher depths expand the evidence trail, source organization, peer context, risk analysis, and decision-ready synthesis.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {scanDepths.map((depth) => {
            const profile = SCAN_DEPTH_PROFILES[depth];
            const isCore = depth === "core";
            return (
              <div
                key={depth}
                className="rounded-2xl border p-5"
                style={{
                  borderColor: isCore ? "color-mix(in srgb, var(--theme-accent) 42%, var(--theme-border))" : "var(--theme-border)",
                  backgroundColor: isCore ? "color-mix(in srgb, var(--theme-panel) 86%, var(--theme-accent) 8%)" : "var(--theme-panel)",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold" style={{ color: "var(--theme-foreground)" }}>{profile.label}</h3>
                    <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>{profile.valuePromise}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-score text-3xl" style={{ color: "var(--theme-accent)" }}>{profile.searches}</p>
                    <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: "var(--theme-muted)" }}>searches</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {profile.unlocks.map((unlock) => (
                    <span key={unlock} className="rounded-full border px-2.5 py-1 text-xs" style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}>
                      {unlock}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/scan/demo?depth=${depth}`}
                  className="mt-5 inline-flex text-xs font-semibold underline-offset-4 hover:underline"
                  style={{ color: "var(--theme-accent)" }}
                >
                  View mock {profile.label} →
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BenchmarksPage() {
  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

      {/* Hero */}
      <section className="px-6 py-16" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "color-mix(in srgb, var(--theme-panel) 60%, transparent)", color: "var(--theme-muted)" }}
              >
                Scoring methodology
              </div>
              <h1
                className="font-display leading-tight"
                style={{ fontSize: "clamp(2.85rem, 5.5vw, 4.25rem)", color: "var(--theme-foreground)" }}
              >
                What makes a website
                <br />
                <span style={{ color: "var(--theme-accent)" }}>earn an A+?</span>
              </h1>
              <p className="text-base leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                Every WebsiteCreditScore report grades a domain across <strong style={{ color: "var(--theme-foreground)" }}>10 weighted dimensions</strong> using up to 20 live web searches. Here&rsquo;s exactly what the AI looks for — and how each dimension contributes to the final grade.
              </p>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-widest font-medium" style={{ color: "var(--theme-muted)" }}>
                  Score spectrum · 0–100
                </p>
                <ScoreSpectrumBar />
              </div>
            </div>

            {/* Right: radar + distribution */}
            <div className="space-y-6">
              <div
                className="rounded-2xl p-6"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--theme-accent)" }}>
                  Sample output · B-grade site
                </p>
                <p className="text-xs mb-4" style={{ color: "var(--theme-muted)" }}>
                  Strong longevity and transparency, weaker social presence and visual design.
                </p>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-[minmax(0,1.2fr)_minmax(10rem,0.8fr)] sm:items-center">
                  <SampleRadarChart />
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    {dimensions.slice(0, 5).map((d, i) => (
                      <div key={d.key} className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="min-w-0 flex-1 leading-tight" style={{ color: "var(--theme-muted)" }}>{d.label}</span>
                        <span className="font-score ml-auto" style={{ color: d.color }}>{DEMO_SCORES[i]}</span>
                      </div>
                    ))}
                    <p className="text-xs pt-1" style={{ color: "color-mix(in srgb, var(--theme-muted) 50%, transparent)" }}>
                      + 5 more dimensions
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl p-6"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: "var(--theme-muted)" }}>
                  Typical score distribution across real sites
                </p>
                <GradeDistributionChart />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Score tiers */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="font-display mb-1" style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", color: "var(--theme-foreground)" }}>
              Score tiers
            </h2>
            <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
              Four bands that translate a raw 0–100 score into a grade and a trust verdict.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {scoreTiers.map((tier) => (
              <div
                key={tier.grade}
                className="rounded-2xl p-5 flex flex-col gap-4"
                style={{ border: `1px solid ${tier.color}30`, backgroundColor: `color-mix(in srgb, var(--theme-panel) 85%, ${tier.color}08)` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: tier.color }}>
                      {tier.label}
                    </p>
                    <p className="text-xs font-mono" style={{ color: "var(--theme-muted)" }}>{tier.range}</p>
                  </div>
                  <ProgressRing score={tier.score} color={tier.color} size={64} />
                </div>
                <div
                  className="h-1 rounded-full overflow-hidden"
                  style={{ backgroundColor: "rgba(255,255,255,0.06)" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${tier.score}%`, backgroundColor: tier.color, opacity: 0.7 }}
                  />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                  {tier.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10 Dimensions */}
      <section className="px-6 py-16" style={{ borderBottom: "1px solid var(--theme-border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left: weight bars */}
            <div>
              <h2 className="font-display mb-1" style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", color: "var(--theme-foreground)" }}>
                The 10 scoring dimensions
              </h2>
              <p className="text-sm mb-8" style={{ color: "var(--theme-muted)" }}>
                Weights reflect how much each dimension impacts the final grade. Heavier dimensions penalize harder — and reward more.
              </p>
              <div className="divide-y" style={{ borderColor: "var(--theme-border)" }}>
                {dimensions.map((dim) => (
                  <DimensionWeightBar key={dim.key} dim={dim} />
                ))}
              </div>
            </div>

            {/* Right: dimension detail cards */}
            <div className="grid grid-cols-1 gap-3">
              {dimensions.map((dim) => (
                <div
                  key={dim.key}
                  className="rounded-xl p-4 flex items-start gap-3"
                  style={{ border: `1px solid ${dim.color}20`, backgroundColor: "var(--theme-panel)" }}
                >
                  <div
                    className="w-2 rounded-full mt-1 shrink-0"
                    style={{ height: "2.2rem", backgroundColor: dim.color, opacity: 0.8 }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-semibold" style={{ color: "var(--theme-foreground)" }}>{dim.label}</p>
                      <span
                        className="text-xs font-score font-bold shrink-0 px-1.5 py-0.5 rounded"
                        style={{ color: dim.color, backgroundColor: `${dim.color}15` }}
                      >
                        {dim.weight}%
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>{dim.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <ScanDepthStandards />

      <IndustryStandards />

      {/* CTA */}
      <section className="px-6 py-16 text-center" style={{ borderTop: "1px solid var(--theme-border)" }}>
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="font-display" style={{ fontSize: "clamp(2.25rem, 4vw, 3.25rem)", color: "var(--theme-foreground)" }}>
            See how any site scores
          </h2>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            Our AI researches any domain across all 10 dimensions with live web evidence. Results in ~90 seconds.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
          >
            Get a report · $1
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
