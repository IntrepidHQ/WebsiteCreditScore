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
  BadgeCheck,
  Flag,
  Globe2,
  Layers3,
  Sparkles,
  Target,
} from "lucide-react";
import { gradeColor, gradeLabel, type WCSReport, type Grade } from "@/lib/schema";
import { buildStrategyCallCalendlyUrl, buildStrategyPresentationUrl } from "@/lib/strategy-call";
import { buildScanResultSummary, type ScanResultSummaryViewModel } from "@/lib/scan-result-summary";

const scanReportCalendlyUrl = (domain: string) =>
  buildStrategyCallCalendlyUrl({ medium: "scan_report", content: domain });

const scanReportPresentationUrl = (domain: string) =>
  buildStrategyPresentationUrl({ medium: "scan_report", content: domain });

const panelClass = "rounded-2xl border";
const panelStyle: CSSProperties = {
  borderColor: "var(--theme-border)",
  backgroundColor: "var(--theme-panel)",
};

function severityColor(severity: WCSReport["red_flags"][number]["severity"]) {
  if (severity === "critical") return "#f87171";
  if (severity === "high") return "#fb923c";
  if (severity === "medium") return "#facc15";
  return "var(--theme-muted)";
}

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

// ── Grade badge ───────────────────────────────────────────────────────────
function GradeBadge({
  grade,
  score,
  size = "sm",
}: {
  grade: Grade;
  score: number;
  size?: "sm" | "lg";
}) {
  const color = gradeColor(grade);
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-xl border ${
        size === "lg" ? "w-28 h-28" : "w-10 h-10"
      }`}
      style={{ borderColor: `${color}44`, backgroundColor: "var(--theme-background)" }}
    >
      <span
        className="font-score leading-none"
        style={{
          color,
          fontSize: size === "lg" ? "2.75rem" : "1.05rem",
          letterSpacing: "-0.02em",
        }}
      >
        {grade}
      </span>
      {size === "lg" && (
        <span className="font-score mt-1 text-base" style={{ color: "var(--theme-muted)" }}>
          {score}
        </span>
      )}
    </div>
  );
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

function ScoreTrack({
  label,
  score,
  grade,
  color,
  detail,
}: {
  label: string;
  score: number;
  grade: Grade;
  color: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border p-4" style={panelStyle}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
            {label}
          </p>
          {detail ? (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
              {detail}
            </p>
          ) : null}
        </div>
        <div className="shrink-0 text-right">
          <p className="font-score text-2xl" style={{ color }}>{grade}</p>
          <p className="font-score text-xs" style={{ color: "var(--theme-muted)" }}>{score}</p>
        </div>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ backgroundColor: "var(--theme-border)" }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 45%, transparent))`,
          }}
        />
      </div>
    </div>
  );
}

function InsightTile({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Sparkles;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border p-4" style={panelStyle}>
      <div className="flex items-center gap-2" style={{ color: "var(--theme-accent)" }}>
        <Icon className="h-4 w-4" aria-hidden />
        <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>
          {label}
        </p>
      </div>
      <p className="mt-3 line-clamp-2 text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
        {value}
      </p>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed" style={{ color: "var(--theme-muted)" }}>
        {detail}
      </p>
    </div>
  );
}

function PriorityFlagCard({
  flag,
  index,
}: {
  flag: WCSReport["red_flags"][number];
  index: number;
}) {
  const color = severityColor(flag.severity);
  const content = (
    <div
      className="group h-full rounded-2xl border p-5 transition-opacity hover:opacity-92"
      style={{
        borderColor: `color-mix(in srgb, ${color} 30%, var(--theme-border))`,
        background:
          "linear-gradient(180deg, color-mix(in srgb, var(--theme-panel) 92%, transparent), color-mix(in srgb, var(--theme-background-alt) 82%, transparent))",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="flex h-10 w-10 items-center justify-center rounded-xl border"
            style={{ borderColor: `${color}44`, backgroundColor: `${color}14`, color }}
          >
            <Flag className="h-4 w-4" aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>
              Priority {index + 1}
            </p>
            <p className="text-xs font-semibold uppercase tracking-[0.12em]" style={{ color }}>
              {flag.severity}
            </p>
          </div>
        </div>
        {flag.url ? <ExternalLink className="h-4 w-4 shrink-0" style={{ color: "var(--theme-muted)" }} /> : null}
      </div>
      <h3 className="mt-5 font-display text-3xl leading-[1.02]" style={{ color: "var(--theme-foreground)" }}>
        {flag.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
        {flag.detail}
      </p>
    </div>
  );

  if (flag.url) {
    return (
      <a href={flag.url} target="_blank" rel="noopener noreferrer" className="block h-full">
        {content}
      </a>
    );
  }

  return content;
}

function DomainSpecimen({
  report,
  summary,
}: {
  report: WCSReport;
  summary: ScanResultSummaryViewModel;
}) {
  const strongest = summary.strongestCategories.slice(0, 2);
  const weakest = summary.weakestCategories.slice(0, 2);

  return (
    <div
      className="relative overflow-hidden rounded-[2rem] border p-5 shadow-2xl sm:p-6"
      style={{
        borderColor: "color-mix(in srgb, var(--theme-accent) 32%, var(--theme-border))",
        background:
          "radial-gradient(circle at top right, color-mix(in srgb, var(--theme-accent) 20%, transparent), transparent 38%), linear-gradient(180deg, var(--theme-panel), var(--theme-background-alt))",
      }}
    >
      <div className="flex items-center justify-between gap-4 rounded-2xl border px-4 py-3" style={panelStyle}>
        <div className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={summary.previewAssets.faviconUrl}
            alt=""
            width={34}
            height={34}
            className="rounded-lg ring-1 ring-white/10"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold" style={{ color: "var(--theme-foreground)" }}>
              {report.domain}
            </p>
            <p className="truncate text-xs" style={{ color: "var(--theme-muted)" }}>
              {report.company_name ?? "Live public-domain research"}
            </p>
          </div>
        </div>
        <span className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]" style={{ borderColor: "#f7b21b44", color: "var(--theme-accent)" }}>
          Report
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-2xl border p-5" style={{ borderColor: "var(--theme-border)", backgroundColor: "rgba(14,14,7,0.62)" }}>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>
            Verdict
          </p>
          <p className="mt-3 font-display text-4xl leading-[0.98]" style={{ color: "var(--theme-foreground)" }}>
            {report.overall.headline}
          </p>
          <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            {report.overall.one_liner}
          </p>
        </div>

        <div className="grid gap-3">
          {strongest.map((dim) => (
            <ScoreTrack
              key={dim.key}
              color={gradeColor(dim.grade as Grade)}
              detail="Strong proof signal"
              grade={dim.grade as Grade}
              label={dim.label}
              score={dim.score}
            />
          ))}
          {weakest.map((dim) => (
            <ScoreTrack
              key={dim.key}
              color={gradeColor(dim.grade as Grade)}
              detail="Most visible opportunity"
              grade={dim.grade as Grade}
              label={dim.label}
              score={dim.score}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ScanResultSummary({ report }: { report: WCSReport }) {
  const summary = buildScanResultSummary(report);
  const topDimensions = summary.strongestCategories;
  const weakDimensions = summary.weakestCategories;
  const priorityFlags = summary.priorityFindings;
  const overallColor = gradeColor(report.overall.grade as Grade);
  const factIcons = [Layers3, Globe2, AlertTriangle, BadgeCheck];

  return (
    <section className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] xl:items-start">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ borderColor: "#f7b21b44", backgroundColor: "#f7b21b12", color: "var(--theme-accent)" }}
            >
              Scan result
            </span>
            <span
              className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
              style={{ borderColor: `${overallColor}44`, backgroundColor: `${overallColor}14`, color: overallColor }}
            >
              {gradeLabel(report.overall.grade as Grade)}
            </span>
            <span className="text-xs" style={{ color: "var(--theme-muted)" }}>
              {report.sources.length} sources · {summary.scannedAtLabel}
            </span>
          </div>

          <div>
            <h1 className="font-display leading-[0.94]" style={{ color: "var(--theme-foreground)", fontSize: "clamp(3.4rem, 8vw, 6.4rem)" }}>
              {report.domain}
            </h1>
            {report.company_name ? (
              <p className="mt-2 text-sm font-semibold" style={{ color: "var(--theme-accent)" }}>
                {report.company_name}
              </p>
            ) : null}
          </div>

          <div
            className="rounded-[2rem] border p-5 sm:p-6"
            style={{
              borderColor: `color-mix(in srgb, ${overallColor} 35%, var(--theme-border))`,
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--theme-panel) 88%, transparent), color-mix(in srgb, var(--theme-background-alt) 94%, transparent))",
            }}
          >
            <div className="grid gap-5 sm:grid-cols-[8.5rem_minmax(0,1fr)] sm:items-center">
              <GradeBadge grade={report.overall.grade as Grade} score={report.overall.score} size="lg" />
              <div>
                <p className="font-display text-4xl leading-[1.02]" style={{ color: "var(--theme-foreground)" }}>
                  {report.overall.headline}
                </p>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                  {report.overall.one_liner}
                </p>
                <p className="mt-3 text-sm" style={{ color: "color-mix(in srgb, var(--theme-foreground) 86%, transparent)" }}>
                  {summary.gradeNarrative}
                </p>
              </div>
            </div>
          </div>

          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--theme-accent)" }}>
              What we found
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {summary.observedFacts.map((fact, index) => (
                <InsightTile
                  key={fact.label}
                  detail={fact.detail}
                  icon={factIcons[index] ?? Sparkles}
                  label={fact.label}
                  value={fact.value}
                />
              ))}
            </div>
          </div>
        </div>

        <DomainSpecimen report={report} summary={summary} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.38fr)]">
        <div className={`${panelClass} p-5 sm:p-6`} style={panelStyle}>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--theme-accent)" }}>
                Top priorities
              </p>
              <h2 className="font-display text-4xl" style={{ color: "var(--theme-foreground)", lineHeight: 1 }}>
                What should change first
              </h2>
            </div>
            <a
              href={summary.actionHrefs.strategyCall}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
            >
              Strategy Call
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </div>
          {priorityFlags.length ? (
            <div className="grid gap-4 md:grid-cols-3">
              {priorityFlags.map((flag, index) => (
                <PriorityFlagCard flag={flag} index={index} key={`${flag.title}-${index}`} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border p-5" style={panelStyle}>
              <p className="text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
                No major red flags were detected. Focus on preserving the strongest proof signals and polishing the lowest-scoring dimensions below.
              </p>
            </div>
          )}
        </div>

        <div className={`${panelClass} p-5 sm:p-6`} style={panelStyle}>
          <div className="flex items-center gap-2" style={{ color: "var(--theme-accent)" }}>
            <Target className="h-4 w-4" aria-hidden />
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "var(--theme-muted)" }}>
              Score spread
            </p>
          </div>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "var(--theme-muted)" }}>
            {summary.benchmarkTarget}. Strong dimensions show what the site can already claim; weak dimensions show where visitors still need more proof.
          </p>
          <div className="mt-5 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-accent)" }}>
              Strongest
            </p>
            {topDimensions.map((dim) => (
              <ScoreTrack
                color={gradeColor(dim.grade as Grade)}
                detail={dim.verdict}
                grade={dim.grade as Grade}
                key={dim.key}
                label={dim.label}
                score={dim.score}
              />
            ))}
            <p className="pt-3 text-xs font-bold uppercase tracking-[0.16em]" style={{ color: "var(--theme-warning)" }}>
              Needs attention
            </p>
            {weakDimensions.map((dim) => (
              <ScoreTrack
                color={gradeColor(dim.grade as Grade)}
                detail={dim.verdict}
                grade={dim.grade as Grade}
                key={dim.key}
                label={dim.label}
                score={dim.score}
              />
            ))}
          </div>
        </div>
      </div>
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
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
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
