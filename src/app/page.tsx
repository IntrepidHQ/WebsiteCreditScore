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
      <div className="operator-micro-scene relative aspect-[4/3] overflow-hidden rounded-[14px] border" style={sceneStyle}>
        <div className="operator-depth-light" />
        <svg className="operator-scene-svg" viewBox="0 0 320 160" role="img" aria-label="Perspective rubric board inspecting a website score workflow">
          <defs>
            <pattern id="operator-dot-grid-view" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.65" fill="rgba(237,232,212,0.24)" />
            </pattern>
            <linearGradient id="operator-board-view" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.14)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
            </linearGradient>
            <filter id="operator-soft-shadow-view" x="-20%" y="-20%" width="140%" height="150%">
              <feDropShadow dx="0" dy="10" stdDeviation="9" floodColor="rgba(0,0,0,0.46)" />
            </filter>
          </defs>
          <polygon points="26,33 222,18 278,132 54,139" fill="url(#operator-dot-grid-view)" opacity="0.55" />
          <polygon points="31,35 219,21 271,128 58,135" fill="url(#operator-board-view)" stroke="rgba(255,255,255,0.13)" strokeWidth="1" filter="url(#operator-soft-shadow-view)" />
          <g opacity="0.42">
            <path d="M55 38 L80 135 M90 35 L112 134 M126 32 L145 132 M162 29 L178 130 M198 25 L213 128" stroke="rgba(237,232,212,0.16)" strokeWidth="1" />
            <path d="M42 57 L230 45 M48 80 L241 70 M55 104 L255 97 M63 125 L268 121" stroke="rgba(237,232,212,0.13)" strokeWidth="1" />
          </g>
          <g className="operator-board-tiles" fontSize="7" fontWeight="700">
            <g transform="translate(59 51)">
              <rect width="45" height="24" rx="5" fill="rgba(0,0,0,0.45)" stroke="rgba(255,255,255,0.14)" />
              <text x="7" y="10" fill="rgba(237,232,212,0.66)">Trust</text><text x="7" y="20" fill={color}>88</text>
            </g>
            <g transform="translate(125 42)">
              <rect width="53" height="24" rx="5" fill="rgba(0,0,0,0.38)" stroke="rgba(255,255,255,0.13)" />
              <text x="7" y="10" fill="rgba(237,232,212,0.66)">Friction</text><text x="7" y="20" fill={color}>42</text>
            </g>
            <g transform="translate(83 94)">
              <rect width="45" height="24" rx="5" fill="rgba(0,0,0,0.42)" stroke="rgba(255,255,255,0.13)" />
              <text x="7" y="10" fill="rgba(237,232,212,0.66)">Proof</text><text x="7" y="20" fill={color}>73</text>
            </g>
            <g transform="translate(171 87)">
              <rect width="46" height="24" rx="5" fill={`${color}24`} stroke={`${color}88`} />
              <text x="7" y="10" fill="rgba(237,232,212,0.78)">Taste</text><text x="7" y="20" fill={color}>91</text>
            </g>
            <g transform="translate(195 55)">
              <rect width="45" height="24" rx="5" fill="rgba(0,0,0,0.36)" stroke="rgba(255,255,255,0.13)" />
              <text x="7" y="10" fill="rgba(237,232,212,0.66)">Intent</text><text x="7" y="20" fill={color}>67</text>
            </g>
          </g>
          <g className="operator-lens-svg">
            <circle cx="232" cy="66" r="26" fill="rgba(0,0,0,0.32)" stroke={`${color}cc`} strokeWidth="1" />
            <circle cx="232" cy="66" r="14" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1" />
            <path d="M251 83 L270 101" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
          </g>
          <path className="operator-elbow-path operator-elbow-path-a" d="M207 66 H183 V99 H171" />
          <path className="operator-elbow-path operator-elbow-path-b" d="M212 57 H180 V54 H178" />
          <path className="operator-elbow-path operator-elbow-path-c" d="M222 91 V110 H128" />
          <g transform="translate(227 121)">
            <rect width="66" height="19" rx="9.5" fill="rgba(0,0,0,0.48)" stroke="rgba(255,255,255,0.11)" />
            <circle cx="12" cy="9.5" r="3" fill={color} />
            <text x="20" y="12" fill={color} fontSize="8" fontWeight="700">POV model</text>
          </g>
        </svg>
      </div>
    );
  }

  if (type === "audit") {
    return (
      <div className="operator-micro-scene relative aspect-[4/3] overflow-hidden rounded-[14px] border p-3" style={sceneStyle}>
        <div className="operator-depth-light" />
        <div className="operator-surface-panel absolute inset-x-4 bottom-4 top-4 overflow-hidden rounded-[12px]">
          <div className="operator-slide-track flex h-full w-[300%]">
            <div className="relative h-full w-1/3">
              <svg className="operator-slide-svg" viewBox="0 0 286 96" aria-hidden>
                <defs>
                  <pattern id="operator-dot-grid-scan" width="9" height="9" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.55" fill="rgba(237,232,212,0.22)" />
                  </pattern>
                </defs>
                <rect width="286" height="96" fill="url(#operator-dot-grid-scan)" opacity="0.46" />
                <rect x="20" y="30" width="72" height="42" rx="8" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.13)" />
                <text x="32" y="44" fill="rgba(237,232,212,0.72)" fontSize="8" fontWeight="700">UX</text>
                <text x="32" y="56" fill="rgba(237,232,212,0.52)" fontSize="7">CTA found</text>
                <text x="32" y="67" fill={color} fontSize="7" fontWeight="700">low friction</text>
                <rect x="106" y="25" width="72" height="50" rx="10" fill="rgba(0,0,0,0.35)" stroke="rgba(255,255,255,0.13)" />
                <text x="118" y="39" fill="rgba(237,232,212,0.72)" fontSize="8" fontWeight="700">Proof</text>
                <text x="118" y="51" fill="rgba(237,232,212,0.52)" fontSize="7">bio linked</text>
                <text x="118" y="63" fill={color} fontSize="7" fontWeight="700">sources 18</text>
                <circle cx="226" cy="50" r="29" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
                <circle cx="226" cy="50" r="29" fill="none" stroke={color} strokeWidth="8" strokeDasharray="137 182" strokeLinecap="round" transform="rotate(-90 226 50)" />
                <circle cx="226" cy="50" r="19" fill="rgba(0,0,0,0.58)" stroke="rgba(255,255,255,0.12)" />
                <text x="226" y="54" textAnchor="middle" fill={color} fontSize="17" fontWeight="800">7.5</text>
              </svg>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color }}>Scan</div>
            </div>
            <div className="relative h-full w-1/3">
              <svg className="operator-slide-svg" viewBox="0 0 286 96" aria-hidden>
                <defs>
                  <pattern id="operator-dot-grid-plan" width="9" height="9" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.55" fill="rgba(237,232,212,0.22)" />
                  </pattern>
                </defs>
                <rect width="286" height="96" fill="url(#operator-dot-grid-plan)" opacity="0.46" />
                <rect x="110" y="33" width="66" height="31" rx="8" fill={`${color}20`} stroke={`${color}88`} />
                <text x="143" y="46" textAnchor="middle" fill={color} fontSize="9" fontWeight="800">Priority</text>
                <text x="143" y="57" textAnchor="middle" fill="rgba(237,232,212,0.5)" fontSize="6.5">fix first</text>
                <path className="operator-elbow-path" d="M110 48 H74 V24 H51" />
                <path className="operator-elbow-path" d="M110 48 H75 V74 H52" />
                <path className="operator-elbow-path" d="M176 48 H211 V24 H234" />
                <path className="operator-elbow-path" d="M176 48 H211 V74 H234" />
                {[
                  ["Rewrite", 16, 15, "headline"],
                  ["Proof", 17, 65, "logos + bio"],
                  ["CTA", 229, 15, "start scan"],
                  ["Layout", 225, 65, "above fold"],
                ].map(([label, x, y, note]) => (
                  <g key={label as string} transform={`translate(${x} ${y})`}>
                    <rect width="50" height="20" rx="6" fill="rgba(0,0,0,0.44)" stroke="rgba(255,255,255,0.13)" />
                    <text x="25" y="9" textAnchor="middle" fill="rgba(237,232,212,0.72)" fontSize="7" fontWeight="700">{label}</text>
                    <text x="25" y="17" textAnchor="middle" fill="rgba(237,232,212,0.38)" fontSize="5.7">{note}</text>
                  </g>
                ))}
              </svg>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color }}>Plan</div>
            </div>
            <div className="relative h-full w-1/3">
              <svg className="operator-slide-svg" viewBox="0 0 286 96" aria-hidden>
                <defs>
                  <pattern id="operator-dot-grid-ship" width="9" height="9" patternUnits="userSpaceOnUse">
                    <circle cx="1" cy="1" r="0.55" fill="rgba(237,232,212,0.22)" />
                  </pattern>
                </defs>
                <rect width="286" height="96" fill="url(#operator-dot-grid-ship)" opacity="0.42" />
                <g transform="translate(48 19)">
                  <path d="M12 0 H178 Q190 0 190 12 V58 Q190 70 178 70 H12 Q0 70 0 58 V12 Q0 0 12 0Z" fill="rgba(0,0,0,0.46)" stroke="rgba(255,255,255,0.14)" />
                  <path d="M1 15 H189" stroke="rgba(255,255,255,0.12)" />
                  <circle cx="13" cy="8" r="2.2" fill="#4ade80" />
                  <text x="22" y="10" fill="rgba(237,232,212,0.62)" fontSize="7" fontWeight="700">Published</text>
                  <rect x="14" y="27" width="64" height="8" rx="4" fill={color} opacity="0.78" />
                  <rect x="14" y="41" width="44" height="6" rx="3" fill="rgba(237,232,212,0.18)" />
                  <rect x="96" y="26" width="31" height="31" rx="6" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.08)" />
                  <rect x="134" y="26" width="31" height="31" rx="6" fill={`${color}30`} stroke={`${color}66`} />
                  <path d="M75 62 H105 V54 H134" className="operator-elbow-path" />
                  <text x="146" y="67" fill="#4ade80" fontSize="7" fontWeight="700">live</text>
                </g>
              </svg>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color }}>Ship</div>
              <div className="operator-publish-dot absolute right-8 top-8 h-2.5 w-2.5 rounded-full bg-[#4ade80]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="operator-micro-scene relative aspect-[4/3] overflow-hidden rounded-[14px] border p-3" style={sceneStyle}>
      <div className="operator-depth-light" />
      <svg className="operator-scene-svg" viewBox="0 0 320 160" role="img" aria-label="Human-supervised agent workflow with research, taste, and build panels">
        <defs>
          <pattern id="operator-dot-grid-supervision" width="10" height="10" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="rgba(237,232,212,0.22)" />
          </pattern>
          <filter id="operator-soft-shadow-supervision" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="9" stdDeviation="8" floodColor="rgba(0,0,0,0.42)" />
          </filter>
        </defs>
        <rect x="16" y="16" width="288" height="128" rx="13" fill="url(#operator-dot-grid-supervision)" opacity="0.44" />
        <rect x="24" y="21" width="272" height="31" rx="9" fill="rgba(0,0,0,0.38)" stroke="rgba(255,255,255,0.12)" filter="url(#operator-soft-shadow-supervision)" />
        <circle cx="40" cy="36.5" r="4.5" fill={color} />
        <text x="52" y="39.5" fill="rgba(237,232,212,0.62)" fontSize="8" fontWeight="800" letterSpacing="1.2">AGENT CONSOLE</text>
        <rect x="216" y="28" width="61" height="16" rx="8" fill={`${color}20`} stroke={`${color}66`} />
        <path d="M226 36 L231 41 L241 30" stroke={color} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="248" y="39.5" textAnchor="middle" fill={color} fontSize="7" fontWeight="800">approved</text>
        <path className="operator-elbow-path" d="M93 76 V62 H72 V52" />
        <path className="operator-elbow-path" d="M160 76 V58 H160 V52" />
        <path className="operator-elbow-path" d="M227 76 V62 H248 V52" />
        {[
          ["Research", "source checked", "46", 31, "#60a5fa"],
          ["Taste", "revise CTA", "33", 118, color],
          ["Build", "ship ready", "41", 205, "#4ade80"],
        ].map(([label, note, width, x, accent]) => (
          <g key={label as string} className="operator-console-svg-card" transform={`translate(${x} 82)`}>
            <rect width="76" height="47" rx="9" fill="rgba(0,0,0,0.42)" stroke="rgba(255,255,255,0.13)" />
            <text x="10" y="14" fill="rgba(237,232,212,0.72)" fontSize="7.5" fontWeight="800">{label}</text>
            <circle cx="63" cy="12" r="3.2" fill={accent as string} opacity="0.9" />
            <text x="10" y="27" fill="rgba(237,232,212,0.42)" fontSize="6.5">{note}</text>
            <rect x="10" y="35" width="56" height="4" rx="2" fill="rgba(255,255,255,0.1)" />
            <rect x="10" y="35" width={width as string} height="4" rx="2" fill={accent as string} opacity="0.74" />
          </g>
        ))}
      </svg>
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
                            className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center overflow-hidden rounded-xl text-xs font-bold ring-1 ring-white/10"
                            style={{ backgroundColor: `${color}22`, color }}
                          >
                            <span>{domainInitials(scan.domain)}</span>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(scan.domain)}&sz=64`}
                              alt=""
                              className="absolute inset-0 h-full w-full bg-black/20 object-contain p-1.5"
                            />
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
