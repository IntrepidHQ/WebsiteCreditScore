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
} from "lucide-react";
import {
  DIMENSION_WEIGHTS,
  gradeColor,
  scoreToGrade,
  type WCSReport,
  type Grade,
  type DimensionKey,
} from "@/lib/schema";
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

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function applyCorrectionPreview(report: WCSReport, correction: string): WCSReport {
  const text = correction.toLowerCase();
  const updates: Partial<Record<DimensionKey, number>> = {};

  if (/(employee|employees|staff|headcount|team)/.test(text)) {
    updates.legitimacy = (updates.legitimacy ?? 0) + 10;
    updates.financial_signals = (updates.financial_signals ?? 0) + 8;
  }
  if (/(revenue|arr|mrr|\$|k\/y|per year|year)/.test(text)) {
    updates.financial_signals = (updates.financial_signals ?? 0) + 14;
    updates.legitimacy = (updates.legitimacy ?? 0) + 4;
  }
  if (/(wrong|incorrect|inaccurate|not true|false)/.test(text)) {
    updates.transparency = (updates.transparency ?? 0) + 4;
  }

  const dimensions = report.dimensions.map((dim) => {
    const delta = updates[dim.key as DimensionKey] ?? 0;
    if (!delta) return dim;
    const score = clampScore(dim.score + delta);
    return {
      ...dim,
      score,
      grade: scoreToGrade(score),
      verdict: `${dim.verdict} (Temporary correction preview applied from your note.)`,
    };
  });

  const weightedScore = dimensions.reduce((sum, dim) => {
    const w = DIMENSION_WEIGHTS[dim.key as DimensionKey] ?? dim.weight ?? 0;
    return sum + dim.score * w;
  }, 0);
  const overallScore = clampScore(weightedScore);

  return {
    ...report,
    overall: {
      score: overallScore,
      grade: scoreToGrade(overallScore),
      headline: "Temporary corrected preview",
      one_liner:
        "You applied a correction note. This preview updates score direction now; root-cause tracing still needed for a durable fix.",
    },
    dimensions,
  };
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
  const [correctionInput, setCorrectionInput] = useState("");
  const [appliedCorrection, setAppliedCorrection] = useState<string | null>(null);
  const [previewReport, setPreviewReport] = useState<WCSReport | null>(null);

  const viewReport = previewReport ?? report;

  const radarData = viewReport.dimensions.map((d) => ({
    subject: d.label.split(" ")[0],
    score: d.score,
    fullMark: 100,
  }));

  const overallColor = gradeColor(viewReport.overall.grade as Grade);

  const handleApplyCorrection = () => {
    const text = correctionInput.trim();
    if (!text) return;
    setPreviewReport(applyCorrectionPreview(report, text));
    setAppliedCorrection(text);
  };

  return (
    <div className="space-y-6">
      {/* Hero score card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${panelClass} flex flex-col items-start gap-6 p-6 sm:flex-row`}
        style={panelStyle}
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <GradeBadge
            grade={viewReport.overall.grade as Grade}
            score={viewReport.overall.score}
            size="lg"
          />
        </motion.div>
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold" style={{ color: "var(--theme-foreground)" }}>
            {viewReport.domain}
          </p>
          {viewReport.company_name && (
            <p className="text-sm" style={{ color: "var(--theme-muted)" }}>
              {viewReport.company_name}
            </p>
          )}
          <p className="mt-2 text-base leading-relaxed" style={{ color: "color-mix(in srgb, var(--theme-foreground) 90%, transparent)" }}>
            {viewReport.overall.headline}
          </p>
          <p className="mt-1 text-sm" style={{ color: "var(--theme-muted)" }}>
            {viewReport.overall.one_liner}
          </p>
          <p className="mt-3 text-xs" style={{ color: "color-mix(in srgb, var(--theme-muted) 80%, transparent)" }}>
            {viewReport.sources.length} sources ·{" "}
            {new Date(viewReport.scanned_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </motion.div>

      <StrategyPresentationUpsell domain={viewReport.domain} />

      <div className={`${panelClass} p-5`} style={panelStyle}>
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--theme-foreground)" }}>
          Did Claude get something wrong?
        </p>
        <p className="text-xs mb-3 leading-relaxed" style={{ color: "var(--theme-muted)" }}>
          Add corrections (example: &ldquo;Saunders has 8 employees and ~$800K last year, not 1 employee and $81K/y.&rdquo;).
          This updates a temporary in-app preview so you can see the directional impact.
          We still need to trace root cause before treating it as final truth.
        </p>
        <textarea
          value={correctionInput}
          onChange={(e) => setCorrectionInput(e.target.value)}
          placeholder="Type factual corrections here..."
          className="w-full rounded-xl border px-3 py-2.5 text-sm outline-none resize-y min-h-[88px]"
          style={{
            borderColor: "var(--theme-border)",
            color: "var(--theme-foreground)",
            backgroundColor: "var(--theme-background)",
          }}
          aria-label="Correction input"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleApplyCorrection}
            disabled={!correctionInput.trim()}
            className="rounded-lg px-4 py-2 text-xs font-semibold disabled:opacity-40"
            style={{ backgroundColor: "var(--theme-accent)", color: "var(--theme-accent-foreground)" }}
          >
            Apply temporary correction preview
          </button>
          {previewReport ? (
            <button
              type="button"
              onClick={() => {
                setPreviewReport(null);
                setAppliedCorrection(null);
                setCorrectionInput("");
              }}
              className="rounded-lg border px-4 py-2 text-xs font-semibold"
              style={{ borderColor: "var(--theme-border)", color: "var(--theme-muted)" }}
            >
              Reset preview
            </button>
          ) : null}
          {appliedCorrection ? (
            <span className="text-xs" style={{ color: "var(--theme-muted)" }}>
              Preview active from: &ldquo;{appliedCorrection.slice(0, 100)}{appliedCorrection.length > 100 ? "…" : ""}&rdquo;
            </span>
          ) : null}
        </div>
      </div>

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
          {viewReport.red_flags.length > 0 && (
            <div className={`${panelClass} border-red-500/20 p-4`} style={panelStyle}>
              <h2 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Red Flags ({viewReport.red_flags.length})
              </h2>
              <div className="space-y-2">
                {viewReport.red_flags.map((flag, i) => (
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
          {viewReport.green_flags.length > 0 && (
            <div className={`${panelClass} border-emerald-500/20 p-4`} style={panelStyle}>
              <h2 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Green Flags ({viewReport.green_flags.length})
              </h2>
              <div className="space-y-2">
                {viewReport.green_flags.map((flag, i) => (
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
          {viewReport.dimensions.map((dim) => (
            <DimensionCard key={dim.key} dim={dim} />
          ))}
        </div>
      </div>

      {/* Timeline + Peers */}
      {((viewReport.timeline?.length ?? 0) > 0 || (viewReport.peers?.length ?? 0) > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {viewReport.timeline && viewReport.timeline.length > 0 && (
            <div className={`${panelClass} p-5`} style={panelStyle}>
              <h2 className="mb-4 text-sm font-medium" style={{ color: "var(--theme-muted)" }}>
                Company Timeline
              </h2>
              <div className="space-y-3">
                {viewReport.timeline.map((item, i) => (
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

          {viewReport.peers && viewReport.peers.length > 0 && (
            <div className={`${panelClass} p-5`} style={panelStyle}>
              <h2 className="mb-4 text-sm font-medium" style={{ color: "var(--theme-muted)" }}>
                Peer Comparison
              </h2>
              <div className="space-y-3">
                {viewReport.peers.map((peer, i) => (
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
          {viewReport.summary.split("\n\n").map((para, i) => (
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
          Sources ({viewReport.sources.length})
        </h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {viewReport.sources.map((source, i) => (
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

      <StrategyPresentationReminder domain={viewReport.domain} />

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
export function LiveReport({ scanId, domain, initialStatus, initialResult }: Props) {
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
