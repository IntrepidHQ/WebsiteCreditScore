"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const SAVE_QUERY = "save";

export function AuditSaveLeadsPanel({
  isAuthenticated,
  normalizedUrl,
}: {
  isAuthenticated: boolean;
  normalizedUrl: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [leadId, setLeadId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const autoSaveStarted = useRef(false);

  const stripSaveParam = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(SAVE_QUERY);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const runSave = useCallback(async () => {
    setErrorMessage(null);
    setPhase("saving");
    const res = await fetch("/api/app/save-audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ url: normalizedUrl }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      leadId?: string;
      error?: string;
    };
    if (!res.ok) {
      setPhase("error");
      setErrorMessage(data.error ?? "Could not save to Leads.");
      return;
    }
    if (data.leadId) {
      setLeadId(data.leadId);
    }
    setPhase("saved");
  }, [normalizedUrl]);

  useEffect(() => {
    if (!isAuthenticated || searchParams.get(SAVE_QUERY) !== "1" || autoSaveStarted.current) {
      return;
    }
    autoSaveStarted.current = true;
    void (async () => {
      try {
        await runSave();
      } finally {
        stripSaveParam();
      }
    })();
  }, [isAuthenticated, runSave, searchParams, stripSaveParam]);

  const handleManualSave = () => {
    void runSave();
  };

  const params = new URLSearchParams(searchParams.toString());
  params.set(SAVE_QUERY, "1");
  const signupNext = `${pathname}?${params.toString()}`;
  const signupHref = `/app/login?mode=signup&next=${encodeURIComponent(signupNext)}`;

  if (!isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-border/60 bg-panel/35 px-4 py-3 text-sm leading-6 text-muted">
          <span className="text-foreground">Save this audit to your workspace as a lead.</span>{" "}
          <Link
            className="font-semibold text-accent underline-offset-4 hover:underline"
            href={signupHref}
          >
            Sign up to save
          </Link>{" "}
          or{" "}
          <Link
            className="font-semibold text-accent underline-offset-4 hover:underline"
            href={`/app/login?next=${encodeURIComponent(signupNext)}`}
          >
            sign in
          </Link>
          .
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-panel/35 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          {phase === "saved" && leadId ? (
            <p
              aria-live="polite"
              className="text-sm font-medium text-foreground"
              role="status"
            >
              Saved to Leads.{" "}
              <Link
                className="font-semibold text-accent underline-offset-4 hover:underline"
                href={`/app/leads/${leadId}`}
              >
                Open lead
              </Link>
            </p>
          ) : (
            <p className="text-sm text-muted">
              Add this site to your workspace so it appears under Leads with the full saved audit.
            </p>
          )}
          {phase === "error" && errorMessage ? (
            <p className="text-sm text-danger" role="alert">
              {errorMessage}
            </p>
          ) : null}
        </div>
        {phase !== "saved" ? (
          <Button
            className="shrink-0"
            disabled={phase === "saving"}
            onClick={handleManualSave}
            size="sm"
            type="button"
            variant="secondary"
          >
            {phase === "saving" ? (
              <>
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Saving…
              </>
            ) : (
              "Save to Leads"
            )}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
