import type { Metadata } from "next";
import {
  Home,
  Stethoscope,
  Monitor,
  CreditCard,
  Scale,
  Building2,
  Dumbbell,
  Sparkles,
  HardHat,
  UtensilsCrossed,
  Smile,
  ShoppingBag,
  type LucideIcon,
} from "lucide-react";
import { getBenchmarkRubric } from "@/lib/benchmarks/library";
import type { BenchmarkVertical } from "@/lib/types/audit";
import { ScrollToTop } from "@/components/ScrollToTop";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";

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

const verticals: Array<{ id: BenchmarkVertical; label: string; icon: LucideIcon; color: string }> = [
  { id: "service-providers",      label: "Home & Service",        icon: Home,           color: "#60a5fa" },
  { id: "private-healthcare",     label: "Private Care",          icon: Stethoscope,    color: "#4ade80" },
  { id: "product-saas",           label: "Product & SaaS",        icon: Monitor,        color: "#818cf8" },
  { id: "fintech",                label: "Fintech",               icon: CreditCard,     color: "#f7b21b" },
  { id: "legal",                  label: "Law Firms",           icon: Scale,          color: "#34d399" },
  { id: "real-estate",            label: "Real Estate",           icon: Building2,      color: "#fb923c" },
  { id: "fitness",                label: "Fitness & Studios",     icon: Dumbbell,       color: "#f472b6" },
  { id: "beauty-wellness",        label: "Beauty & Wellness",     icon: Sparkles,       color: "#38bdf8" },
  { id: "construction-trades",    label: "Construction & Trades", icon: HardHat,        color: "#a78bfa" },
  { id: "restaurant-hospitality", label: "Restaurants",           icon: UtensilsCrossed, color: "#facc15" },
  { id: "dental",                 label: "Dental Practices",      icon: Smile,          color: "#4ade80" },
  { id: "retail-ecommerce",       label: "Retail & E-commerce",   icon: ShoppingBag,    color: "#f7b21b" },
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

/** Flat geometric hero art per vertical — no photography, no skeuomorphic icons */
function IndustryFlatHero({ id, color }: { id: BenchmarkVertical; color: string }) {
  const art = (() => {
    switch (id) {
      case "service-providers":
        return (
          <>
            <rect x="8" y="42" width="62" height="36" rx="8" fill={color} opacity="0.38" />
            <rect x="24" y="22" width="30" height="14" rx="4" fill={color} opacity="0.22" />
          </>
        );
      case "private-healthcare":
        return (
          <>
            <rect x="16" y="18" width="48" height="58" rx="12" fill={color} opacity="0.28" />
            <circle cx="54" cy="36" r="14" fill={color} opacity="0.45" />
          </>
        );
      case "product-saas":
        return (
          <>
            <rect x="12" y="26" width="64" height="44" rx="8" fill={color} opacity="0.32" />
            <rect x="22" y="16" width="44" height="10" rx="3" fill={color} opacity="0.2" />
          </>
        );
      case "fintech":
        return (
          <>
            <rect x="14" y="34" width="60" height="38" rx="9" fill={color} opacity="0.34" />
            <rect x="26" y="20" width="36" height="10" rx="3" fill={color} opacity="0.5" />
          </>
        );
      case "legal":
        return (
          <>
            <path d="M48 16 L68 72 L28 72 Z" fill={color} opacity="0.35" />
            <rect x="30" y="52" width="36" height="10" rx="2" fill={color} opacity="0.25" />
          </>
        );
      case "real-estate":
        return (
          <>
            <path d="M20 52 L48 24 L76 52 Z" fill={color} opacity="0.4" />
            <rect x="38" y="46" width="20" height="22" rx="2" fill={color} opacity="0.28" />
          </>
        );
      case "fitness":
        return (
          <>
            <rect x="18" y="20" width="52" height="52" rx="14" fill={color} opacity="0.22" />
            <rect x="30" y="32" width="28" height="28" rx="6" fill={color} opacity="0.42" />
          </>
        );
      case "beauty-wellness":
        return (
          <>
            <circle cx="40" cy="40" r="26" fill={color} opacity="0.3" />
            <circle cx="58" cy="32" r="12" fill={color} opacity="0.45" />
          </>
        );
      case "construction-trades":
        return (
          <>
            <rect x="10" y="48" width="68" height="14" rx="3" fill={color} opacity="0.4" />
            <rect x="22" y="22" width="16" height="30" rx="2" fill={color} opacity="0.32" />
            <rect x="50" y="30" width="16" height="22" rx="2" fill={color} opacity="0.32" />
          </>
        );
      case "restaurant-hospitality":
        return (
          <>
            <ellipse cx="44" cy="44" rx="34" ry="22" fill={color} opacity="0.28" />
            <rect x="28" y="30" width="36" height="8" rx="2" fill={color} opacity="0.45" />
          </>
        );
      case "dental":
        return (
          <>
            <path
              d="M30 22 Q44 12 58 22 Q66 40 58 58 Q44 68 30 58 Q22 40 30 22 Z"
              fill={color}
              opacity="0.34"
            />
            <rect x="34" y="36" width="20" height="10" rx="3" fill={color} opacity="0.25" />
          </>
        );
      case "retail-ecommerce":
        return (
          <>
            <rect x="14" y="26" width="56" height="42" rx="10" fill={color} opacity="0.3" />
            <path d="M26 26 L44 14 L62 26 Z" fill={color} opacity="0.38" />
          </>
        );
    }
  })();

  return (
    <div
      className="relative mb-3 h-28 w-full overflow-hidden rounded-xl"
      style={{
        backgroundColor: "var(--theme-elevated)",
        border: "1px solid color-mix(in srgb, var(--theme-border) 85%, transparent)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(145deg, color-mix(in srgb, ${color} 38%, transparent) 0%, transparent 58%), linear-gradient(300deg, color-mix(in srgb, ${color} 22%, transparent), transparent 62%)`,
        }}
      />
      <svg
        className="absolute -right-3 -bottom-10 h-40 w-44"
        viewBox="0 0 96 96"
        aria-hidden
      >
        {art}
      </svg>
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
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={14} fontWeight="400" fontFamily="'Instrument Serif', Georgia, serif" fill="#f7b21b">
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
                <div className="flex items-center gap-4">
                  <SampleRadarChart />
                  <div className="space-y-2 text-xs">
                    {dimensions.slice(0, 5).map((d, i) => (
                      <div key={d.key} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span style={{ color: "var(--theme-muted)" }}>{d.label}</span>
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

      {/* Industry verticals grid */}
      <section
        className="px-6 py-16"
        style={{ borderBottom: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display mb-1" style={{ fontSize: "clamp(2rem, 3.5vw, 2.75rem)", color: "var(--theme-foreground)" }}>
            Industry-specific standards
          </h2>
          <p className="text-sm mb-10" style={{ color: "var(--theme-muted)" }}>
            Scores are calibrated to industry expectations. A dental practice and a SaaS startup face different trust signals — the rubric accounts for both.
          </p>

          {/* Visual vertical grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-10">
            {verticals.map(({ id, label, icon: Icon, color }) => {
              const rubric = getBenchmarkRubric(id);
              const liftCount = rubric?.fastLifts?.length ?? 0;
              return (
                <div
                  key={id}
                  className="rounded-2xl p-3 sm:p-4 flex flex-col gap-2 sm:gap-3"
                  style={{ border: `1px solid ${color}25`, backgroundColor: `color-mix(in srgb, var(--theme-panel) 90%, ${color}08)` }}
                >
                  <IndustryFlatHero id={id} color={color} />
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${color}18`, border: `1px solid ${color}28` }}
                    >
                      <Icon className="h-5 w-5" style={{ color }} strokeWidth={1.75} aria-hidden />
                    </div>
                    {liftCount > 0 && (
                      <span
                        className="text-xs font-bold px-1.5 py-0.5 rounded-full shrink-0"
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
            {verticals.map(({ id, label, icon: Icon, color }) => {
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
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${color}18`, border: `1px solid ${color}25` }}
                      >
                        <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.75} aria-hidden />
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
          <h2 className="font-display" style={{ fontSize: "clamp(2.25rem, 4vw, 3.25rem)", color: "var(--theme-foreground)" }}>
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

      <SiteFooter />
    </main>
  );
}
