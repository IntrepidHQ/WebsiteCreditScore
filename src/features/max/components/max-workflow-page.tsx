"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useTransition } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCopy,
} from "lucide-react";

import { AnthropicLogo, OpenAILogo, LovableLogo } from "@/components/brand-logos/provider-logos";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type ProviderId = "claude" | "codex" | "lovable";

const providers: Array<{
  id: ProviderId;
  name: string;
  description: string;
  note: string;
  LogoComponent: React.ComponentType<{ className?: string }>;
  creditRange: string;
}> = [
  {
    id: "claude",
    name: "Claude",
    description: "Best for fast iteration on copy, structure, and clear design direction.",
    note: "Paste the MAX handoff and iterate section-by-section. New accounts start with $5 free credits — enough for several design passes.",
    LogoComponent: AnthropicLogo,
    creditRange: "$5 free",
  },
  {
    id: "codex",
    name: "Codex",
    description: "Best for implementation detail, component structure, and product flow.",
    note: "Use it when you want the redesign turned into actual code and UI systems. OpenAI API credits apply.",
    LogoComponent: OpenAILogo,
    creditRange: "API credits",
  },
  {
    id: "lovable",
    name: "Lovable",
    description: "Best for quick V1 delivery when you want the site assembled and deployable within the $20–$25 sign-up window.",
    note: "New users get $20–$25 in credits on sign-up — enough to deploy a full site from the MAX handoff. Use the referral invite to ensure credits are available before pasting.",
    LogoComponent: LovableLogo,
    creditRange: "$20–$25 free",
  },
];

export type MaxSavedReportOption = {
  id: string;
  title: string;
  normalizedUrl: string;
  updatedAt: string;
};

const formatMaxApiError = (code: string | undefined, fallback: string) => {
  if (code === "AUTH_REQUIRED") return "Sign in to generate a handoff.";
  if (code === "MAX_GATED") return "MAX upgrade required to generate handoff prompts.";
  if (code === "INSUFFICIENT_TOKENS") return "Not enough tokens for MAX prompt.";
  return fallback;
};

export function MaxWorkflowPage({
  availableTokens,
  hasAccess,
  savedReportOptions,
}: {
  availableTokens: number;
  hasAccess: boolean;
  savedReportOptions: MaxSavedReportOption[];
}) {
  const [tokenBalance, setTokenBalance] = useState(availableTokens);
  const [selectedReportId, setSelectedReportId] = useState(
    () => savedReportOptions[0]?.id ?? "",
  );
  const [handoffMarkdown, setHandoffMarkdown] = useState<string | null>(null);
  const [codingAgentPrompt, setCodingAgentPrompt] = useState<string | null>(null);
  const [handoffSource, setHandoffSource] = useState<"claude" | "template" | null>(null);
  const [handoffTab, setHandoffTab] = useState<"design" | "coding">("coding");
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedProvider, setSelectedProvider] = useState<ProviderId>("lovable");

  useEffect(() => {
    setTokenBalance(availableTokens);
  }, [availableTokens]);

  useEffect(() => {
    if (!savedReportOptions.some((o) => o.id === selectedReportId) && savedReportOptions[0]) {
      setSelectedReportId(savedReportOptions[0].id);
    }
  }, [savedReportOptions, selectedReportId]);

  const selectedReport = savedReportOptions.find((o) => o.id === selectedReportId);

  const handleGenerateAndCopy = useCallback(() => {
    if (!selectedReportId) {
      return;
    }

    startTransition(async () => {
      setErrorMessage(null);
      setCopied(false);

      try {
        const res = await fetch("/api/app/max-build-prompt", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reportId: selectedReportId }),
        });
        const data = (await res.json()) as {
          handoffMarkdown?: string;
          codingAgentPrompt?: string;
          prompt?: string;
          source?: "claude" | "template";
          balance?: number;
          error?: string;
          code?: string;
          redirectTo?: string;
        };

        if (!res.ok) {
          if (data.redirectTo) {
            window.location.href = data.redirectTo;
            return;
          }
          setErrorMessage(formatMaxApiError(data.code, data.error ?? "Could not generate MAX handoff."));
          return;
        }

        const md = (data.handoffMarkdown ?? data.prompt ?? "").trim();
        const coding = (data.codingAgentPrompt ?? "").trim();
        if (md || coding) {
          setHandoffMarkdown(md || null);
          setCodingAgentPrompt(coding || null);
          setHandoffSource(data.source ?? "template");
          if (typeof data.balance === "number") {
            setTokenBalance(data.balance);
          }
          const primaryClipboard = coding || md;
          await navigator.clipboard.writeText(primaryClipboard);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Request failed.");
      }
    });
  }, [selectedReportId]);

  const selected = providers.find((provider) => provider.id === selectedProvider) ?? providers[2];

  return (
    <div className="grid gap-8">
      <SectionHeading
        eyebrow="MAX workflow"
        title="Generate a coding-agent handoff from any saved audit"
        description="Claude assembles a pricing-aware build brief (fallbacks to a deep template when AI is off). Dataroom images are injected automatically when you upload them."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="space-y-3">
            <div className="flex items-center gap-2 text-accent">
              <ClipboardCopy className="size-4" />
              <span className="text-xs uppercase tracking-[0.16em]">Handoff output</span>
            </div>
            <CardTitle className="font-display text-[2.35rem]">
              {selectedReport ? selectedReport.title : "Save an audit first"}
            </CardTitle>
            <p className="text-sm leading-6 text-muted">
              {selectedReport
                ? "Pick a saved report, generate once per audit (tokens apply on first unlock), then paste into your builder."
                : "Run a scan from the dashboard and save it so it appears here."}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {hasAccess ? (
              <>
                {savedReportOptions.length > 0 ? (
                  <label className="grid gap-2 text-sm font-semibold text-foreground" htmlFor="max-report">
                    Saved audit
                    <select
                      className="h-11 rounded-[8px] border border-border/70 bg-panel/80 px-3 text-sm text-foreground"
                      id="max-report"
                      onChange={(e) => {
                        setSelectedReportId(e.target.value);
                        setHandoffMarkdown(null);
                        setCodingAgentPrompt(null);
                        setHandoffSource(null);
                      }}
                      value={selectedReportId}
                    >
                      {savedReportOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.title} — {opt.normalizedUrl.replace(/^https?:\/\//, "")}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                <div className="flex flex-wrap items-center gap-2">
                  {providers.map((provider) => (
                    <button
                      className={
                        provider.id === selectedProvider
                          ? "inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-accent"
                          : "inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-panel/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted"
                      }
                      key={provider.id}
                      onClick={() => setSelectedProvider(provider.id)}
                      type="button"
                    >
                      <provider.LogoComponent className="size-3.5" />
                      {provider.name}
                    </button>
                  ))}
                </div>

                <div className="rounded-[12px] border border-border/70 bg-background-alt/70 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Handoff output</p>
                    {handoffSource ? (
                      <Badge variant={handoffSource === "claude" ? "accent" : "neutral"}>
                        {handoffSource === "claude" ? "Claude generated" : "Template fallback"}
                      </Badge>
                    ) : null}
                  </div>
                  {handoffMarkdown || codingAgentPrompt ? (
                    <Tabs className="mt-3" onValueChange={(v) => setHandoffTab(v as "design" | "coding")} value={handoffTab}>
                      <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger type="button" value="coding">
                          Coding agent prompt
                        </TabsTrigger>
                        <TabsTrigger type="button" value="design">
                          Design handoff (markdown)
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent className="mt-3" value="coding">
                        <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-foreground">
                          {codingAgentPrompt ?? "—"}
                        </pre>
                      </TabsContent>
                      <TabsContent className="mt-3" value="design">
                        <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-foreground">
                          {handoffMarkdown ?? "—"}
                        </pre>
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <pre className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-7 text-muted">
                      Generate a handoff to populate this panel. First generation per saved audit uses 2 tokens
                      (deduped per audit). The coding tab is copied automatically after generate.
                    </pre>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    disabled={isPending || !selectedReportId}
                    onClick={() => void handleGenerateAndCopy()}
                    variant="secondary"
                  >
                    <ClipboardCopy className="size-4" />
                    {isPending
                      ? "Generating…"
                      : copied
                        ? "Copied coding prompt"
                        : "Generate & copy coding prompt"}
                  </Button>
                  {codingAgentPrompt ? (
                    <Button
                      disabled={isPending}
                      onClick={() => void navigator.clipboard.writeText(codingAgentPrompt)}
                      type="button"
                      variant="outline"
                    >
                      Copy coding prompt
                    </Button>
                  ) : null}
                  {handoffMarkdown ? (
                    <Button
                      disabled={isPending}
                      onClick={() => void navigator.clipboard.writeText(handoffMarkdown)}
                      type="button"
                      variant="outline"
                    >
                      Copy design markdown
                    </Button>
                  ) : null}
                  {selectedProvider === "lovable" ? (
                    <Button asChild>
                      <Link href="https://lovable.dev/invite/TIP0SAM" rel="noreferrer" target="_blank">
                        Open Lovable invite
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  ) : null}
                  <Button asChild variant="outline">
                    <Link href="/app/dataroom">
                      Dataroom
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
                <p className="text-xs leading-6 text-muted">
                  Token balance after last action: {tokenBalance}. Upload client images in Dataroom so URLs flow
                  into this handoff.
                </p>
                {errorMessage ? (
                  <p className="text-sm leading-6 text-danger" role="alert">
                    {errorMessage}
                  </p>
                ) : null}
              </>
            ) : (
              <div className="grid gap-4 rounded-[12px] border border-accent/20 bg-accent/8 p-5">
                <div className="flex items-center gap-2 text-accent">
                  <CheckCircle2 className="size-4" />
                  <p className="text-xs font-bold uppercase tracking-[0.1em]">MAX gated</p>
                </div>
                <p className="text-base leading-7 text-foreground">
                  Add the MAX upgrade on pricing to unlock build prompts and private delivery.
                </p>
                <Button asChild>
                  <Link href="/pricing">
                    Unlock MAX
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-accent">
                  <selected.LogoComponent className="size-4" />
                  <span className="text-xs uppercase tracking-[0.16em]">Choose a builder</span>
                </div>
                <Badge variant="neutral">{selected.creditRange}</Badge>
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
                    New users should use the referral link first so the extra credits are available before the prompt
                    gets pasted.
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
              <p className="border-t border-border/40 pt-3 text-xs italic leading-6 text-muted">
                WebsiteCreditScore.com is not affiliated with, sponsored by, or endorsed by
                Anthropic, OpenAI, or Lovable. These are independent third-party tools.
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Pricing aware",
                body: "Handoffs reference deliverables and score lifts from the catalog so builders know what “done” means.",
              },
              {
                title: "Dataroom URLs",
                body: "Upload logos and photography once — we embed the public URLs inside the prompt automatically.",
              },
              {
                title: "Support loop",
                body: "Pair with the workspace agent on Settings for benchmark interpretation and follow-up prompts.",
              },
              {
                title: "What wins",
                body: "Clear IA, proof, CTA discipline, and performance/a11y acceptance checks spelled out for engineers.",
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
