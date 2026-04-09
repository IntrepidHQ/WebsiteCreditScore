"use client";

import { useCallback, useId, useRef, useState, type KeyboardEvent } from "react";
import { Loader2, Send } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";

type ChatTurn = { role: "user" | "assistant"; content: string };

export function AgentChatPanel() {
  const titleId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatTurn[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || pending) {
      return;
    }

    const nextMessages: ChatTurn[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setPending(true);

    try {
      const res = await fetch("/api/app/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = (await res.json()) as { message?: string; error?: string };

      if (!res.ok) {
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
  }, [input, messages, pending]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        void handleSend();
      }
    },
    [handleSend],
  );

  return (
    <section aria-labelledby={titleId} className="space-y-4">
      <SectionHeading
        description="Ask about audits, proposals, or how to talk through scores with clients. Requires ANTHROPIC_API_KEY on the server."
        eyebrow="Assistant"
        title="Workspace agent"
      />
      <Card className="flex max-h-[min(32rem,70vh)] flex-col border-border/70">
        <CardHeader className="shrink-0 space-y-2 pb-2">
          <Badge variant="accent">Beta</Badge>
          <CardTitle className="text-2xl" id={titleId}>
            Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col gap-3">
          <div
            ref={listRef}
            className="min-h-[12rem] flex-1 space-y-3 overflow-y-auto rounded-[calc(var(--theme-radius))] border border-border/60 bg-background-alt/40 p-3"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {messages.length === 0 ? (
              <p className="text-sm text-muted">
                Start a thread — e.g. “How should I explain the projected score to a skeptical client?”
              </p>
            ) : null}
            {messages.map((m, i) => (
              <div
                className={cn(
                  "rounded-lg px-3 py-2 text-sm leading-6",
                  m.role === "user"
                    ? "ml-6 bg-accent/15 text-foreground"
                    : "mr-6 border border-border/50 bg-panel/70 text-foreground",
                )}
                key={`${i}-${m.role}`}
              >
                {m.content}
              </div>
            ))}
            {pending ? (
              <div className="flex items-center gap-2 text-xs text-muted">
                <Loader2 aria-hidden className="size-4 animate-spin" />
                Thinking…
              </div>
            ) : null}
          </div>
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          <div className="flex gap-2">
            <Input
              aria-label="Message to workspace agent"
              autoComplete="off"
              className="min-w-0 flex-1"
              disabled={pending}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message…"
              value={input}
            />
            <Button
              aria-label="Send message"
              disabled={pending || !input.trim()}
              onClick={() => void handleSend()}
              size="icon"
              type="button"
            >
              <Send aria-hidden className="size-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
