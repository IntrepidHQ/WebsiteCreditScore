"use client";

import { useEffect, useState } from "react";

import { Loader2 } from "lucide-react";

import { AuditReportContent } from "@/features/audit/components/audit-report-content";
import { ReportEmptyState } from "@/features/audit/components/report-empty-state";
import { consumeAuditHandoff } from "@/lib/audit-handoff-storage";
import type { AuditReport } from "@/lib/types/audit";

type Phase = "resolving" | "ready" | "error";

/**
 * Public scan handoff: the homepage already built the report and stored it in sessionStorage.
 * This avoids a second full server rebuild on navigation (important on Vercel where `/tmp`
 * scan cache is not shared across instances).
 */
export const AuditFromScanClient = ({
  isAuthenticated,
  reportId,
  scanUrl,
}: {
  isAuthenticated: boolean;
  reportId: string;
  scanUrl: string;
}) => {
  const [report, setReport] = useState<AuditReport | null>(null);
  const [phase, setPhase] = useState<Phase>("resolving");

  useEffect(() => {
    const fromHandoff = consumeAuditHandoff(reportId, scanUrl);
    if (fromHandoff) {
      setReport(fromHandoff);
      setPhase("ready");
      return;
    }

    let cancelled = false;

    const refetch = async () => {
      try {
        const response = await fetch("/api/audit", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: scanUrl, persist: false }),
        });

        const payload = (await response.json()) as
          | { report?: AuditReport; error?: string }
          | { error: string };

        if (cancelled) {
          return;
        }

        if (!response.ok || !payload || !("report" in payload) || !payload.report) {
          throw new Error(
            "error" in payload && typeof payload.error === "string"
              ? payload.error
              : "Unable to load this audit.",
          );
        }

        setReport(payload.report);
        setPhase("ready");
      } catch {
        if (!cancelled) {
          setPhase("error");
        }
      }
    };

    void refetch();

    return () => {
      cancelled = true;
    };
  }, [reportId, scanUrl]);

  if (phase === "error") {
    return (
      <ReportEmptyState
        description="Try running the scan again from the homepage, or open a sample audit from Examples."
        title="We could not restore this audit in your browser"
      />
    );
  }

  if (!report) {
    return (
      <main className="presentation-section pt-10" id="main-content">
        <div
          aria-busy="true"
          aria-live="polite"
          className="mx-auto flex max-w-2xl flex-col items-center gap-6 px-4 text-center sm:px-6"
          role="status"
        >
          <span className="sr-only">Loading audit</span>
          <Loader2 aria-hidden className="size-10 animate-spin text-accent" />
          <div className="space-y-3">
            <p className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Opening your audit
            </p>
            <p className="text-sm leading-7 text-muted">
              Reusing your homepage scan when possible so you do not wait through a second full crawl.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return <AuditReportContent isAuthenticated={isAuthenticated} report={report} />;
};
