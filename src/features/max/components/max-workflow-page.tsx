"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCopy,
  Code2,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AuditReport } from "@/lib/types/audit";
import { buildMaxPrompt } from "@/lib/max/prompt";

type ProviderId = "claude" | "codex" | "lovable";

const providers: Array<{
  id: ProviderId;
  name: string;
  description: string;
  note: string;
  icon: typeof Sparkles;
}> = [
  {
    id: "claude",
    name: "Claude",
    description: "Best for fast iteration on copy, structure, and clear design direction.",
    note: "Paste the MAX prompt and push the first-pass layout toward clarity.",
    icon: Sparkles,
  },
  {
    id: "codex",
    name: "Codex",
    description: "Best for implementation detail, component structure, and product flow.",
    note: "Use it when you want the redesign turned into actual code and UI systems.",
    icon: Code2,
  },
  {
    id: "lovable",
    name: "Lovable",
    description: "Best for quick V1 delivery when you want the site assembled and deployable.",
    note: "New users should route through the referral invite so the credits are available.",
    icon: WandSparkles,
  },
];

export function MaxWorkflowPage({ report }: { report: AuditReport | null }) {
  const prompt = useMemo(() => buildMaxPrompt(report), [report]);
  const [unlocked, setUnlocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>("lovable");

  async function copyPrompt() {
    await navigator.clipboard.writeText(prompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  async function enableMax() {
    setUnlocked(true);
    await copyPrompt();
  }

  const selected = providers.find((provider) => provider.id === selectedProvider) ?? providers[2];

  return (
    <div className="grid gap-8">
      <SectionHeading
        eyebrow="MAX workflow"
        title="Generate the prompt and move to build"
        description="MAX is gated. Unlock it to copy a clean prompt, then move the redesign into Claude, Codex, or Lovable."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <ClipboardCopy className="size-4" />
              <span className="text-xs uppercase tracking-[0.16em]">Prompt output</span>
            </div>
            <CardTitle className="font-display text-[2.35rem]">
              {report ? report.title : "Scan a site first"}
            </CardTitle>
            <p className="text-sm leading-6 text-muted">
              {report
                ? "This prompt comes from the live audit, benchmark references, and the brand cues already in the report."
                : "Generate a scan first so MAX can turn the audit into a usable build prompt."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {unlocked ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  {providers.map((provider) => (
                    <button
                      className={
                        provider.id === selectedProvider
                          ? "inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-accent"
                          : "inline-flex items-center rounded-full border border-border/70 bg-panel/70 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-muted"
                      }
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      type="button"
                    >
                      {provider.name}
                    </button>
                  ))}
                </div>

                <div className="rounded-[12px] border border-border/70 bg-background-alt/70 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Clipboard prompt</p>
                  <pre className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-foreground">
                    {prompt}
                  </pre>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button onClick={copyPrompt} variant="secondary">
                    <ClipboardCopy className="size-4" />
                    {copied ? "Copied" : "Copy prompt"}
                  </Button>
                  {selectedProvider === "lovable" ? (
                    <Button asChild>
                      <Link href="https://lovable.dev/invite/TIP0SAM" rel="noreferrer" target="_blank">
                        Open Lovable invite
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="grid gap-4 rounded-[12px] border border-accent/20 bg-accent/8 p-5">
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle2 className="size-4" />
                  <p className="text-xs font-bold uppercase tracking-[0.1em]">MAX gated</p>
                </div>
                <p className="text-base leading-7 text-foreground">
                  Unlock MAX to generate the build prompt and copy it straight to your clipboard.
                </p>
                <Button onClick={enableMax}>
                  Unlock MAX
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
                <selected.icon className="size-4" />
                <span className="text-xs uppercase tracking-[0.16em]">Choose a builder</span>
              </div>
              <CardTitle className="font-display text-[2.1rem]">{selected.name}</CardTitle>
              <p className="text-sm leading-6 text-muted">{selected.description}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-7 text-foreground">{selected.note}</p>
              {selectedProvider === "lovable" ? (
                <div className="rounded-[12px] border border-border/70 bg-background-alt/70 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Lovable invite</p>
                  <p className="mt-2 text-sm leading-7 text-foreground">
                    New users should use the referral link first so the extra credits are available
                    before the prompt gets pasted.
                  </p>
                  <div className="mt-3">
                    <Button asChild variant="secondary">
                      <Link href="https://lovable.dev/invite/TIP0SAM" rel="noreferrer" target="_blank">
                        Use referral invite
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Day 1 to Day 6",
                body: "Use the prompt, build the first pass, then tune it with real feedback.",
              },
              {
                title: "Support loop",
                body: "Stay close through edits so the final handoff feels familiar and fast.",
              },
              {
                title: "Brand cues",
                body: "Pull from the prospect’s current site and public socials for images and logos.",
              },
              {
                title: "What wins",
                body: "Shorter prompts, sharper hierarchy, and less decoration.",
              },
            ].map((item) => (
              <Card key={item.title}>
                <CardContent className="space-y-2 p-4">
                  <Badge variant="neutral">{item.title}</Badge>
                  <p className="text-sm leading-7 text-muted">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
