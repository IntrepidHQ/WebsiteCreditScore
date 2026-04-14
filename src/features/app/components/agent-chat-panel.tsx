"use client";

import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowUp, Layers, Loader2 } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MAX_ENTITLEMENT_ERROR } from "@/lib/billing/max-access";
import { cn } from "@/lib/utils/cn";

type ChatTurn = { role: "user" | "assistant"; content: string };

export type AgentChatReportContext = {
  title: string;
  normalizedUrl: string;
  overallScore: number;
  executiveSummary: string;
  categoryScores: Array<{ key: string; label: string; score: number }>;
  findings: Array<{ title: string; severity: string }>;
};

const TypingDots = () => (
  <div aria-hidden className="flex items-center gap-1.5 px-1 py-0.5">
    <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.2s]" />
    <span className="size-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.1s]" />
    <span className="size-1.5 animate-bounce rounded-full bg-muted" />
  </div>
);

export function AgentChatPanel({
  reportContext,
  endpoint = "/api/app/agent-chat",
  layout = "embedded",
}: {
  reportContext?: AgentChatReportContext | null;
  endpoint?: string;
  /** `standalone` — chat page (outer title already present). `embedded` — include section intro. */
  layout?: "embedded" | "standalone";
}) {
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorAction, setErrorAction] = useState<{ href: string; label: string } | null>(null);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || pending) {
      return;
    }

    const nextMessages: ChatTurn[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setErrorAction(null);
    setPending(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
          reportContext: reportContext ?? undefined,
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string; code?: string };

      if (!res.ok) {
        if (res.status === 401) {
          setError(
            "We could not confirm your session on this request. Refresh the page, then sign in again if the problem continues.",
          );
          return;
        }
        if (res.status === 403 && data.code === MAX_ENTITLEMENT_ERROR) {
          setError(data.error ?? "MAX add-on required to use workspace chat.");
          setErrorAction({ href: "/app/max", label: "Open MAX in workspace" });
          return;
        }
        if (res.status === 503 && data.code === "WORKSPACE_LOAD_FAILED") {
          setError(
            data.error ??
              "Your workspace could not be loaded from the database. Confirm Supabase migrations and RLS, then refresh.",
          );
          setErrorAction({ href: "/app/login?error=workspace-unavailable", label: "Open sign-in help" });
          return;
        }
        setError(data.error ?? "Request failed.");
        return;
      }

      if (data.message) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.message! }]);
      }
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
      requestAnimationFrame(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      });
    }
  }, [endpoint, input, messages, pending, reportContext]);

  const handleComposerKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  useEffect(() => {
    if (!textareaRef.current) {
      return;
    }
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(220, Math.max(52, textareaRef.current.scrollHeight))}px`;
  }, [input]);

  return (
    <section aria-labelledby={layout === "embedded" ? titleId : undefined} className="flex flex-col gap-6">
      {layout === "embedded" ? (
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">Assistant</p>
          <h2 className="font-display text-[clamp(2rem,1.6rem+0.9vw,2.75rem)] leading-[0.98] tracking-[-0.04em] text-foreground" id={titleId}>
            Workspace agent
          </h2>
          <p className="max-w-2xl text-sm leading-7 text-muted">
            Grounded in your latest saved audit when context is attached. Ask for coding-agent prompts, benchmark
            interpretation, or client talk-tracks.
          </p>
        </div>
      ) : null}

      <div
        className={cn(
          "relative flex min-h-[min(32rem,72vh)] flex-col overflow-hidden rounded-[28px] border border-border/55",
          "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_78%,transparent),color-mix(in_srgb,var(--theme-background-alt)_92%,transparent))]",
          "shadow-[0_28px_90px_rgba(0,0,0,0.35)]",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(125deg, rgba(255,255,255,0.09) 0px, rgba(255,255,255,0.09) 1px, transparent 1px, transparent 14px)",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-1/3 top-[-40%] h-[120%] w-[120%] rounded-full opacity-30 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in srgb, var(--theme-accent) 22%, transparent), transparent 70%)",
          }}
        />

        <div className="relative z-[1] flex items-start justify-between gap-3 border-b border-border/50 px-4 py-3 sm:px-5">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-foreground">Chat</p>
              <Badge variant="accent">Beta</Badge>
            </div>
            <p className="text-xs leading-5 text-muted">Workspace assistant · MAX</p>
          </div>
          {reportContext ? (
            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background/55 px-3 py-1.5 text-[11px] text-muted sm:flex">
              <Layers aria-hidden className="size-3.5 text-accent" />
              <span className="max-w-[14rem] truncate text-foreground/90">{reportContext.title}</span>
            </div>
          ) : (
            <div className="hidden shrink-0 items-center gap-2 rounded-full border border-border/60 bg-background/55 px-3 py-1.5 text-[11px] text-muted sm:flex">
              No saved audit context
            </div>
          )}
        </div>

        <div
          ref={listRef}
          className="relative z-[1] flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-5"
          role="log"
          aria-live="polite"
          aria-relevant="additions"
        >
          {messages.length === 0 ? (
            <div className="mx-auto max-w-2xl rounded-2xl border border-border/50 bg-background/35 px-4 py-4 text-sm leading-7 text-muted sm:px-5">
              {reportContext ? (
                <>
                  <span className="font-medium text-foreground">Context:</span> {reportContext.title}. Try: “Draft a
                  Lovable-ready prompt that closes the top three findings.”
                </>
              ) : (
                "Ask anything — e.g. “How should I explain the projected score to a skeptical client?”"
              )}
            </div>
          ) : null}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div className="flex justify-end" key={`${i}-user`}>
                <div className="max-w-[min(100%,34rem)] rounded-[22px] bg-accent/14 px-4 py-3 text-sm leading-7 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  {m.content}
                </div>
              </div>
            ) : (
              <div className="flex justify-start" key={`${i}-assistant`}>
                <div className="max-w-[min(100%,40rem)] rounded-[22px] border border-border/55 bg-panel/55 px-4 py-3 text-sm leading-7 text-foreground shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
                  <p className="whitespace-pre-wrap">{m.content}</p>
                </div>
              </div>
            ),
          )}

          {pending ? (
            <div className="flex items-center gap-2 text-xs text-muted">
              <Loader2 aria-hidden className="size-4 animate-spin text-accent" />
              Thinking
              <TypingDots />
            </div>
          ) : null}
        </div>

        <div className="relative z-[1] border-t border-border/50 bg-background/55 p-3 sm:p-4">
          {error ? (
            <div className="mb-3 space-y-2" role="alert">
              <p className="text-sm text-danger">{error}</p>
              {errorAction ? (
                <Button asChild className="h-8" size="sm" variant="outline">
                  <Link href={errorAction.href}>{errorAction.label}</Link>
                </Button>
              ) : null}
            </div>
          ) : null}

          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-[22px] border border-border/60 bg-elevated/70 p-3 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-md">
            <label className="sr-only" htmlFor={`${titleId}-composer`}>
              Message to workspace assistant
            </label>
            <textarea
              className={cn(
                "w-full resize-none bg-transparent px-2 py-2 text-sm leading-7 text-foreground outline-none",
                "placeholder:text-muted/80",
              )}
              disabled={pending}
              id={`${titleId}-composer`}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Type your message…"
              ref={textareaRef}
              rows={1}
              value={input}
            />
            <div className="flex items-center justify-end gap-2 border-t border-border/45 pt-2">
              <Button
                aria-label="Send message"
                className="size-11 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
                disabled={pending || !input.trim()}
                onClick={() => void handleSend()}
                size="icon"
                type="button"
              >
                <ArrowUp aria-hidden className="size-5" />
              </Button>
            </div>
          </div>
          <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] leading-5 text-muted">
            Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </div>
    </section>
  );
}
