"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { ScanUrlFieldGroup } from "@/components/common/scan-url-field-group";
import { Button } from "@/components/ui/button";
import { ScanLoadingOverlay } from "@/features/landing/components/scan-loading-overlay";
import { persistAuditHandoff } from "@/lib/audit-handoff-storage";
import type { AuditReport } from "@/lib/types/audit";

/**
 * Public homepage scan: same URL field pattern as the signed-in workspace (`ScanUrlFieldGroup` +
 * `CreateLeadScanForm`), but submits to `/api/audit` with `persist: false` so no login is required.
 * Do not POST to `/api/app/create-lead` here — that route requires a workspace session.
 */
export function LandingForm() {
  const router = useRouter();
  const inputId = useId();
  const helperId = useId();
  const metaId = useId();
  const errorId = useId();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanOverlay, setShowScanOverlay] = useState(false);
  const [scanDataReady, setScanDataReady] = useState(false);
  const [error, setError] = useState("");
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);
  const pendingNavRef = useRef<
    | { id: string; normalizedUrl: string; persisted?: boolean; leadId?: string }
    | null
  >(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    pendingNavRef.current = null;
    setShowScanOverlay(false);
    setScanDataReady(false);
    setLoading(false);
  }, []);

  const handleDialReachedTen = useCallback(() => {
    const payload = pendingNavRef.current;
    pendingNavRef.current = null;
    if (!payload) {
      return;
    }

    // Snap to top before navigation so the audit page always starts at the top,
    // regardless of where the user had scrolled on the landing page.
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    if (payload.persisted && payload.leadId) {
      router.push(`/app/leads/${payload.leadId}?from=scan`);
    } else {
      router.push(
        `/audit/${payload.id}?url=${encodeURIComponent(payload.normalizedUrl)}&ref=landing&from=scan`,
      );
    }
    setShowScanOverlay(false);
    setScanDataReady(false);
  }, [router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      return;
    }

    setLoading(true);
    setShowScanOverlay(true);
    setScanDataReady(false);
    pendingNavRef.current = null;
    setError("");

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ url: trimmed, persist: false }),
        signal: controller.signal,
      });

      const payload = (await response.json()) as
        | {
            id: string;
            normalizedUrl: string;
            persisted?: boolean;
            leadId?: string;
            report?: AuditReport;
          }
        | { error: string };

      if (!response.ok || !("id" in payload)) {
        throw new Error(
          "error" in payload
            ? payload.error
            : "Unable to generate the audit right now.",
        );
      }

      if (payload.report) {
        persistAuditHandoff(payload.report);
      }

      pendingNavRef.current = payload;
      setScanDataReady(true);
    } catch (caughtError) {
      if (controller.signal.aborted) {
        // Cancelled by the user — `handleCancel` already reset UI state.
        return;
      }
      setShowScanOverlay(false);
      setScanDataReady(false);
      pendingNavRef.current = null;
      const message =
        caughtError instanceof Error ? caughtError.message : "Unable to generate the audit right now.";
      // Common bad-URL shapes: spaces, missing TLD, http without scheme. Give a retry hint.
      const urlLooksInvalid =
        /\s/.test(trimmed) || !/\.[a-z]{2,}/i.test(trimmed);
      setError(
        urlLooksInvalid
          ? `That URL doesn't look right. Try something like example.com, agency.co, or shop.store.com — no spaces, and a real domain suffix.`
          : message,
      );
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setLoading(false);
    }
  };

  return (
    <form
      aria-busy={loading}
      className="space-y-3"
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="space-y-2">
        <label className="text-sm font-semibold text-foreground" htmlFor={inputId}>
          Run a live scan
        </label>
        <p className="text-sm leading-6 text-muted" id={helperId}>
          Paste the site URL to generate the audit, score breakdown, and action brief.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ScanUrlFieldGroup
          aria-describedby={error ? `${helperId} ${metaId} ${errorId}` : `${helperId} ${metaId}`}
          aria-invalid={Boolean(error)}
          autoFocus={false}
          disabled={loading}
          id={inputId}
          onValueChange={setUrl}
          placeholder="example.com"
          value={url}
        />
        <Button
          aria-busy={loading}
          className="min-w-[10.5rem] sm:min-w-[12rem]"
          disabled={loading || !url.trim()}
          size="lg"
          type="submit"
        >
          {loading ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Generating audit
            </>
          ) : (
            <>
              Generate audit
              <ArrowRight aria-hidden className="size-4" />
            </>
          )}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted" id={metaId}>
        <span className="inline-flex items-center gap-2">
          <Sparkles aria-hidden className="size-4 text-accent" />
          Instant results — no account needed
        </span>
        <span className="hidden text-border sm:inline">•</span>
        <span>Score, breakdown, and action brief — free to run</span>
      </div>
      {error ? (
        <div
          className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          id={errorId}
          role="alert"
        >
          <p>{error}</p>
          <button
            className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-danger/90 underline underline-offset-4 transition hover:text-danger"
            onClick={() => setError("")}
            type="button"
          >
            Try a different URL
          </button>
        </div>
      ) : null}
      {portalTarget
        ? createPortal(
            <ScanLoadingOverlay
              active={showScanOverlay}
              mode="landing"
              scanDataReady={scanDataReady}
              onDialReachedTen={handleDialReachedTen}
              onCancel={handleCancel}
            />,
            portalTarget,
          )
        : null}
    </form>
  );
}
