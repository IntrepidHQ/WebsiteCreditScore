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
        | { id: string; normalizedUrl: string }
        | { error: string };

      if (!response.ok || !("id" in payload)) {
        throw new Error(
          "error" in payload
            ? payload.error
            : "Unable to generate the audit right now.",
        );
      }

      startTransition(() => {
        router.push(
          `/audit/${payload.id}?url=${encodeURIComponent(payload.normalizedUrl)}`,
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
          Prospect website URL
        </label>
        <p className="text-sm leading-6 text-muted" id={helperId}>
          Paste a public site URL to build the audit, packet, and discovery brief workspace.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          aria-describedby={error ? `${helperId} ${metaId} ${errorId}` : `${helperId} ${metaId}`}
          aria-invalid={Boolean(error)}
          autoComplete="url"
          className="h-14 flex-1"
          enterKeyHint="go"
          id={inputId}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Paste a prospect website"
          type="url"
          value={url}
        />
        <Button
          className="h-14 sm:min-w-56"
          disabled={loading || !url.trim()}
          size="lg"
          type="submit"
        >
          {loading ? (
            <>
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              Building audit workspace
            </>
          ) : (
            <>
              Build audit workspace
              <ArrowRight aria-hidden="true" className="size-4" />
            </>
          )}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-muted" id={metaId}>
        <span className="inline-flex items-center gap-2">
          <Sparkles aria-hidden="true" className="size-4 text-accent" />
          Audit, intro email, client packet, and brief workflow
        </span>
        <span className="hidden text-border sm:inline">•</span>
        <span>Built for agencies and website providers pitching higher-value web work</span>
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
