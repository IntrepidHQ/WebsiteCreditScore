"use client";

import { useState } from "react";

type State = "idle" | "sending" | "done" | "error";

/**
 * Admin-only button to hand a completed scan off to StrategyPresentation Studio.
 * Calls the admin-gated /api/sp/handoff endpoint. On success it links straight
 * to the generated draft in the Studio.
 */
export function SpHandoffButton({ scanId, domain }: { scanId: string; domain: string }) {
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string>("");
  const [studioUrl, setStudioUrl] = useState<string | null>(null);

  async function send() {
    setState("sending");
    setMessage("");
    try {
      const res = await fetch("/api/sp/handoff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(data.error ?? `Failed (${res.status})`);
        return;
      }
      setState("done");
      setStudioUrl(data.studioUrl ?? null);
      setMessage(data.isNew ? "Draft created" : "Already existed");
    } catch (err) {
      setState("error");
      setMessage(err instanceof Error ? err.message : "Network error");
    }
  }

  if (state === "done") {
    return studioUrl ? (
      <a
        href={studioUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold hover:underline"
        style={{ color: "#4ade80" }}
        title={message}
      >
        open draft →
      </a>
    ) : (
      <span style={{ color: "#4ade80" }} title={message}>{message}</span>
    );
  }

  return (
    <button
      type="button"
      onClick={send}
      disabled={state === "sending"}
      className="rounded-md px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
      style={{ border: "1px solid var(--theme-accent)", color: "var(--theme-accent)" }}
      title={state === "error" ? message : `Generate a Strategy Presentation draft for ${domain}`}
    >
      {state === "sending" ? "sending…" : state === "error" ? "retry →" : "→ SP"}
    </button>
  );
}
