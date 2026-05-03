"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  ChevronDown,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Search,
  Calendar,
  ArrowRight,
  Building2,
  Star,
  Palette,
  MousePointer2,
  Eye,
  Zap,
  FileText,
  Share2,
  Clock,
  TrendingUp,
  X,
} from "lucide-react";
import { DIMENSION_COLORS, gradeColor, gradeLabel, type DimensionKey, type WCSReport, type Grade } from "@/lib/schema";
import { buildStrategyCallCalendlyUrl, buildStrategyPresentationUrl } from "@/lib/strategy-call";

const scanReportCalendlyUrl = (domain: string) =>
  buildStrategyCallCalendlyUrl({ medium: "scan_report", content: domain });

const scanReportPresentationUrl = (domain: string) =>
  buildStrategyPresentationUrl({ medium: "scan_report", content: domain });

const panelClass = "rounded-2xl border";
const panelStyle: CSSProperties = {
  borderColor: "var(--theme-border)",
  backgroundColor: "var(--theme-panel)",
};
const readableWrapStyle: CSSProperties = {
  overflowWrap: "break-word",
  textWrap: "pretty",
};

// ── Types ─────────────────────────────────────────────────────────────────
interface Props {
  scanId: string;
  domain: string;
  initialStatus: string;
  initialResult: WCSReport | null;
}

interface StreamEvent {
  type: "search" | "result_count" | "done" | "error" | "cached";
  query?: string;
  count?: number;
  report?: WCSReport;
  error?: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md ${className ?? ""}`}
      style={{ backgroundColor: "color-mix(in srgb, var(--theme-border) 55%, transparent)" }}
    />
  );
}

function ReportSkeleton({ searches }: { searches: string[] }) {
  return (
    <div className="space-y-6">
      <div className={`${panelClass} p-6 flex gap-6`} style={panelStyle}>
        <Skeleton className="w-28 h-28 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-3 w-32" />
          {searches.length > 0 && (
            <div className="mt-3 space-y-1">
              {searches.slice(-3).map((q, i) => (
                <p key={i} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--theme-muted)" }}>
                  <Search className="w-3 h-3 flex-shrink-0" />
                  Searching: &ldquo;{q}&rdquo;
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// ── Dimension card ────────────────────────────────────────────────────────
function DimensionCard({ dim }: { dim: WCSReport["dimensions"][number] }) {
  const [open, setOpen] = useState(false);
  const color = gradeColor(dim.grade as Grade);

  return (
    <div className={`${panelClass} overflow-hidden`} style={panelStyle}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:[background-color:color-mix(in_srgb,var(--theme-accent)_7%,var(--theme-panel))]"
      >
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg font-mono text-sm font-bold"
          style={{ background: `${color}18`, color }}
        >
          {dim.grade}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" style={{ color: "var(--theme-foreground)" }}>
            {dim.label}
          </p>
          <div className="mt-1 h-1 overflow-hidden rounded-full" style={{ backgroundColor: "var(--theme-border)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${dim.score}%`, background: color }}
            />
          </div>
        </div>
        <span className="flex-shrink-0 font-score text-sm" style={{ color: "var(--theme-muted)" }}>
          {dim.score}
        </span>
        <ChevronDown
          className={`h-4 w-4 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          style={{ color: "var(--theme-muted)" }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 border-t px-4 pb-4" style={{ borderColor: "var(--theme-border)" }}>
              <p className="pt-3 text-sm leading-relaxed" style={{ color: "color-mix(in srgb, var(--theme-foreground) 88%, transparent)" }}>
                {dim.verdict}
              </p>
              {dim.evidence.length > 0 && (
                <div className="space-y-1.5">
                  {dim.evidence.map((ev, i) => (
                    <a
                      key={i}
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-2 text-xs transition-colors"
                      style={{ color: "var(--theme-muted)" }}
                    >
                      <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0 transition-colors group-hover:text-[#4ade80]" />
                      <span className="group-hover:text-[var(--theme-foreground)]">{ev.claim}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type ReportDimension = WCSReport["dimensions"][number];

const DIMENSION_ICONS: Record<DimensionKey, typeof Building2> = {
  legitimacy: Building2,
  reputation: Star,
  visual_design: Palette,
  ux_conversion: MousePointer2,
  transparency: Eye,
  technical: Zap,
  content: FileText,
  social_presence: Share2,
  longevity: Clock,
  financial_signals: TrendingUp,
};

function dimensionColor(dim: ReportDimension) {
  return DIMENSION_COLORS[dim.key] ?? gradeColor(dim.grade as Grade);
}

function scoreOutOfTen(score: number) {
  return (score / 10).toFixed(1);
}

function ScoreRadar({ report }: { report: WCSReport }) {
  const dimensions = report.dimensions;
  const size = 360;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = 128;
  const count = dimensions.length;
  const point = (index: number, radius: number) => {
    const angle = (index / count) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    };
  };

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${size} ${size}`}
      className="block max-w-[23rem]"
      preserveAspectRatio="xMidYMid meet"
      aria-label={`Overall score ${scoreOutOfTen(report.overall.score)} out of 10`}
    >
      <defs>
        {dimensions.map((dim, index) => {
          const next = dimensions[(index + 1) % count];
          return (
            <linearGradient key={dim.key} id={`scan-slice-grad-${dim.key}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={dimensionColor(dim)} stopOpacity="0.42" />
              <stop offset="100%" stopColor={dimensionColor(next)} stopOpacity="0.22" />
            </linearGradient>
          );
        })}
        <radialGradient id="scan-radar-glow" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stopColor="rgba(247,178,27,0.18)" />
          <stop offset="80%" stopColor="rgba(247,178,27,0)" />
        </radialGradient>
      </defs>

      <circle cx={cx} cy={cy} r={maxR + 10} fill="url(#scan-radar-glow)" />

      {[0.25, 0.5, 0.75, 1].map((level) => {
        const ringPoints = dimensions.map((_, index) => point(index, level * maxR));
        const path =
          ringPoints.map((p, index) => `${index === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ") +
          " Z";
        return <path key={level} d={path} fill="none" stroke="rgba(247,178,27,0.08)" strokeWidth={1} />;
      })}

      {dimensions.map((_, index) => {
        const outer = point(index, maxR);
        return (
          <line
            key={`spoke-${index}`}
            x1={cx}
            y1={cy}
            x2={outer.x.toFixed(1)}
            y2={outer.y.toFixed(1)}
            stroke="rgba(247,178,27,0.08)"
            strokeWidth={1}
          />
        );
      })}

      {dimensions.map((dim, index) => {
        const next = dimensions[(index + 1) % count];
        const p1 = point(index, (dim.score / 100) * maxR);
        const p2 = point((index + 1) % count, (next.score / 100) * maxR);
        const path = `M${cx},${cy} L${p1.x.toFixed(1)},${p1.y.toFixed(1)} L${p2.x.toFixed(1)},${p2.y.toFixed(1)} Z`;
        return (
          <path
            key={`slice-${dim.key}`}
            d={path}
            fill={`url(#scan-slice-grad-${dim.key})`}
            stroke={dimensionColor(dim)}
            strokeOpacity={0.55}
            strokeWidth={1.1}
            strokeLinejoin="round"
          />
        );
      })}

      {dimensions.map((dim, index) => {
        const { x, y } = point(index, (dim.score / 100) * maxR);
        const color = dimensionColor(dim);
        return (
          <g key={`score-${dim.key}`}>
            <circle cx={x} cy={y} r={14} fill="rgba(14,14,7,0.94)" stroke={color} strokeWidth={1.4} />
            <text
              x={x}
              y={y + 3.5}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fontFamily="'Instrument Serif', Georgia, serif"
              fill={color}
            >
              {Math.round(dim.score)}
            </text>
          </g>
        );
      })}

      <circle cx={cx} cy={cy} r={32} fill="rgba(14,14,7,0.96)" />
      <circle cx={cx} cy={cy} r={32} fill="none" stroke="rgba(247,178,27,0.36)" strokeWidth={1} />
      <text
        x={cx}
        y={cy - 1}
        textAnchor="middle"
        fontSize={22}
        fontWeight={400}
        fontFamily="'Instrument Serif', Georgia, serif"
        fill="#f7b21b"
      >
        {scoreOutOfTen(report.overall.score)}
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

function DimensionLegend({
  dimensions,
  onSelect,
}: {
  dimensions: ReportDimension[];
  onSelect: (dimension: ReportDimension) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-x-12 gap-y-3 sm:grid-cols-2">
      {dimensions.map((dim) => {
        const color = dimensionColor(dim);
        const Icon = DIMENSION_ICONS[dim.key];
        return (
          <button
            key={dim.key}
            type="button"
            onClick={() => onSelect(dim)}
            className="group flex items-center gap-3 rounded-xl py-1.5 text-left transition-opacity hover:opacity-85"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-transform group-hover:scale-105"
              style={{ borderColor: `${color}44`, backgroundColor: `${color}16`, color }}
            >
              <Icon className="h-4 w-4" aria-hidden />
            </span>
            <span className="text-sm" style={{ color: "var(--theme-foreground)" }}>
              {dim.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function DimensionScoreCard({
  dim,
  onSelect,
}: {
  dim: ReportDimension;
  onSelect: (dimension: ReportDimension) => void;
}) {
  const color = dimensionColor(dim);
  const Icon = DIMENSION_ICONS[dim.key];
  return (
    <button
      type="button"
      onClick={() => onSelect(dim)}
      className="group flex min-h-[14.5rem] flex-col rounded-2xl p-5 text-left transition-opacity hover:opacity-92 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--theme-background)]"
      style={{
        border: "1px solid var(--theme-border)",
        backgroundColor: "var(--theme-panel)",
        boxShadow: "0 20px 48px rgba(0,0,0,0.12)",
        "--tw-ring-color": color,
      } as CSSProperties}
      aria-label={`Open reasoning for ${dim.label}`}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
          style={{ borderColor: `${color}44`, backgroundColor: `${color}16`, color }}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <span className="font-score leading-none" style={{ color, fontSize: "clamp(2.15rem, 3vw, 3rem)" }}>
          {scoreOutOfTen(dim.score)}
        </span>
      </div>

      <div className="mt-5 min-w-0">
        <h3 className="text-sm font-semibold" style={{ color: "var(--theme-foreground)", ...readableWrapStyle }}>
          {dim.label}
        </h3>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
          {dim.verdict}
        </p>
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <span
          className="rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
          style={{ borderColor: `${gradeColor(dim.grade as Grade)}44`, backgroundColor: `${gradeColor(dim.grade as Grade)}16`, color: gradeColor(dim.grade as Grade) }}
        >
          {gradeLabel(dim.grade as Grade)}
        </span>
        <span className="font-score text-xs" style={{ color: "var(--theme-muted)" }}>
          {scoreOutOfTen(dim.score)}/10
        </span>
      </div>

      <span className="mt-5 inline-flex items-center gap-1.5 text-[11px] font-semibold transition-transform group-hover:translate-x-0.5" style={{ color: "var(--theme-accent)" }}>
        View reasoning <ArrowRight className="h-3 w-3" aria-hidden />
      </span>
    </button>
  );
}

function DimensionReasoningModal({
  dimension,
  onClose,
}: {
  dimension: ReportDimension;
  onClose: () => void;
}) {
  const color = dimensionColor(dimension);
  const Icon = DIMENSION_ICONS[dimension.key];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dimension-reasoning-title"
        className="max-h-[min(90vh,48rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border p-5 shadow-2xl sm:p-6"
        style={{
          borderColor: `color-mix(in srgb, ${color} 34%, var(--theme-border))`,
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--theme-panel) 94%, transparent), var(--theme-background-alt))",
        }}
        initial={{ y: 18, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 18, scale: 0.98 }}
        transition={{ duration: 0.18 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
              style={{ borderColor: `${color}44`, backgroundColor: `${color}16`, color }}
            >
              <Icon className="h-5 w-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-muted)" }}>
                Dimension reasoning
              </p>
              <h2 id="dimension-reasoning-title" className="mt-1 text-lg font-semibold" style={{ color: "var(--theme-foreground)" }}>
                {dimension.label}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-opacity hover:opacity-80"
            style={{ borderColor: "var(--theme-border)", color: "var(--theme-muted)" }}
            aria-label="Close reasoning"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-[8rem_minmax(0,1fr)]">
          <div className="rounded-2xl border p-4 text-center" style={panelStyle}>
            <p className="font-score leading-none" style={{ color, fontSize: "3.25rem" }}>
              {scoreOutOfTen(dimension.score)}
            </p>
            <p className="mt-1 font-score text-xs" style={{ color: "var(--theme-muted)" }}>
              /10
            </p>
            <span
              className="mt-4 inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em]"
              style={{ borderColor: `${gradeColor(dimension.grade as Grade)}44`, backgroundColor: `${gradeColor(dimension.grade as Grade)}16`, color: gradeColor(dimension.grade as Grade) }}
            >
              {gradeLabel(dimension.grade as Grade)}
            </span>
          </div>
          <div className="rounded-2xl border p-4" style={panelStyle}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-accent)" }}>
              Why it scored this way
            </p>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "color-mix(in srgb, var(--theme-foreground) 88%, transparent)", ...readableWrapStyle }}>
              {dimension.verdict}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border p-4" style={panelStyle}>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-accent)" }}>
            Evidence
          </p>
          {dimension.evidence.length ? (
            <div className="mt-3 space-y-2">
              {dimension.evidence.map((item, index) => (
                <a
                  key={`${item.url}-${index}`}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-2 rounded-lg p-2 text-xs transition-colors hover:[background-color:color-mix(in_srgb,var(--theme-accent)_7%,var(--theme-panel))]"
                  style={{ color: "var(--theme-muted)" }}
                >
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 transition-colors group-hover:text-[var(--theme-accent)]" aria-hidden />
                  <span className="leading-relaxed group-hover:text-[var(--theme-foreground)]">{item.claim}</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm" style={{ color: "var(--theme-muted)" }}>
              No source citations were attached to this dimension.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ScanResultSummary({ report }: { report: WCSReport }) {
  const [selectedDimension, setSelectedDimension] = useState<ReportDimension | null>(null);
  const closeReasoning = () => setSelectedDimension(null);

  return (
    <section className="space-y-10">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ borderColor: "#f7b21b44", backgroundColor: "#f7b21b12", color: "var(--theme-accent)" }}
        >
          Scan result
        </span>
        <span
          className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
          style={{ borderColor: `${gradeColor(report.overall.grade as Grade)}44`, backgroundColor: `${gradeColor(report.overall.grade as Grade)}14`, color: gradeColor(report.overall.grade as Grade) }}
        >
          {gradeLabel(report.overall.grade as Grade)}
        </span>
        <span className="text-xs" style={{ color: "var(--theme-muted)" }}>
          {report.domain} · {report.sources.length} sources
        </span>
      </div>

      <div className="grid items-center gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-14">
        <div className="flex justify-center lg:justify-start">
          <ScoreRadar report={report} />
        </div>
        <div className="space-y-8">
          <div className="max-w-3xl">
            <p className="text-base leading-relaxed sm:text-lg" style={{ color: "var(--theme-muted)", ...readableWrapStyle }}>
              {report.overall.one_liner}
            </p>
          </div>
          <DimensionLegend dimensions={report.dimensions} onSelect={setSelectedDimension} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {report.dimensions.map((dim) => (
          <DimensionScoreCard key={dim.key} dim={dim} onSelect={setSelectedDimension} />
        ))}
      </div>

      <AnimatePresence>
        {selectedDimension ? (
          <DimensionReasoningModal
            key={selectedDimension.key}
            dimension={selectedDimension}
            onClose={closeReasoning}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}

function StrategyPresentationUpsell({ domain }: { domain: string }) {
  const calUrl = scanReportCalendlyUrl(domain);
  const spUrl = scanReportPresentationUrl(domain);
  return (
    <div
      className={`${panelClass} overflow-hidden`}
      style={{
        borderColor: "color-mix(in srgb, var(--theme-accent) 35%, var(--theme-border))",
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--theme-accent) 14%, var(--theme-panel)), var(--theme-panel))",
      }}
    >
      <div className="space-y-4 p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: "var(--theme-accent)" }}>
              Free strategy presentation · This week
            </p>
            <h3 className="font-display text-2xl sm:text-3xl" style={{ color: "var(--theme-foreground)", lineHeight: 1.12 }}>
              Turn this scan for <span className="whitespace-nowrap">{domain}</span> into a decision-ready deck
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
              Book a <strong style={{ color: "var(--theme-foreground)" }}>Strategy Call</strong> — that booking triggers your{" "}
              <strong style={{ color: "var(--theme-foreground)" }}>Strategy Presentation</strong> build from this scan (priorities, proof, what to ship first).
              Remote by default; in-person when it fits your business.
            </p>
          </div>
          <div className="flex w-full flex-shrink-0 flex-col gap-2 sm:w-auto">
            <a
              href={calUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-bold transition-opacity hover:opacity-92"
              style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
            >
              <Calendar className="h-4 w-4" aria-hidden />
              Strategy Call — book 30 min →
            </a>
            <a
              href={spUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-xl border px-5 py-2.5 text-xs font-semibold transition-opacity hover:opacity-90"
              style={{
                borderColor: "var(--theme-border)",
                color: "var(--theme-foreground)",
                backgroundColor: "color-mix(in srgb, var(--theme-panel) 55%, transparent)",
              }}
            >
              strategypresentation.com — see the offer →
            </a>
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "color-mix(in srgb, var(--theme-muted) 92%, transparent)" }}>
          <strong style={{ color: "var(--theme-foreground)" }}>WebsiteCreditScore</strong> captures live trust signals;{" "}
          <strong style={{ color: "var(--theme-foreground)" }}>Strategy Presentation</strong> translates them into a narrative your team can act on.
        </p>
      </div>
    </div>
  );
}

function StrategyPresentationReminder({ domain }: { domain: string }) {
  const calUrl = scanReportCalendlyUrl(domain);
  const spUrl = scanReportPresentationUrl(domain);
  return (
    <div
      className={`${panelClass} flex flex-col items-stretch justify-between gap-3 p-4 sm:flex-row sm:items-center`}
      style={panelStyle}
    >
      <p className="text-sm font-medium" style={{ color: "var(--theme-foreground)" }}>
        Next step: <strong>Strategy Call</strong> → we produce your Strategy Presentation from this scan.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <a
          href={calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-center text-xs font-bold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
        >
          Strategy Call →
        </a>
        <a
          href={spUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-center text-xs font-semibold underline-offset-2 hover:underline"
          style={{ color: "var(--theme-muted)" }}
        >
          strategypresentation.com
        </a>
      </div>
    </div>
  );
}

// ── Main report ───────────────────────────────────────────────────────────
export function ReportContent({ report }: { report: WCSReport }) {
  const radarData = report.dimensions.map((d) => ({
    subject: d.label.split(" ")[0],
    score: d.score,
    fullMark: 100,
  }));

  const overallColor = gradeColor(report.overall.grade as Grade);

  return (
    <div className="space-y-6">
      <ScanResultSummary report={report} />

      <StrategyPresentationUpsell domain={report.domain} />

      {/* Radar + Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar chart */}
        <div className={`${panelClass} p-6`} style={panelStyle}>
          <h2 className="mb-4 text-sm font-medium" style={{ color: "var(--theme-muted)" }}>
            10 Dimensions
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="color-mix(in srgb, var(--theme-border) 80%, transparent)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "var(--theme-muted)", fontSize: 11 }}
              />
              <Radar
                name="Score"
                dataKey="score"
                stroke={overallColor}
                fill={overallColor}
                fillOpacity={0.12}
                strokeWidth={1.5}
              />
              <Tooltip
                contentStyle={{
                  background: "var(--theme-panel)",
                  border: "1px solid var(--theme-border)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "var(--theme-foreground)",
                }}
                formatter={(value: number) => [`${value}/100`, "Score"]}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Flags */}
        <div className="space-y-4">
          {/* Red flags */}
          {report.red_flags.length > 0 && (
            <div className={`${panelClass} border-red-500/20 p-4`} style={panelStyle}>
              <h2 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Red Flags ({report.red_flags.length})
              </h2>
              <div className="space-y-2">
                {report.red_flags.map((flag, i) => (
                  <div key={i} className="space-y-0.5">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-0.5 flex-shrink-0 text-xs px-1.5 py-0.5 rounded font-mono ${
                          flag.severity === "critical"
                            ? "bg-red-500/20 text-red-400"
                            : flag.severity === "high"
                            ? "bg-orange-500/20 text-orange-400"
                            : flag.severity === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-zinc-700 text-zinc-400"
                        }`}
                      >
                        {flag.severity}
                      </span>
                      <p className="text-sm font-medium" style={{ color: "var(--theme-foreground)" }}>
                        {flag.title}
                      </p>
                    </div>
                    <p className="pl-10 text-xs" style={{ color: "var(--theme-muted)" }}>
                      {flag.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Green flags */}
          {report.green_flags.length > 0 && (
            <div className={`${panelClass} border-emerald-500/20 p-4`} style={panelStyle}>
              <h2 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Green Flags ({report.green_flags.length})
              </h2>
              <div className="space-y-2">
                {report.green_flags.map((flag, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-sm font-medium" style={{ color: "var(--theme-foreground)" }}>
                      {flag.title}
                    </p>
                    <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
                      {flag.detail}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dimension detail cards */}
      <div>
        <h2 className="mb-3 text-sm font-medium" style={{ color: "var(--theme-muted)" }}>
          Dimension Breakdown
        </h2>
        <div className="space-y-2">
          {report.dimensions.map((dim) => (
            <DimensionCard key={dim.key} dim={dim} />
          ))}
        </div>
      </div>

      {/* Timeline + Peers */}
      {((report.timeline?.length ?? 0) > 0 || (report.peers?.length ?? 0) > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {report.timeline && report.timeline.length > 0 && (
            <div className={`${panelClass} p-5`} style={panelStyle}>
              <h2 className="mb-4 text-sm font-medium" style={{ color: "var(--theme-muted)" }}>
                Company Timeline
              </h2>
              <div className="space-y-3">
                {report.timeline.map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="w-10 flex-shrink-0 font-mono" style={{ color: "var(--theme-muted)" }}>
                      {item.year}
                    </span>
                    <span style={{ color: "color-mix(in srgb, var(--theme-foreground) 88%, transparent)" }}>
                      {item.event}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.peers && report.peers.length > 0 && (
            <div className={`${panelClass} p-5`} style={panelStyle}>
              <h2 className="mb-4 text-sm font-medium" style={{ color: "var(--theme-muted)" }}>
                Peer Comparison
              </h2>
              <div className="space-y-3">
                {report.peers.map((peer, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="font-mono text-sm" style={{ color: "var(--theme-foreground)" }}>
                      {peer.domain}
                    </p>
                    <p className="text-xs" style={{ color: "var(--theme-muted)" }}>
                      {peer.comparison}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Executive summary */}
      <div className={`${panelClass} p-6`} style={panelStyle}>
        <h2 className="mb-4 text-sm font-medium" style={{ color: "var(--theme-muted)" }}>
          Executive Summary
        </h2>
        <div className="max-w-none">
          {report.summary.split("\n\n").map((para, i) => (
            <p
              key={i}
              className="mb-3 text-sm leading-relaxed last:mb-0"
              style={{ color: "color-mix(in srgb, var(--theme-foreground) 88%, transparent)" }}
            >
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className={`${panelClass} p-6`} style={panelStyle}>
        <h2 className="mb-4 text-sm font-medium" style={{ color: "var(--theme-muted)" }}>
          Sources ({report.sources.length})
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {report.sources.map((source, i) => (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-2 rounded-lg p-2 text-xs transition-colors hover:[background-color:color-mix(in_srgb,var(--theme-accent)_7%,var(--theme-panel))]"
              style={{ color: "var(--theme-muted)" }}
            >
              <ExternalLink className="mt-0.5 h-3 w-3 flex-shrink-0 transition-colors group-hover:text-[#4ade80]" />
              <span className="truncate group-hover:text-[var(--theme-foreground)]">{source.title}</span>
            </a>
          ))}
        </div>
      </div>

      <StrategyPresentationReminder domain={report.domain} />

      {/* Share */}
      <div className="pb-8 text-center">
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(window.location.href);
          }}
          className="text-xs transition-colors hover:opacity-90"
          style={{ color: "var(--theme-muted)" }}
        >
          Copy shareable link
        </button>
      </div>
    </div>
  );
}

// ── Live report (client, handles streaming) ───────────────────────────────
export function LiveReport({ scanId, domain, initialResult }: Props) {
  const [report, setReport] = useState<WCSReport | null>(initialResult);
  const [searches, setSearches] = useState<string[]>([]);
  const [sourceCount, setSourceCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (report) return; // already have result

    const es = new EventSource(`/api/scan/${scanId}/stream`);
    eventSourceRef.current = es;

    es.addEventListener("message", (e) => {
      try {
        const event: StreamEvent = JSON.parse(e.data);

        if (event.type === "search" && event.query) {
          setSearches((prev) => [...prev, event.query!]);
        } else if (event.type === "result_count" && event.count !== undefined) {
          setSourceCount(event.count);
        } else if (event.type === "done" || event.type === "cached") {
          if (event.report) {
            setReport(event.report);
          }
          es.close();
        } else if (event.type === "error") {
          setError(event.error ?? "Scan failed");
          es.close();
        }
      } catch {
        // ignore parse errors
      }
    });

    es.onerror = () => {
      setError("Connection lost. Please refresh.");
      es.close();
    };

    return () => es.close();
  }, [scanId, report]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex justify-end">
        <span
          className="max-w-[min(100%,20rem)] truncate text-right text-xs"
          style={{ color: "var(--theme-muted)" }}
          title={domain}
        >
          {domain}
        </span>
      </div>
      {error ? (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-6 text-center space-y-2">
          <p className="font-medium text-red-400">Scan failed</p>
          <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
            {error}
          </p>
        </div>
      ) : !report ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs" style={{ color: "var(--theme-muted)" }}>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4ade80] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4ade80]" />
              </span>
              Researching {domain}…
            </div>
            {sourceCount > 0 && (
              <span>{sourceCount} sources analyzed</span>
            )}
          </div>
          <div className="h-0.5 overflow-hidden rounded-full" style={{ backgroundColor: "var(--theme-border)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: "color-mix(in srgb, #4ade80 55%, var(--theme-accent) 20%)" }}
              animate={{ width: `${Math.min(searches.length * 10, 90)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <ReportSkeleton searches={searches} />
        </div>
      ) : (
        <ReportContent report={report} />
      )}
    </div>
  );
}
