"use client";

import { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import { gradeColor, type WCSReport, type Grade } from "@/lib/schema";

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
      className={`flex flex-col items-center justify-center rounded-xl border bg-[#0A0A0B] ${
        size === "lg" ? "w-28 h-28" : "w-10 h-10"
      }`}
      style={{ borderColor: `${color}33` }}
    >
      <span
        className="font-mono font-bold leading-none"
        style={{
          color,
          fontSize: size === "lg" ? "2.5rem" : "1rem",
          letterSpacing: "-0.02em",
        }}
      >
        {grade}
      </span>
      {size === "lg" && (
        <span className="font-mono text-sm text-zinc-400 mt-1">{score}</span>
      )}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-white/5 ${className ?? ""}`}
    />
  );
}

function ReportSkeleton({ searches }: { searches: string[] }) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-white/5 bg-[#111114] p-6 flex gap-6">
        <Skeleton className="w-28 h-28 rounded-xl flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-3 w-32" />
          {searches.length > 0 && (
            <div className="mt-3 space-y-1">
              {searches.slice(-3).map((q, i) => (
                <p key={i} className="text-xs text-zinc-500 flex items-center gap-1.5">
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
    <div className="rounded-xl border border-white/5 bg-[#111114] overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-white/[0.02] transition-colors"
      >
        <div
          className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-sm font-mono font-bold"
          style={{ background: `${color}15`, color }}
        >
          {dim.grade}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{dim.label}</p>
          <div className="mt-1 h-1 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${dim.score}%`, background: color }}
            />
          </div>
        </div>
        <span className="font-mono text-sm text-zinc-500 flex-shrink-0">{dim.score}</span>
        <ChevronDown
          className={`w-4 h-4 text-zinc-600 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
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
            <div className="px-4 pb-4 space-y-3 border-t border-white/5">
              <p className="text-sm text-zinc-300 pt-3">{dim.verdict}</p>
              {dim.evidence.length > 0 && (
                <div className="space-y-1.5">
                  {dim.evidence.map((ev, i) => (
                    <a
                      key={i}
                      href={ev.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors group"
                    >
                      <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 group-hover:text-[#4ade80] transition-colors" />
                      <span>{ev.claim}</span>
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
      {/* Hero score card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-white/5 bg-[#111114] p-6 flex flex-col sm:flex-row items-start gap-6"
      >
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        >
          <GradeBadge
            grade={report.overall.grade as Grade}
            score={report.overall.score}
            size="lg"
          />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-white text-lg">{report.domain}</p>
          {report.company_name && (
            <p className="text-sm text-zinc-500">{report.company_name}</p>
          )}
          <p className="text-base text-zinc-300 mt-2">{report.overall.headline}</p>
          <p className="text-sm text-zinc-500 mt-1">{report.overall.one_liner}</p>
          <p className="text-xs text-zinc-600 mt-3">
            {report.sources.length} sources ·{" "}
            {new Date(report.scanned_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </motion.div>

      {/* Radar + Flags */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Radar chart */}
        <div className="rounded-xl border border-white/5 bg-[#111114] p-6">
          <h2 className="text-sm font-medium text-zinc-400 mb-4">10 Dimensions</h2>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.05)" />
              <PolarAngleAxis
                dataKey="subject"
                tick={{ fill: "#71717a", fontSize: 11 }}
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
                  background: "#111114",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "8px",
                  fontSize: "12px",
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
            <div className="rounded-xl border border-red-500/15 bg-[#111114] p-4">
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
                      <p className="text-sm font-medium text-white">{flag.title}</p>
                    </div>
                    <p className="text-xs text-zinc-500 pl-10">{flag.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Green flags */}
          {report.green_flags.length > 0 && (
            <div className="rounded-xl border border-emerald-500/15 bg-[#111114] p-4">
              <h2 className="text-sm font-medium text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Green Flags ({report.green_flags.length})
              </h2>
              <div className="space-y-2">
                {report.green_flags.map((flag, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-sm font-medium text-white">{flag.title}</p>
                    <p className="text-xs text-zinc-500">{flag.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dimension detail cards */}
      <div>
        <h2 className="text-sm font-medium text-zinc-400 mb-3">Dimension Breakdown</h2>
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
            <div className="rounded-xl border border-white/5 bg-[#111114] p-5">
              <h2 className="text-sm font-medium text-zinc-400 mb-4">Company Timeline</h2>
              <div className="space-y-3">
                {report.timeline.map((item, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <span className="font-mono text-zinc-600 flex-shrink-0 w-10">{item.year}</span>
                    <span className="text-zinc-300">{item.event}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {report.peers && report.peers.length > 0 && (
            <div className="rounded-xl border border-white/5 bg-[#111114] p-5">
              <h2 className="text-sm font-medium text-zinc-400 mb-4">Peer Comparison</h2>
              <div className="space-y-3">
                {report.peers.map((peer, i) => (
                  <div key={i} className="space-y-0.5">
                    <p className="text-sm font-mono text-white">{peer.domain}</p>
                    <p className="text-xs text-zinc-500">{peer.comparison}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Executive summary */}
      <div className="rounded-xl border border-white/5 bg-[#111114] p-6">
        <h2 className="text-sm font-medium text-zinc-400 mb-4">Executive Summary</h2>
        <div className="prose prose-sm prose-invert max-w-none">
          {report.summary.split("\n\n").map((para, i) => (
            <p key={i} className="text-sm text-zinc-300 leading-relaxed mb-3 last:mb-0">
              {para}
            </p>
          ))}
        </div>
      </div>

      {/* Sources */}
      <div className="rounded-xl border border-white/5 bg-[#111114] p-6">
        <h2 className="text-sm font-medium text-zinc-400 mb-4">
          Sources ({report.sources.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {report.sources.map((source, i) => (
            <a
              key={i}
              href={source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors group p-2 rounded-lg hover:bg-white/[0.03]"
            >
              <ExternalLink className="w-3 h-3 mt-0.5 flex-shrink-0 group-hover:text-[#4ade80] transition-colors" />
              <span className="truncate">{source.title}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Share */}
      <div className="text-center pb-8">
        <button
          onClick={() => {
            void navigator.clipboard.writeText(window.location.href);
          }}
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
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
    <div className="min-h-screen">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <a href="/" className="font-mono text-sm font-semibold tracking-tight text-white hover:text-zinc-300 transition-colors">
          WebsiteCreditScore
        </a>
        <span className="text-xs text-zinc-600 font-mono truncate max-w-xs">{domain}</span>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center space-y-2">
            <p className="text-red-400 font-medium">Scan failed</p>
            <p className="text-sm text-zinc-500">{error}</p>
          </div>
        ) : !report ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs text-zinc-500">
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
            <div className="h-0.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-[#4ade80]/50 rounded-full"
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
    </div>
  );
}
