import type { Metadata } from "next";
import { getBenchmarkRubric } from "@/lib/benchmarks/library";
import type { BenchmarkVertical } from "@/lib/types/audit";
import { ScrollToTop } from "@/components/ScrollToTop";

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

const verticals: Array<{ id: BenchmarkVertical; label: string; icon: string; color: string }> = [
  { id: "service-providers",      label: "Home & Service",       icon: "🏠", color: "#60a5fa" },
  { id: "private-healthcare",     label: "Private Care",         icon: "🏥", color: "#4ade80" },
  { id: "product-saas",           label: "Product & SaaS",       icon: "🖥️", color: "#818cf8" },
  { id: "fintech",                label: "Fintech",              icon: "💳", color: "#f7b21b" },
  { id: "legal",                  label: "Law Firms",            icon: "⚖️", color: "#34d399" },
  { id: "real-estate",            label: "Real Estate",          icon: "🏡", color: "#fb923c" },
  { id: "fitness",                label: "Fitness & Studios",    icon: "🏋️", color: "#f472b6" },
  { id: "beauty-wellness",        label: "Beauty & Wellness",    icon: "💆", color: "#38bdf8" },
  { id: "construction-trades",    label: "Construction & Trades",icon: "🔨", color: "#a78bfa" },
  { id: "restaurant-hospitality", label: "Restaurants",          icon: "🍽️", color: "#facc15" },
  { id: "dental",                 label: "Dental Practices",     icon: "🦷", color: "#4ade80" },
  { id: "retail-ecommerce",       label: "Retail & E-commerce",  icon: "🛍️", color: "#f7b21b" },
];

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
    { score: 0,   grade: "F",   color: "#f87171" },
    { score: 35,  grade: "D",   color: "#f87171" },
    { score: 55,  grade: "C",   color: "#fb923c" },
    { score: 65,  grade: "B",   color: "#f7b21b" },
    { score: 75,  grade: "B+",  color: "#f7b21b" },
    { score: 80,  grade: "A−",  color: "#86efac" },
    { score: 88,  grade: "A",   color: "#4ade80" },
    { score: 95,  grade: "A+",  color: "#4ade80" },
    { score: 100, grade: "",    color: "#4ade80" },
  ];

  return (
    <div className="w-full space-y-2">
      <svg width="100%" height="48" viewBox="0 0 800 48" preserveAspectRatio="none">
        <defs>
          <linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="#f87171" />
            <stop offset="35%"  stopColor="#fb923c" />
            <stop offset="65%"  stopColor="#f7b21b" />
            <stop offset="88%"  stopColor="#86efac" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
        <rect x="0" y="8" width="800" height="20" rx="10" fill="url(#spectrum)" opacity="0.85" />
        {markers.map(({ score, grade }) => score > 0 && score < 100 ? (
          <g key={score}>
            <line
              x1={score * 8} y1="6"
              x2={score * 8} y2="30"
              stroke="rgba(0,0,0,0.3)" strokeWidth="1"
            />
            <text
              x={score * 8}
              y="44"
              textAnchor="middle"
              fontSize="9"
              fill="rgba(150,142,106,0.8)"
              fontFamily="monospace"
            >{grade}</text>
          </g>
        ) : null)}
      </svg>
      <div className="flex justify-between text-xs font-mono" style={{ color: "var(--theme-muted)" }}>
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
      <text x={cx} y={cy - 3} textAnchor="middle" fontSize={size * 0.22} fontWeight="bold" fontFamily="monospace" fill={color}>{grade}</text>
      <text x={cx} y={cy + size * 0.16} textAnchor="middle" fontSize={size * 0.12} fill="rgba(150,142,106,0.7)" fontFamily="monospace">{score}</text>
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
      <span className="text-xs font-mono font-bold w-8 text-right shrink-0" style={{ color: dim.color }}>
        {dim.weight}%
      </span>
    </div>
  );
}

function SampleRadarChart() {
  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 90;
  const N = dimensions.length;

  function pt(i: number, r: number) {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const scorePath = DEMO_SCORES.map((s, i) => {
    const { x, y } = pt(i, (s / 100) * maxR);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";

  const avgScore = Math.round(DEMO_SCORES.reduce((a, b) => a + b, 0) / DEMO_SCORES.length);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {gridLevels.map((level) => {
        const pts = Array.from({ length: N }, (_, i) => pt(i, level * maxR));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
        return <path key={level} d={d} fill="none" stroke="rgba(247,178,27,0.08)" strokeWidth={1} />;
      })}
      {Array.from({ length: N }, (_, i) => {
        const outer = pt(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="rgba(247,178,27,0.06)" strokeWidth={1} />;
      })}
      <path d={scorePath} fill="rgba(247,178,27,0.10)" stroke="rgba(247,178,27,0.45)" strokeWidth={1.5} />
      {DEMO_SCORES.map((s, i) => {
        const { x, y } = pt(i, (s / 100) * maxR);
        return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={3.5} fill={dimensions[i].color} fillOpacity={0.85} />;
      })}
      {/* Center grade */}
      <circle cx={cx} cy={cy} r={20} fill="#000" />
      <circle cx={cx} cy={cy} r={20} fill="none" stroke="rgba(247,178,27,0.25)" strokeWidth={1} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={13} fontWeight="bold" fontFamily="monospace" fill="#f7b21b">
        {GRADE_THRESHOLDS.find((t) => avgScore >= t.score)?.grade}
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

// ── Page ─────────────────────────────────────────────────────────────────────

export default function BenchmarksPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />

      {/* Nav */}
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
                style={{ fontSize: "clamp(2.2rem,5vw,3.5rem)", color: "var(--theme-foreground)" }}
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
                <div className="flex items-center gap-4">
                  <SampleRadarChart />
                  <div className="space-y-2 text-xs">
                    {dimensions.slice(0, 5).map((d, i) => (
                      <div key={d.key} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span style={{ color: "var(--theme-muted)" }}>{d.label}</span>
                        <span className="font-mono ml-auto" style={{ color: d.color }}>{DEMO_SCORES[i]}</span>
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
            <h2 className="font-display mb-1" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--theme-foreground)" }}>
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
              <h2 className="font-display mb-1" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--theme-foreground)" }}>
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
                        className="text-xs font-mono font-bold shrink-0 px-1.5 py-0.5 rounded"
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

      {/* Industry verticals grid */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display mb-1" style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--theme-foreground)" }}>
            Industry-specific standards
          </h2>
          <p className="text-sm mb-10" style={{ color: "var(--theme-muted)" }}>
            Scores are calibrated to industry expectations. A dental practice and a SaaS startup face different trust signals — the rubric accounts for both.
          </p>

          {/* Visual vertical grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
            {verticals.map(({ id, label, icon, color }) => {
              const rubric = getBenchmarkRubric(id);
              const liftCount = rubric?.fastLifts?.length ?? 0;
              return (
                <div
                  key={id}
                  className="rounded-2xl p-4 flex flex-col gap-3"
                  style={{ border: `1px solid ${color}25`, backgroundColor: `color-mix(in srgb, var(--theme-panel) 90%, ${color}08)` }}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-2xl">{icon}</span>
                    {liftCount > 0 && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                        style={{ backgroundColor: `${color}20`, color }}
                      >
                        {liftCount} lifts
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>{label}</p>
                    {rubric && (
                      <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "var(--theme-muted)" }}>
                        {rubric.summary?.slice(0, 60)}…
                      </p>
                    )}
                  </div>
                  <div className="h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full" style={{ width: "72%", backgroundColor: color, opacity: 0.6 }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detail accordions */}
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--theme-foreground)" }}>
            Rubric details by industry
          </h3>
          <div className="space-y-3">
            {verticals.map(({ id, label, icon, color }) => {
              const rubric = getBenchmarkRubric(id);
              if (!rubric) return null;
              return (
                <details
                  key={id}
                  className="group rounded-xl overflow-hidden"
                  style={{ border: "1px solid var(--theme-border)" }}
                >
                  <summary
                    className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none"
                    style={{ backgroundColor: "var(--theme-panel)" }}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-base shrink-0"
                        style={{ backgroundColor: `${color}18` }}
                      >
                        {icon}
                      </span>
                      <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--theme-muted)" }}>{rubric.title}</p>
                      </div>
                    </div>
                    <span
                      className="text-xs shrink-0 transition-transform group-open:rotate-180"
                      style={{ color: "var(--theme-muted)" }}
                    >
                      ▾
                    </span>
                  </summary>

                  <div
                    className="px-5 py-5 space-y-5"
                    style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>{rubric.summary}</p>

                    {rubric.fastLifts && rubric.fastLifts.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color }}>
                          Fast improvements
                        </p>
                        <ul className="space-y-1.5">
                          {rubric.fastLifts.map((lift, i) => (
                            <li key={i} className="text-xs flex gap-2" style={{ color: "var(--theme-muted)" }}>
                              <span style={{ color }}>→</span>
                              {lift}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {rubric.criteria.slice(0, 4).map((criterion) => (
                        <div
                          key={criterion.id}
                          className="rounded-xl p-3"
                          style={{ border: `1px solid ${color}18`, backgroundColor: "var(--theme-panel)" }}
                        >
                          <div
                            className="w-full h-0.5 rounded-full mb-3"
                            style={{ backgroundColor: color, opacity: 0.4 }}
                          />
                          <p className="text-xs font-semibold mb-1" style={{ color: "var(--theme-foreground)" }}>
                            {criterion.title}
                          </p>
                          <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                            {criterion.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </details>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center" style={{ borderTop: "1px solid var(--theme-border)" }}>
        <div className="max-w-xl mx-auto space-y-6">
          <h2 className="font-display" style={{ fontSize: "clamp(1.8rem,3.5vw,2.5rem)", color: "var(--theme-foreground)" }}>
            See how any site scores
          </h2>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            Our AI researches any domain across all 10 dimensions with live web evidence. Results in ~90 seconds.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
          >
            Get a report · $1
          </a>
        </div>
      </section>

      <footer
        className="px-6 py-6 text-center text-xs"
        style={{ borderTop: "1px solid var(--theme-border)", color: "color-mix(in srgb, var(--theme-muted) 60%, transparent)" }}
      >
        <div className="flex flex-wrap items-center justify-center gap-4 mb-2">
          <a href="/pricing" className="hover:opacity-80 transition-opacity">Pricing</a>
          <a href="/blog" className="hover:opacity-80 transition-opacity">Blog</a>
          <a href="/docs" className="hover:opacity-80 transition-opacity">Docs</a>
          <a href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</a>
          <a href="/terms" className="hover:opacity-80 transition-opacity">Terms</a>
        </div>
        WebsiteCreditScore · Not financial advice · Reports reflect AI research at time of scan
      </footer>
    </main>
  );
}
