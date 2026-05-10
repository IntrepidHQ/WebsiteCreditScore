"use client";

import { useState } from "react";

interface Props {
  scanId: string;
  domain: string;
  defaultName: string;
}

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "ok"; strategyId: string; studioUrl: string; isNew: boolean }
  | { kind: "error"; message: string };

export function PromoteButton({ scanId, domain, defaultName }: Props) {
  const [state, setState] = useState<State>({ kind: "idle" });
  const [tier, setTier] = useState<"standard" | "nonprofit">("standard");
  const [clientName, setClientName] = useState(defaultName);

  async function promote(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/admin/promote-strategy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scanId, tier, clientName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ kind: "error", message: data.error ?? `HTTP ${res.status}` });
      } else {
        setState({
          kind: "ok",
          strategyId: data.strategyId,
          studioUrl: data.studioUrl,
          isNew: data.isNew,
        });
      }
    } catch (err) {
      setState({ kind: "error", message: String(err) });
    }
  }

  return (
    <div
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="relative mt-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-300">
        Admin · Promote
      </p>

      {state.kind === "ok" ? (
        <div className="mt-2 text-xs">
          <p className="text-emerald-400">
            {state.isNew ? "Strategy created" : "Already exists"}
          </p>
          <a
            href={state.studioUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-1 inline-block break-all text-amber-300 underline"
          >
            Open in studio →
          </a>
        </div>
      ) : (
        <>
          <div className="mt-2 flex flex-col gap-2">
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder={domain}
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100"
            />
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as "standard" | "nonprofit")}
              className="rounded border border-zinc-700 bg-zinc-900 px-2 py-1 text-xs text-zinc-100"
            >
              <option value="standard">Standard ($6K / $4.5K)</option>
              <option value="nonprofit">Nonprofit (Ad Grant focus)</option>
            </select>
          </div>
          <button
            onClick={promote}
            disabled={state.kind === "loading"}
            className="mt-2 w-full rounded bg-amber-500 px-2 py-1.5 text-xs font-bold text-black hover:bg-amber-400 disabled:opacity-50"
          >
            {state.kind === "loading" ? "Firing webhook…" : "Promote to Strategy"}
          </button>
          {state.kind === "error" ? (
            <p className="mt-2 text-xs text-red-400">{state.message}</p>
          ) : null}
        </>
      )}
    </div>
  );
}
