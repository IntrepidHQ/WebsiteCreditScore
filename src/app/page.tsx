import { getRecentScans } from "@/lib/db/scans";
import { ScanForm } from "@/components/ScanForm";
import { QuantumWeb } from "@/components/QuantumWeb";
import { NavBar } from "@/components/NavBar";
import { ScrollToTop } from "@/components/ScrollToTop";
import {
  Building2, Star, Palette, MousePointer2,
  Eye, Zap, FileText, Share2, Clock, TrendingUp,
  CheckCircle2, ArrowRight,
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

// ── SVG Radar chart (static, Apple data) ──────────────────────────────────
function RadarChart() {
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 88;
  const scores = ANGLES.map((a) => a.score / 100);
  const N = scores.length;

  function pt(i: number, r: number) {
    const angle = (i / N) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const scorePath = scores.map((s, i) => {
    const { x, y } = pt(i, s * maxR);
    return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
      {/* Grid rings */}
      {gridLevels.map((level) => {
        const ringPts = Array.from({ length: N }, (_, i) => pt(i, level * maxR));
        const d = ringPts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") + " Z";
        return <path key={level} d={d} fill="none" stroke="rgba(247,178,27,0.08)" strokeWidth={1} />;
      })}
      {/* Spokes */}
      {Array.from({ length: N }, (_, i) => {
        const outer = pt(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(1)} y2={outer.y.toFixed(1)} stroke="rgba(247,178,27,0.06)" strokeWidth={1} />;
      })}
      {/* Score polygon */}
      <path d={scorePath} fill="rgba(247,178,27,0.12)" stroke="rgba(247,178,27,0.5)" strokeWidth={1.5} />
      {/* Dimension dots */}
      {ANGLES.map((a, i) => {
        const s = a.score / 100;
        const { x, y } = pt(i, s * maxR);
        return (
          <circle key={a.key} cx={x.toFixed(1)} cy={y.toFixed(1)} r={4} fill={a.color} fillOpacity={0.9} />
        );
      })}
      {/* Grade in center */}
      <circle cx={cx} cy={cy} r={22} fill="#000" />
      <circle cx={cx} cy={cy} r={22} fill="none" stroke="rgba(247,178,27,0.3)" strokeWidth={1} />
      <text
        x={cx}
        y={cy + 6}
        textAnchor="middle"
        fontSize={16}
        fontWeight="bold"
        fontFamily="monospace"
        fill="#f7b21b"
      >
        A
      </text>
    </svg>
  );
}

// ── Angle card (styled like screenshot) ───────────────────────────────────
function AngleCard({ angle }: { angle: typeof ANGLES[number] }) {
  const Icon = angle.icon;
  const lbl = gradeLabel(angle.grade);
  const lblColor = gradeToColor(angle.grade);
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
      style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
    >
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${angle.color}18`, border: `1px solid ${angle.color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: angle.color }} />
        </div>
        <span
          className="font-mono text-3xl font-bold leading-none"
          style={{ color: angle.color }}
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
        <span className="text-xs font-mono" style={{ color: "var(--theme-muted)" }}>
          {angle.score / 10} / 10
        </span>
      </div>
    </div>
  );
}

// ── Hero preview card (Apple.com) ─────────────────────────────────────────
function HeroPreviewCard() {
  const topTwo = ANGLES.slice(2, 4); // Visual Design + UX/Conversion
  return (
    <div
      className="rounded-2xl overflow-hidden w-full max-w-lg"
      style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)", boxShadow: "0 32px 80px rgba(0,0,0,0.4)" }}
    >
      {/* Browser bar */}
      <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: "var(--theme-elevated)", borderBottom: "1px solid var(--theme-border)" }}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
        </div>
        <div className="flex-1 mx-3 rounded-md px-3 py-1 text-xs font-mono" style={{ backgroundColor: "var(--theme-panel)", color: "var(--theme-muted)" }}>
          apple.com
        </div>
      </div>

      {/* Site preview placeholder — stylized Apple.com impression */}
      <div
        className="relative h-44 flex flex-col items-center justify-center gap-2 overflow-hidden"
        style={{ backgroundColor: "#f5f5f7" }}
      >
        <div className="text-[#1d1d1f] text-2xl font-bold tracking-tight">iPhone</div>
        <div className="text-[#6e6e73] text-xs">Meet the latest iPhone lineup.</div>
        <div className="flex gap-2 mt-1">
          <div className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#0071e3", color: "#fff" }}>Learn more</div>
          <div className="px-3 py-1 rounded-full text-xs font-medium border border-[#0071e3] text-[#0071e3]">Shop iPhone</div>
        </div>
        {/* Subtle overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-8" style={{ background: "linear-gradient(transparent, rgba(28,27,14,0.15))" }} />
      </div>

      {/* Score section */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid var(--theme-border)" }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--theme-muted)" }}>
              LIVE PROOF
            </p>
            <p className="font-display text-2xl" style={{ color: "var(--theme-foreground)" }}>Apple</p>
            <p className="text-xs mt-0.5" style={{ color: "var(--theme-muted)" }}>
              Category-defining restraint — the homepage feels like a product gallery with editorial confidence.
            </p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <span
              className="text-xs font-bold px-2 py-1 rounded-full"
              style={{ backgroundColor: "#4ade8020", color: "#4ade80", border: "1px solid #4ade8040" }}
            >
              EXCELLENT
            </span>
            <div className="mt-2">
              <div className="text-2xl font-mono font-bold" style={{ color: "#4ade80" }}>9.6</div>
              <div className="text-xs" style={{ color: "var(--theme-muted)" }}>/10</div>
            </div>
          </div>
        </div>

        {/* Top 2 dimension bars */}
        <div className="space-y-3">
          {topTwo.map((dim) => (
            <div key={dim.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium" style={{ color: "var(--theme-foreground)" }}>
                  {dim.label}
                </span>
                <span className="text-xs font-mono font-semibold" style={{ color: dim.color }}>
                  {(dim.score / 10).toFixed(1)}/10
                </span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "var(--theme-border)" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${dim.score}%`, backgroundColor: dim.color, opacity: 0.8 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Platform trust logos ──────────────────────────────────────────────────
const SOURCES = [
  { name: "Google Reviews", domain: "google.com" },
  { name: "Trustpilot",     domain: "trustpilot.com" },
  { name: "Reddit",         domain: "reddit.com" },
  { name: "BBB",            domain: "bbb.org" },
  { name: "LinkedIn",       domain: "linkedin.com" },
  { name: "Glassdoor",      domain: "glassdoor.com" },
  { name: "BuiltWith",      domain: "builtwith.com" },
  { name: "SSL Labs",       domain: "ssllabs.com" },
  { name: "Crunchbase",     domain: "crunchbase.com" },
  { name: "Wayback Machine",domain: "archive.org" },
];

// ── Page ──────────────────────────────────────────────────────────────────
type Tier = "quick" | "standard" | "deep";
function isValidTier(t: unknown): t is Tier {
  return t === "quick" || t === "standard" || t === "deep";
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string }>;
}) {
  const { tier: rawTier } = await searchParams;
  const defaultTier: Tier = isValidTier(rawTier) ? rawTier : "quick";
  const recentScans = await getRecentScans(6).catch(() => []);

  return (
    <main className="min-h-screen flex flex-col" style={{ backgroundColor: "var(--theme-background)" }}>
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

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left */}
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
              className="font-display leading-[0.94]"
              style={{ fontSize: "clamp(3rem,7vw,5rem)", color: "var(--theme-foreground)" }}
            >
              Trust nothing.{" "}
              <span style={{ color: "var(--theme-accent)" }}>Verify everything.</span>
            </h1>

            <p className="text-base leading-relaxed max-w-md" style={{ color: "var(--theme-muted)" }}>
              Score the live site, see where it is leaking trust or momentum,
              and get a clearer plan for what to improve first. Ten angles. One verdict.
            </p>

            <div className="space-y-3">
              <ScanForm large showTierSelect defaultTier={defaultTier} />
              <p className="text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 55%, transparent)" }}>
                Instant results · No account needed · Score, breakdown, and action brief
              </p>
            </div>

            {/* Source logos */}
            <div className="pt-2">
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "color-mix(in srgb, var(--theme-muted) 50%, transparent)" }}>
                Researches across
              </p>
              <div className="flex flex-wrap gap-2">
                {SOURCES.map((src) => (
                  <span
                    key={src.name}
                    className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                    style={{ border: "1px solid var(--theme-border)", color: "var(--theme-muted)", backgroundColor: "color-mix(in srgb, var(--theme-panel) 40%, transparent)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${src.domain}&sz=16`}
                      alt=""
                      width={12}
                      height={12}
                      className="rounded-sm opacity-80"
                    />
                    {src.name}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right — preview card */}
          <div className="flex justify-center lg:justify-end">
            <HeroPreviewCard />
          </div>
        </div>
      </section>

      {/* Ten angles */}
      <section
        className="px-6 py-20"
        style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-14">
            <div>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--theme-accent)" }}>
                Scoring methodology
              </p>
              <h2
                className="font-display leading-tight"
                style={{ fontSize: "clamp(2rem,4vw,3rem)", color: "var(--theme-foreground)" }}
              >
                The score rewards clarity, trust, and momentum — not just polish
              </h2>
            </div>
            <div className="flex flex-col justify-center gap-6">
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                A better-looking redesign is not the point. The point is to see where your current site is hiding value, weakening trust, or making ready buyers hesitate.
              </p>
              <div className="flex items-center gap-4">
                <RadarChart />
                <div className="space-y-2">
                  {ANGLES.slice(0, 5).map((a) => (
                    <div key={a.key} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: a.color }} />
                      <span style={{ color: "var(--theme-muted)" }}>{a.label}</span>
                    </div>
                  ))}
                  <p className="text-xs pt-1" style={{ color: "color-mix(in srgb, var(--theme-muted) 50%, transparent)" }}>+ 5 more angles</p>
                </div>
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
            style={{ fontSize: "clamp(2rem,4vw,2.8rem)", color: "var(--theme-foreground)" }}
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
                  className="font-display text-xl"
                  style={{ color: "var(--theme-foreground)" }}
                >
                  {title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>{body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-2xl p-6" style={{ border: "1px solid rgba(247,178,27,0.2)", backgroundColor: "rgba(247,178,27,0.04)" }}>
            <p className="text-xs uppercase tracking-widest mb-4 text-center" style={{ color: "var(--theme-accent)" }}>
              Research sources per scan
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Google Reviews", "Trustpilot", "BBB", "Reddit", "LinkedIn", "X / Twitter", "Crunchbase", "SSL Labs", "PageSpeed", "Wayback Machine", "BuiltWith", "Glassdoor"].map((src) => (
                <div
                  key={src}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs"
                  style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)", color: "var(--theme-muted)" }}
                >
                  <CheckCircle2 className="w-3 h-3" style={{ color: "var(--theme-accent)" }} />
                  {src}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent scans */}
      {recentScans.length > 0 && (
        <section
          className="px-6 py-20"
          style={{ borderTop: "1px solid var(--theme-border)", backgroundColor: "var(--theme-background-alt)" }}
        >
          <div className="max-w-5xl mx-auto">
            <h2
              className="font-display mb-2"
              style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--theme-foreground)" }}
            >
              Recent scans
            </h2>
            <p className="text-sm mb-8" style={{ color: "var(--theme-muted)" }}>
              Live reports generated by the WebsiteCreditScore AI.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentScans.map((scan) => {
                const color = scan.grade.startsWith("A") ? "#4ade80" : scan.grade.startsWith("B") ? "#60a5fa" : scan.grade.startsWith("C") ? "#facc15" : "#f87171";
                return (
                  <a
                    key={scan.id}
                    href={`/scan/${scan.id}`}
                    className="rounded-xl p-4 flex items-center gap-4 hover:opacity-80 transition-opacity"
                    style={{ border: "1px solid var(--theme-border)", backgroundColor: "var(--theme-panel)" }}
                  >
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${scan.domain}&sz=48`}
                      alt={scan.domain}
                      width={32}
                      height={32}
                      className="rounded-md"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--theme-foreground)" }}>
                        {scan.domain}
                      </p>
                      <p className="text-xs truncate mt-0.5" style={{ color: "var(--theme-muted)" }}>
                        {scan.headline}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-mono text-lg font-bold" style={{ color }}>{scan.grade}</div>
                      <div className="font-mono text-xs" style={{ color: "var(--theme-muted)" }}>{scan.score}</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Blog preview */}
      <section className="px-6 py-20" style={{ borderTop: "1px solid var(--theme-border)" }}>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <h2
              className="font-display"
              style={{ fontSize: "clamp(1.5rem,3vw,2rem)", color: "var(--theme-foreground)" }}
            >
              From the blog
            </h2>
            <a href="/blog" className="text-xs hover:opacity-80 transition-opacity" style={{ color: "var(--theme-accent)" }}>
              All posts →
            </a>
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
            style={{ fontSize: "clamp(2.5rem,5vw,3.5rem)", color: "var(--theme-foreground)" }}
          >
            See how any site{" "}
            <span style={{ color: "var(--theme-accent)" }}>really scores.</span>
          </h2>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            Before you buy, partner, or hire — know what the AI finds. $1, no account required.
          </p>
          <div className="max-w-lg mx-auto">
            <ScanForm large showTierSelect defaultTier={defaultTier} />
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

      <footer
        className="px-6 py-8"
        style={{ borderTop: "1px solid var(--theme-border)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
            WebsiteCreditScore.com
          </span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 70%, transparent)" }}>
            <a href="/pricing" className="hover:opacity-80 transition-opacity">Pricing</a>
            <a href="/blog" className="hover:opacity-80 transition-opacity">Blog</a>
            <a href="/benchmarks" className="hover:opacity-80 transition-opacity">Benchmarks</a>
            <a href="/docs" className="hover:opacity-80 transition-opacity">Docs</a>
            <a href="/privacy" className="hover:opacity-80 transition-opacity">Privacy</a>
            <a href="/terms" className="hover:opacity-80 transition-opacity">Terms</a>
          </div>
          <p className="text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 50%, transparent)" }}>
            Not financial advice · AI research at time of scan
          </p>
        </div>
      </footer>
    </main>
  );
}
