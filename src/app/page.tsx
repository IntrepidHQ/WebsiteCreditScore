import Link from "next/link";
import { getRecentScans } from "@/lib/db/scans";
import { ScanForm, type TierMode } from "@/components/ScanForm";
import { WalletBadge } from "@/components/WalletBadge";
import { QuantumWeb } from "@/components/QuantumWeb";
import { NavBar } from "@/components/NavBar";
import { SiteFooter } from "@/components/SiteFooter";
import { ResearchSourcesMarquee } from "@/components/ResearchSourcesMarquee";
import { ScrollToTop } from "@/components/ScrollToTop";
import { RESEARCH_SOURCES_PER_SCAN } from "@/lib/research-sources";
import { getBlogIconForSlug } from "@/lib/blog/icons";
import { buildStrategyCallCalendlyUrl } from "@/lib/strategy-call";
import {
  Building2, Star, Palette, MousePointer2,
  Eye, Zap, FileText, Share2, Clock, TrendingUp,
  CheckCircle2, ArrowRight, Linkedin, ExternalLink, Check,
} from "lucide-react";

// ── Apple.com fixture data ─────────────────────────────────────────────────
const ANGLES = [
  { key: "legitimacy",      label: "Business Legitimacy",      score: 99, grade: "A+", color: "#4ade80",  icon: Building2,     desc: "Incorporated, verifiable, registered in 170+ countries." },
  { key: "reputation",      label: "Online Reputation",        score: 91, grade: "A",  color: "#60a5fa",  icon: Star,          desc: "4.8/5 across major platforms. Criticism on pricing — not fraud." },
  { key: "visual_design",   label: "Visual Design",            score: 99, grade: "A+", color: "#818cf8",  icon: Palette,       desc: "The most cited design benchmark in consumer technology." },
  { key: "ux_conversion",   label: "UX / Conversion",          score: 95, grade: "A",  color: "#f7b21b",  icon: MousePointer2, desc: "Apple Pay reduces friction to near-zero. Sub-2s globally." },
  { key: "transparency",    label: "Transparency",             score: 78, grade: "B+", color: "#34d399",  icon: Eye,           desc: "Strong privacy policy. Repair restrictions under regulatory review." },
  { key: "technical",       label: "Technical Health",         score: 99, grade: "A+", color: "#fb923c",  icon: Zap,           desc: "A+ SSL Labs, HSTS preload, 99.99%+ uptime, Fastly CDN." },
  { key: "content",         label: "Content Quality",          score: 95, grade: "A",  color: "#f472b6",  icon: FileText,      desc: "Every word earns its place. Zero thin or AI-generated content." },
  { key: "social_presence", label: "Social Presence",          score: 98, grade: "A+", color: "#38bdf8",  icon: Share2,        desc: "35M+ on X, Tim Cook active. Covered by every major outlet." },
  { key: "longevity",       label: "Longevity",                score: 99, grade: "A+", color: "#a78bfa",  icon: Clock,         desc: "Founded 1976. apple.com active since 1987. 48 years operating." },
  { key: "financial",       label: "Financial Signals",        score: 99, grade: "A+", color: "#facc15",  icon: TrendingUp,    desc: "$394B revenue, $3.3T market cap. Most profitable tech company." },
];

const ANGLE_BLOG_SLUG: Record<string, string> = {
  legitimacy: "business-legitimacy",
  reputation: "online-reputation",
  visual_design: "visual-design",
  ux_conversion: "ux-conversion",
  transparency: "transparency",
  technical: "technical-health",
  content: "content-quality",
  social_presence: "social-presence",
  longevity: "longevity",
  financial: "financial-signals",
};

const OPERATOR_CARDS = [
  {
    title: "The score has a point of view",
    body: "The rubric reflects how I judge trust, clarity, taste, and buyer momentum after years of shipping sites.",
    href: "https://www.linkedin.com/in/hans-turner-01155448/",
    cta: "Open LinkedIn",
    color: "#60a5fa",
    graphic: "viewpoint",
  },
  {
    title: "From scan to sharper site",
    body: "A report can become a supervised redesign plan: what to scan, map, improve, and publish first.",
    href: "/docs",
    cta: "View methodology",
    color: "#f7b21b",
    graphic: "audit",
  },
  {
    title: "Agents need direction",
    body: "Human Operator, Real experience combined with the latest models.",
    href: "https://hansturner.com",
    cta: "Open portfolio",
    color: "#4ade80",
    graphic: "supervision",
  },
] as const;

function gradeLabel(grade: string): string {
  if (grade === "A+" || grade === "A") return "EXCELLENT";
  if (grade === "A-" || grade === "B+" || grade === "B") return "GREAT";
  if (grade.startsWith("C")) return "AVERAGE";
  return "BELOW AVERAGE";
}

function gradeToColor(grade: string): string {
  if (grade === "A+" || grade === "A") return "#4ade80";
  if (grade === "A-" || grade === "B+" || grade === "B") return "#f7b21b";
  if (grade.startsWith("C")) return "#facc15";
  return "#f87171";
}

function domainInitials(domain: string): string {
  return domain
    .replace(/^www\./, "")
    .split(".")[0]
    .split(/[-_]/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "W";
}

function OperatorGraphic({
  type,
  color,
}: {
  type: (typeof OPERATOR_CARDS)[number]["graphic"];
  color: string;
}) {
  const sceneStyle = { "--operator-color": color } as React.CSSProperties;

  if (type === "viewpoint") {
    return (
      <div className="operator-micro-scene relative h-40 overflow-hidden rounded-[14px] border" style={sceneStyle}>
        <div className="operator-depth-light" />
        <div className="operator-perspective-grid absolute inset-0" />
        <div className="operator-surface-panel absolute left-5 top-5 h-28 w-[62%] rounded-[12px] p-3">
          <div className="flex items-center justify-between">
            <div className="text-[9px] font-bold uppercase tracking-[0.16em]" style={{ color }}>POV matrix</div>
            <div className="rounded-full border border-white/10 px-1.5 py-0.5 text-[8px] text-white/45">live</div>
          </div>
          <div className="relative mt-3 grid h-[4.65rem] grid-cols-3 gap-1.5">
            {[
              ["Trust", "88", "12%", "15%"],
              ["Friction", "42", "54%", "8%"],
              ["Proof", "73", "25%", "56%"],
              ["Taste", "91", "66%", "51%"],
              ["Intent", "67", "46%", "34%"],
            ].map(([label, score, left, top], index) => (
              <div
                key={label}
                className="operator-tiny-tile absolute rounded-[7px] px-1.5 py-1"
                style={{
                  left,
                  top,
                  borderColor: index === 3 ? `${color}66` : "rgba(255,255,255,0.11)",
                  backgroundColor: index === 3 ? `${color}1d` : "rgba(0,0,0,0.22)",
                }}
              >
                <div className="text-[7px] font-semibold leading-none text-white/70">{label}</div>
                <div className="mt-1 text-[8px] font-bold leading-none" style={{ color }}>{score}</div>
              </div>
            ))}
          </div>
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 190 112" aria-hidden>
            <path className="operator-elbow-path operator-elbow-path-a" d="M148 30 H120 V49 H92" />
            <path className="operator-elbow-path operator-elbow-path-b" d="M148 66 H118 V77 H84" />
          </svg>
        </div>
        <div className="operator-lens absolute right-6 top-7 h-[4.9rem] w-[4.9rem] rounded-full border bg-black/30">
          <div className="absolute inset-[14px] rounded-full border border-white/10" />
        </div>
        <div className="operator-system-badge absolute bottom-5 right-5" style={{ color }}>
          POV model
        </div>
      </div>
    );
  }

  if (type === "audit") {
    return (
      <div className="operator-micro-scene relative h-40 overflow-hidden rounded-[14px] border p-3" style={sceneStyle}>
        <div className="operator-depth-light" />
        <div className="operator-surface-panel absolute inset-x-4 top-4 h-24 overflow-hidden rounded-[12px]">
          <div className="operator-slide-track flex h-full w-[300%]">
            <div className="relative h-full w-1/3 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color }}>Scan</div>
              <div className="absolute left-5 top-11 space-y-1">
                {["UX", "Proof", "Speed"].map((label, index) => (
                  <div key={label} className="flex items-center gap-1.5 text-[8px] font-semibold text-white/52">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: index === 1 ? color : "rgba(255,255,255,0.24)" }} />
                    {label}
                  </div>
                ))}
              </div>
              <div className="absolute right-6 top-1/2 h-16 w-16 -translate-y-[43%] rounded-full" style={{ background: `conic-gradient(${color} 0 270deg, rgba(255,255,255,0.1) 270deg 360deg)` }}>
                <div className="absolute inset-[5px] grid place-items-center rounded-full bg-[#121107] text-lg font-semibold" style={{ color }}>
                  7.5
                </div>
              </div>
              <div className="absolute bottom-3 left-5 rounded-full border border-white/10 px-2 py-0.5 text-[8px] font-semibold text-white/45">18 sources</div>
            </div>
            <div className="relative h-full w-1/3 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color }}>Plan</div>
              <div className="absolute left-1/2 top-[55%] grid h-10 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[9px] border border-white/12 bg-black/35 text-[8px] font-bold" style={{ color }}>
                Priority
              </div>
              <svg className="absolute inset-0 h-full w-full" viewBox="0 0 286 96" aria-hidden>
                <path className="operator-elbow-path" d="M143 52 H91 V31 H58" />
                <path className="operator-elbow-path" d="M143 52 H93 V72 H58" />
                <path className="operator-elbow-path" d="M143 52 H197 V31 H230" />
                <path className="operator-elbow-path" d="M143 52 H196 V72 H230" />
              </svg>
              {[
                ["Rewrite", "12%", "26%"],
                ["Proof", "12%", "69%"],
                ["CTA", "72%", "26%"],
                ["Layout", "72%", "69%"],
              ].map(([label, left, top]) => (
                <div key={label} className="absolute grid h-5 w-14 place-items-center rounded-[7px] border border-white/10 bg-black/40 text-[7px] font-semibold text-white/58" style={{ left, top }}>
                  {label}
                </div>
              ))}
            </div>
            <div className="relative h-full w-1/3 p-4">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color }}>Ship</div>
              <div className="absolute inset-x-5 bottom-4 top-8 rounded-[10px] border border-white/10 bg-black/30 shadow-2xl shadow-black/30">
                <div className="flex h-4 items-center gap-1 rounded-t-[10px] border-b border-white/10 bg-white/8 px-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#4ade80]" />
                  <span className="text-[7px] font-semibold text-white/38">Published</span>
                </div>
                <div className="p-2">
                  <div className="h-3 w-20 rounded-full" style={{ backgroundColor: `${color}70` }} />
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    <div className="h-8 rounded-[6px] bg-white/10" />
                    <div className="h-8 rounded-[6px]" style={{ backgroundColor: `${color}35` }} />
                    <div className="h-8 rounded-[6px] bg-white/10" />
                  </div>
                </div>
              </div>
              <div className="operator-publish-dot absolute right-8 top-8 h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 h-7 overflow-hidden rounded-full border border-white/10 bg-black/25">
          <div className="operator-sequence-highlight absolute inset-y-1 left-1 w-1/3 rounded-full" />
          <div className="relative grid h-full grid-cols-3 place-items-center text-[10px] font-semibold" style={{ color: "rgba(237,232,212,0.66)" }}>
            <span>Scan</span>
            <span>Plan</span>
            <span>Ship</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="operator-micro-scene relative h-40 overflow-hidden rounded-[14px] border p-3" style={sceneStyle}>
      <div className="operator-depth-light" />
      <div className="operator-surface-panel absolute left-4 top-4 right-4 rounded-[10px] p-2.5">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[8px] font-bold uppercase tracking-[0.16em] text-white/48">Agent console</span>
        </div>
      </div>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 320 160" aria-hidden>
        <path className="operator-elbow-path" d="M94 62 V83 H62" />
        <path className="operator-elbow-path" d="M153 62 V77 H160 V101" />
        <path className="operator-elbow-path" d="M212 62 V83 H258" />
      </svg>
      <div className="absolute bottom-5 left-4 right-4 grid grid-cols-3 gap-2.5">
        {[
          ["Research", "source checked"],
          ["Taste", "revise CTA"],
          ["Build", "ship ready"],
        ].map(([label, note], index) => (
          <div key={label} className="operator-console-card rounded-[10px] border border-white/10 bg-black/25 p-2.5" style={{ animationDelay: `${index * 0.25}s` }}>
            <div className="flex items-center justify-between gap-1">
              <span className="text-[7px] font-bold text-white/58">{label}</span>
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: index === 1 ? color : "rgba(255,255,255,0.22)" }} />
            </div>
            <div className="mt-2 text-[7px] leading-none text-white/38">{note}</div>
            <div className="mt-2 h-1 rounded-full bg-white/10">
              <div className="h-full rounded-full" style={{ width: `${index === 0 ? 82 : index === 1 ? 58 : 74}%`, backgroundColor: `${color}88` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="absolute left-6 top-[3.65rem] inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-[10px] font-semibold" style={{ color }}>
        <Check className="h-3 w-3" /> Human Supervision
      </div>
    </div>
  );
}

// ── SVG Radar chart — stained-glass per-dimension slices ──────────────────
function RadarChart() {
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 128;
  const N = ANGLES.length;

  const pt = (i: number, r: number) => {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const avgScore = ANGLES.reduce((sum, a) => sum + a.score, 0) / (N * 10);

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="block max-w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        {ANGLES.map((a, i) => {
          const next = ANGLES[(i + 1) % N];
          return (
            <linearGradient key={`grad-${i}`} id={`slice-grad-${i}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={a.color} stopOpacity="0.42" />
              <stop offset="100%" stopColor={next.color} stopOpacity="0.22" />
            </linearGradient>
          );
        })}
        <radialGradient id="radar-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgba(247,178,27,0.20)" />
          <stop offset="80%" stopColor="rgba(247,178,27,0)" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={maxR + 8} fill="url(#radar-glow)" />

      {/* Grid rings */}
      {gridLevels.map((level) => {
        const ringPts = Array.from({ length: N }, (_, i) => pt(i, level * maxR));
        const d = ringPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
        return <path key={level} d={d} fill="none" stroke="rgba(247,178,27,0.08)" strokeWidth={1} />;
      })}

      {/* Spokes */}
      {Array.from({ length: N }, (_, i) => {
        const outer = pt(i, maxR);
        return <line key={`spoke-${i}`} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="rgba(247,178,27,0.07)" strokeWidth={1} />;
      })}

      {/* Per-dimension triangular slices, each colored by its dimension */}
      {ANGLES.map((a, i) => {
        const next = ANGLES[(i + 1) % N];
        const s1 = a.score / 100;
        const s2 = next.score / 100;
        const p1 = pt(i, s1 * maxR);
        const p2 = pt((i + 1) % N, s2 * maxR);
        const d = `M${cx},${cy} L${p1.x.toFixed(1)},${p1.y.toFixed(1)} L${p2.x.toFixed(1)},${p2.y.toFixed(1)} Z`;
        return (
          <path
            key={`slice-${i}`}
            d={d}
            fill={`url(#slice-grad-${i})`}
            stroke={a.color}
            strokeOpacity={0.55}
            strokeWidth={1.1}
            strokeLinejoin="round"
          />
        );
      })}

      {/* Score chips at each vertex */}
      {ANGLES.map((a, i) => {
        const s = a.score / 100;
        const { x, y } = pt(i, s * maxR);
        const chipR = 14;
        return (
          <g key={`chip-${i}`}>
            <circle cx={x} cy={y} r={chipR} fill="rgba(14,14,7,0.92)" stroke={a.color} strokeWidth={1.4} />
            <text
              x={x}
              y={y + 3.5}
              textAnchor="middle"
              fontSize={10}
              fontWeight="600"
              fontFamily="'Instrument Serif', Georgia, serif"
              fill={a.color}
            >
              {(a.score / 10).toFixed(1)}
            </text>
          </g>
        );
      })}

      {/* Center grade pill */}
      <circle cx={cx} cy={cy} r={32} fill="rgba(14,14,7,0.96)" />
      <circle cx={cx} cy={cy} r={32} fill="none" stroke="rgba(247,178,27,0.35)" strokeWidth={1} />
      <text
        x={cx}
        y={cy - 1}
        textAnchor="middle"
        fontSize={22}
        fontWeight="400"
        fontFamily="'Instrument Serif', Georgia, serif"
        fill="#f7b21b"
      >
        {avgScore.toFixed(1)}
      </text>
      <text
        x={cx}
        y={cy + 13}
        textAnchor="middle"
        fontSize={7}
        letterSpacing={1.5}
        fontFamily="ui-monospace, monospace"
        fill="rgba(150,142,106,0.8)"
      >
        AVG
      </text>
    </svg>
  );
}

// ── Angle card (styled like screenshot) ───────────────────────────────────
function AngleCard({ angle }: { angle: typeof ANGLES[number] }) {
  const Icon = angle.icon;
  const lbl = gradeLabel(angle.grade);
  const lblColor = gradeToColor(angle.grade);
  const blogSlug = ANGLE_BLOG_SLUG[angle.key];
  const inner = (
    <>
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${angle.color}18`, border: `1px solid ${angle.color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: angle.color }} />
        </div>
        <span
          className="font-score leading-none"
          style={{ color: angle.color, fontSize: "2.6rem" }}
        >
          {(angle.score / 10).toFixed(1)}
        </span>
      </div>
      <div>
        <p className="text-sm font-semibold mb-1" style={{ color: "var(--theme-foreground)" }}>
          {angle.label}
        </p>
        <p className="text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
          {angle.desc}
        </p>
      </div>
      <div className="flex items-center justify-between mt-auto pt-1">
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${lblColor}18`, color: lblColor, border: `1px solid ${lblColor}30` }}
        >
          {lbl}
        </span>
        <span className="text-xs font-score" style={{ color: "var(--theme-muted)" }}>
          {angle.score / 10} / 10
        </span>
      </div>
    </>
  );
  const shellClass =
    "group rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden transition-all hover:-translate-y-1 hover:opacity-95";
  const shellStyle = {
    border: `1px solid color-mix(in srgb, ${angle.color} 22%, var(--theme-border))`,
    background:
      `linear-gradient(145deg, color-mix(in srgb, ${angle.color} 12%, var(--theme-panel)) 0%, var(--theme-panel) 62%, color-mix(in srgb, ${angle.color} 6%, var(--theme-background)) 100%)`,
  } as const;
  if (blogSlug) {
    return (
      <Link href={`/blog/${blogSlug}`} className={`${shellClass} h-full`} style={shellStyle}>
        <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full opacity-25 blur-2xl transition-transform group-hover:scale-125" style={{ backgroundColor: angle.color }} />
        {inner}
        <span className="text-[10px] font-medium mt-auto pt-2" style={{ color: "var(--theme-accent)" }}>
          Read dimension guide →
        </span>
      </Link>
    );
  }
  return (
    <div className={shellClass} style={shellStyle}>
      {inner}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
type Tier = "quick" | "standard" | "deep";
function isValidTier(t: unknown): t is Tier {
  return t === "quick" || t === "standard" || t === "deep";
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; mode?: string }>;
}) {
  const { tier: rawTier, mode: rawMode } = await searchParams;
  const defaultTier: Tier = isValidTier(rawTier) ? rawTier : "quick";
  const tierMode: TierMode = rawMode === "max" ? "max" : "standard";
  const recentScans = await getRecentScans(null).catch(() => []);

  return (
    <main className="flex min-h-screen flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
      <ScrollToTop />
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ minHeight: "90vh" }}>
        <QuantumWeb />
        {/* Amber glow */}
        <div
          className="absolute top-0 left-0 w-[600px] h-[600px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at top left, rgba(247,178,27,0.12), transparent 65%)", filter: "blur(60px)" }}
        />

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="space-y-8">
            <div className="space-y-3">
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wider uppercase"
                style={{ border: "1px solid rgba(247,178,27,0.3)", backgroundColor: "rgba(247,178,27,0.08)", color: "var(--theme-accent)" }}
              >
                Website Audits, Reviews, and Redesigns
              </div>
              <p className="text-xs uppercase tracking-widest font-medium" style={{ color: "var(--theme-muted)" }}>
                For business owners who want a site that earns more trust
              </p>
            </div>

            <h1
              className="font-display leading-[0.96]"
              style={{ fontSize: "clamp(3rem, 6vw, 5rem)", color: "var(--theme-foreground)" }}
            >
              <span className="block sm:inline">Trust nothing.</span>{" "}
              <span style={{ color: "var(--theme-accent)" }}>
                Verify everything.
              </span>
            </h1>

            <p className="text-base leading-relaxed max-w-md" style={{ color: "var(--theme-muted)" }}>
              Paste a domain. Get a live credibility report across ten trust dimensions. No account creation,
              no dashboard setup, no sales gate. One form at the top, one form at the bottom.
            </p>

            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <Link
                href="/scan/demo"
                className="inline-flex w-fit items-center justify-center rounded-xl px-5 py-3 text-xs font-bold transition-opacity hover:opacity-90"
                style={{ border: "1px solid var(--theme-border)", color: "var(--theme-foreground)" }}
              >
                View sample report
              </Link>
              <a
                href={buildStrategyCallCalendlyUrl({ medium: "hero", content: "landing_hero" })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-fit items-center justify-center rounded-xl px-5 py-3 text-xs font-bold transition-opacity hover:opacity-90"
                style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
              >
                Strategy Call
              </a>
              <p className="max-w-md text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                The main flow is intentionally direct: scan first, then decide what to improve. Already scanned or
                prefer to talk first? A Strategy Call books your session and triggers your{" "}
                <strong style={{ color: "var(--theme-foreground)" }}>Strategy Presentation</strong> from the audit.
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-xl space-y-4">
              <WalletBadge />
              <ScanForm showTierSelect defaultTier={defaultTier} tierMode={tierMode} />
            </div>
          </div>
        </div>

        <div
          className="relative z-10 mt-10 w-[100vw] left-1/2 -translate-x-1/2 max-w-[100vw]"
          style={{ boxSizing: "border-box" }}
        >
          <ResearchSourcesMarquee
            items={RESEARCH_SOURCES_PER_SCAN.map((s) => ({
              name: s.name,
              domain: s.domain,
              href: s.href,
            }))}
          />
        </div>
      </section>

      {/* Trust proof */}
      <section className="px-6 py-12" style={{ borderTop: "1px solid var(--theme-border)" }}>
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-stretch">
          <div
            className="rounded-2xl p-6"
            style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--theme-accent)" }}>
                Human operator
              </p>
              <h2 className="font-display mt-3" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: "var(--theme-foreground)", lineHeight: 1 }}>
                Real experience combined with the latest models.
              </h2>
            </div>
            <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
              WebsiteCreditScore is shaped by how I evaluate websites after years of building, reviewing, and improving
              them for real businesses. The AI does the research quickly; the product is trained around my taste for
              clear positioning, visible proof, low-friction UX, and technical decisions that help a site feel credible.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-xs font-semibold">
              <a href="https://hansturner.com" target="_blank" rel="noopener noreferrer" className="rounded-full border px-3 py-1.5 hover:opacity-85" style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}>
                <span className="inline-flex items-center gap-1.5">HansTurner.com <ExternalLink className="h-3 w-3" /></span>
              </a>
              <a href="https://www.linkedin.com/in/hans-turner-01155448/" target="_blank" rel="noopener noreferrer" className="rounded-full border px-3 py-1.5 hover:opacity-85" style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}>
                <span className="inline-flex items-center gap-1.5"><Linkedin className="h-3 w-3" /> LinkedIn</span>
              </a>
              <a href="https://github.com/IntrepidHQ/WebsiteCreditScore" target="_blank" rel="noopener noreferrer" className="rounded-full border px-3 py-1.5 hover:opacity-85" style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}>
                Public GitHub repo
              </a>
              <a href="mailto:websitecreditscore@gmail.com" className="rounded-full border px-3 py-1.5 hover:opacity-85" style={{ borderColor: "var(--theme-border)", color: "var(--theme-foreground)" }}>
                websitecreditscore@gmail.com
              </a>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-3">
            {OPERATOR_CARDS.map((item) => {
              const external = item.href.startsWith("http");
              const content = (
                <>
                  <OperatorGraphic type={item.graphic} color={item.color} />
                  <p className="mt-4 text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>{item.title}</p>
                  <p className="mt-3 text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>{item.body}</p>
                  <p className="mt-4 inline-flex items-center gap-1 text-xs font-bold" style={{ color: item.color }}>
                    {item.cta} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </p>
                </>
              );
              const className = "group rounded-2xl p-4 transition-all hover:-translate-y-1 hover:opacity-95";
              const style = {
                border: `1px solid color-mix(in srgb, ${item.color} 24%, var(--theme-border))`,
                backgroundColor: "color-mix(in srgb, var(--theme-panel) 65%, transparent)",
              };

              return external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={className}
                  style={style}
                >
                  {content}
                </a>
              ) : (
                <Link key={item.href} href={item.href} className={className} style={style}>
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Ten angles */}
      <section
        className="px-6 py-20"
        style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--theme-accent)" }}>
              Scoring Benchmarks
            </p>
            <h2
              className="font-display leading-[1.05]"
              style={{ fontSize: "clamp(2.4rem, 5vw, 4.25rem)", color: "var(--theme-foreground)" }}
            >
              The score rewards clarity, trust, and momentum<span style={{ color: "var(--theme-muted)" }}> — not just polish</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-10 lg:gap-14 items-center mb-14">
            <div className="flex justify-center lg:justify-start">
              <RadarChart />
            </div>
            <div className="flex flex-col gap-6">
              <p className="text-base leading-relaxed max-w-2xl" style={{ color: "var(--theme-muted)" }}>
                A better-looking redesign is not the point. The point is to see where your current site is hiding value, weakening trust, or making ready buyers hesitate.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {ANGLES.map((a) => {
                  const slug = ANGLE_BLOG_SLUG[a.key]!;
                  const DimIcon = getBlogIconForSlug(slug);
                  const row = (
                    <div className="flex items-center gap-2.5 text-sm py-1">
                      <span
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                        style={{
                          border: `1px solid color-mix(in srgb, ${a.color} 28%, var(--theme-border))`,
                          backgroundColor: `color-mix(in srgb, ${a.color} 10%, var(--theme-panel))`,
                        }}
                      >
                        <DimIcon className="h-3.5 w-3.5" style={{ color: a.color }} aria-hidden />
                      </span>
                      <span style={{ color: "var(--theme-foreground)" }}>{a.label}</span>
                    </div>
                  );
                  return slug ? (
                    <Link
                      key={a.key}
                      href={`/blog/${slug}`}
                      className="block rounded-lg -mx-1 px-1 hover:opacity-85 transition-opacity"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div key={a.key}>{row}</div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ANGLES.map((angle) => (
              <AngleCard key={angle.key} angle={angle} />
            ))}
          </div>

          <p className="text-xs text-center mt-6" style={{ color: "color-mix(in srgb, var(--theme-muted) 50%, transparent)" }}>
            Sample output — Apple.com · <a href="/docs" className="underline underline-offset-2 hover:opacity-80">Full methodology →</a>
          </p>
        </div>
      </section>

      {/* What do I get */}
      <section className="px-6 py-20" style={{ borderTop: "1px solid var(--theme-border)" }}>
        <div className="max-w-5xl mx-auto">
          <h2
            className="font-display text-center mb-3"
            style={{ fontSize: "clamp(3rem, 5.5vw, 4.25rem)", color: "var(--theme-foreground)" }}
          >
            What do I get for $1?
          </h2>
          <p className="text-sm text-center mb-12" style={{ color: "var(--theme-muted)" }}>
            One payment. No account. Results in 60–120 seconds.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Paste any domain",
                body: "Any public domain — a competitor, a vendor, your own site. No account needed, just $1 via Stripe.",
                icon: ArrowRight,
              },
              {
                step: "02",
                title: "AI runs 10 live searches",
                body: "Claude researches reviews, complaints, design quality, UX, BBB, Reddit, LinkedIn, press, funding, and technical health.",
                icon: CheckCircle2,
              },
              {
                step: "03",
                title: "10 graded dimensions",
                body: "A+ to F letter grades, red & green flags, cited sources, and a plain-English verdict — all in under two minutes.",
                icon: TrendingUp,
              },
            ].map(({ step, title, body }) => (
              <div
                key={step}
                className="rounded-2xl p-6 space-y-3"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <span className="font-mono text-xs font-bold" style={{ color: "var(--theme-accent)" }}>{step}</span>
                <h3
                  className="font-display"
                  style={{ color: "var(--theme-foreground)", fontSize: "clamp(1.85rem, 3.5vw, 2.35rem)", lineHeight: 1.12 }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl p-6 sm:p-8" style={{ border: "1px solid rgba(247,178,27,0.2)", backgroundColor: "rgba(247,178,27,0.04)" }}>
            <p className="text-xs uppercase tracking-widest mb-6 text-center font-semibold" style={{ color: "var(--theme-accent)" }}>
              Research sources per scan
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {RESEARCH_SOURCES_PER_SCAN.map((src) => (
                <a
                  key={src.name}
                  href={src.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl p-4 flex flex-col gap-2 transition-opacity hover:opacity-95"
                  style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
                >
                  <span className="flex items-center gap-3 min-h-[2.5rem] group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${src.domain}&sz=32`}
                      alt=""
                      width={28}
                      height={28}
                      className="rounded-lg shrink-0 ring-1 ring-white/10"
                    />
                    <span className="text-sm font-medium leading-snug group-hover:underline underline-offset-2" style={{ color: "var(--theme-foreground)" }}>
                      {src.name}
                    </span>
                  </span>
                  <span className="text-xs font-medium inline-flex items-center gap-1" style={{ color: "var(--theme-accent)" }}>
                    Open source <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent scans — fed from completed paid reports; duplicate domains reuse cached results within 7 days */}
      <section
        className="px-6 py-20"
        style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.45fr)] lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: "var(--theme-accent)" }}>
                Recent scan results
              </p>
              <h2
                className="font-display mb-3"
                style={{ fontSize: "clamp(2.8rem, 5vw, 4.5rem)", color: "var(--theme-foreground)", lineHeight: 1 }}
              >
                The payoff should look like evidence, not a receipt.
              </h2>
              <p className="text-sm max-w-2xl" style={{ color: "var(--theme-muted)" }}>
                Live reports from paid scans. Each card shows the verdict, proof density, strongest signal,
                and biggest gap before you open the full report.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-4" style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-muted)" }}>Scans</p>
                <p className="font-score mt-2 text-4xl" style={{ color: "var(--theme-foreground)" }}>{recentScans.length}</p>
              </div>
              <div className="rounded-2xl p-4" style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-muted)" }}>Avg</p>
                <p className="font-score mt-2 text-4xl" style={{ color: "var(--theme-accent)" }}>
                  {recentScans.length
                    ? Math.round(recentScans.reduce((sum, scan) => sum + scan.score, 0) / recentScans.length)
                    : 0}
                </p>
              </div>
              <div className="rounded-2xl p-4" style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-muted)" }}>Proof</p>
                <p className="font-score mt-2 text-4xl" style={{ color: "#4ade80" }}>
                  {recentScans.reduce((sum, scan) => sum + scan.sources, 0)}
                </p>
              </div>
            </div>
          </div>
          {recentScans.length === 0 ? (
            <div
              className="rounded-xl p-8 text-center"
              style={{ border: "1px dashed var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
            >
              <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
                No public scans yet. Run one above — completed reports appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              {recentScans.map((scan) => {
                const color = scan.grade.startsWith("A") ? "#4ade80" : scan.grade.startsWith("B") ? "#60a5fa" : scan.grade.startsWith("C") ? "#facc15" : "#f87171";
                return (
                  <a
                    key={scan.id}
                    href={`/scan/${scan.id}`}
                    className="group overflow-hidden rounded-[1.75rem] border transition-opacity hover:opacity-92"
                    style={{
                      borderColor: "var(--theme-border)",
                      background:
                        "linear-gradient(180deg, color-mix(in srgb, var(--theme-panel) 92%, transparent), color-mix(in srgb, var(--theme-background) 60%, var(--theme-panel)))",
                    }}
                  >
                    <div className="relative p-5">
                      <div
                        className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-70"
                        style={{
                          background: `radial-gradient(circle at top right, ${color}30, transparent 60%)`,
                        }}
                      />
                      <div className="relative flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <span
                            aria-hidden
                            className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-xl text-xs font-bold ring-1 ring-white/10"
                            style={{ backgroundColor: `${color}22`, color }}
                          >
                            {domainInitials(scan.domain)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
                              {scan.domain}
                            </p>
                            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-muted)" }}>
                              {scan.sources} sources · {scan.red_flags} risk signals
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-score leading-none" style={{ color, fontSize: "2.6rem" }}>{scan.grade}</div>
                          <div className="font-score text-sm mt-1" style={{ color: "var(--theme-muted)" }}>{scan.score}</div>
                        </div>
                      </div>

                      <div className="relative mt-6">
                        <h3 className="font-display text-3xl leading-[1.02]" style={{ color: "var(--theme-foreground)" }}>
                          {scan.headline}
                        </h3>
                        <p className="mt-3 line-clamp-3 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                          {scan.one_liner}
                        </p>
                      </div>

                      <div className="relative mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border p-3" style={{ borderColor: "var(--theme-border)", backgroundColor: "rgba(14,14,7,0.45)" }}>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#4ade80" }}>Strongest</p>
                          <p className="mt-2 truncate text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>{scan.strongest_label}</p>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--theme-border)" }}>
                            <div className="h-full rounded-full" style={{ width: `${scan.strongest_score}%`, backgroundColor: "#4ade80" }} />
                          </div>
                        </div>
                        <div className="rounded-2xl border p-3" style={{ borderColor: "var(--theme-border)", backgroundColor: "rgba(14,14,7,0.45)" }}>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "#facc15" }}>Gap</p>
                          <p className="mt-2 truncate text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>{scan.weakest_label}</p>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--theme-border)" }}>
                            <div className="h-full rounded-full" style={{ width: `${scan.weakest_score}%`, backgroundColor: "#facc15" }} />
                          </div>
                        </div>
                      </div>

                      <div className="relative mt-5 flex items-center justify-between gap-3">
                        <span className="text-xs" style={{ color: "var(--theme-muted)" }}>
                          {new Date(scan.created_at).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold" style={{ color: "var(--theme-accent)" }}>
                          Open report <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Blog preview */}
      <section className="px-6 py-20" style={{ borderTop: "1px solid var(--theme-border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <h2
              className="font-display"
              style={{ fontSize: "clamp(2.5rem, 4.5vw, 3.5rem)", color: "var(--theme-foreground)" }}
            >
              From the blog
            </h2>
            <Link href="/blog" className="text-xs hover:opacity-80 transition-opacity" style={{ color: "var(--theme-accent)" }}>
              All posts →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { slug: "visual-design", title: "Visual Design Is a Trust Signal, Not Just Aesthetics", date: "Apr 2026" },
              { slug: "business-legitimacy", title: "How We Score Business Legitimacy — And Why It's 18% of Your Grade", date: "Apr 2026" },
              { slug: "ux-conversion", title: "The Conversion-Killing UX Mistakes That Make Buyers Bounce", date: "Apr 2026" },
            ].map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="rounded-xl p-5 space-y-3 hover:opacity-80 transition-opacity"
                style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
              >
                <p className="text-xs" style={{ color: "var(--theme-accent)" }}>{post.date}</p>
                <p className="text-sm font-semibold leading-snug" style={{ color: "var(--theme-foreground)" }}>
                  {post.title}
                </p>
                <p className="text-xs" style={{ color: "var(--theme-muted)" }}>Read more →</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="px-6 py-20 text-center"
        style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-2xl mx-auto space-y-6">
          <h2
            className="font-display"
            style={{ fontSize: "clamp(3.5rem, 7vw, 5.5rem)", color: "var(--theme-foreground)" }}
          >
            See how any site{" "}
            <span style={{ color: "var(--theme-accent)" }}>really scores.</span>
          </h2>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            Before you buy, partner, or hire — know what the AI finds. $1, no account required.
          </p>
          <div className="max-w-lg mx-auto">
            <ScanForm showTierSelect defaultTier={defaultTier} tierMode={tierMode} />
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 60%, transparent)" }}>
            <span>$1 per report</span>
            <span>·</span>
            <span>No subscription</span>
            <span>·</span>
            <span>Refunded if scan fails</span>
            <span>·</span>
            <a href="/pricing" className="hover:opacity-80">Volume discounts →</a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
