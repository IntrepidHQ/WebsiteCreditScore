"use client";

import { startTransition, useId, useState } from "react";
import { ArrowRight, LoaderCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LandingForm() {
  const router = useRouter();
  const inputId = useId();
  const helperId = useId();
  const metaId = useId();
  const errorId = useId();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const payload = (await response.json()) as
        | { id: string; normalizedUrl: string; persisted?: boolean; leadId?: string }
        | { error: string };

      if (!response.ok || !("id" in payload)) {
        throw new Error(
          "error" in payload
            ? payload.error
            : "Unable to generate the audit right now.",
        );
      }

      startTransition(() => {
        if (payload.persisted && payload.leadId) {
          router.push(`/app/leads/${payload.leadId}`);
          return;
        }

        // Public scan — redirect to audit with signup hint
        router.push(
          `/audit/${payload.id}?url=${encodeURIComponent(payload.normalizedUrl)}&ref=landing`,
        );
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to generate the audit right now.",
      );
    } finally {
      setLoading(false);
    }
  }

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
        <div className="relative flex flex-1 items-center">
          <span className="pointer-events-none absolute left-4 select-none text-sm text-muted">
            www.
          </span>
          <Input
            aria-describedby={error ? `${helperId} ${metaId} ${errorId}` : `${helperId} ${metaId}`}
            aria-invalid={Boolean(error)}
            autoComplete="url"
            className="h-14 flex-1 pl-12"
            enterKeyHint="go"
            id={inputId}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="yourwebsite.com"
            type="url"
            value={url}
          />
        </div>
        <Button
          className="h-14 sm:min-w-56"
          disabled={loading || !url.trim()}
          size="lg"
          type="submit"
        >
          {loading ? (
            <>
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Generating audit
            </>
          ) : (
            <>
              Generate audit
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted" id={metaId}>
        <span className="inline-flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-4 text-accent" />
          Audit, score breakdown, packet PDF, and brief
        </span>
        <span className="hidden text-border sm:inline">•</span>
        <span>See what is hurting trust, clarity, and conversion before you rebuild</span>
      </div>
      {error ? (
        <p
          className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger"
          id={errorId}
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </form>
  );
}
