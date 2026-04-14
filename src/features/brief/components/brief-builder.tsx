"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, Copy, FileText, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils/cn";
import type { AuditReport, QuestionnaireResponseSet } from "@/lib/types/audit";
import {
  createDefaultQuestionnaire,
  generateCreativeBrief,
  generateWebsitePrompt,
  generateWireframeHandoff,
} from "@/lib/utils/brief";
import { useBriefStore } from "@/store/brief-store";

function BriefField({
  id,
  label,
  value,
  onChange,
  multiline = false,
  description,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  description?: string;
  placeholder?: string;
}) {
  const descriptionId = description ? `${id}-description` : undefined;

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
      </label>
      {description ? (
        <p className="text-sm leading-6 text-muted" id={descriptionId}>
          {description}
        </p>
      ) : null}
      {multiline ? (
        <textarea
          aria-describedby={descriptionId}
          className="min-h-28 w-full rounded-[8px] border border-border bg-panel/70 px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/35"
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          aria-describedby={descriptionId}
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  );
}

const STEP_LABELS = ["Your business", "Positioning", "Brand & tone", "Scope & timeline"];
const TOTAL_STEPS = 4;

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
      {[1, 2, 3, 4].map((n) => (
        <span
          key={n}
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-[10px]",
            n === step
              ? "bg-accent text-background"
              : n < step
                ? "bg-accent/30 text-accent"
                : "bg-border/40 text-muted",
          )}
        >
          {n}
        </span>
      ))}
      <span className="ml-2">{STEP_LABELS[step - 1]}</span>
    </div>
  );
}

export function BriefBuilder({ report }: { report: AuditReport }) {
  const formIdPrefix = useId();
  const initializeBrief = useBriefStore((state) => state.initializeBrief);
  const updateResponse = useBriefStore((state) => state.updateResponse);
  const setApproved = useBriefStore((state) => state.setApproved);
  const storedResponses = useBriefStore((state) => state.responsesByReport[report.id]);
  const approved = useBriefStore((state) => state.approvedByReport[report.id] ?? false);

  const [step, setStep] = useState(1);
  const [showOutput, setShowOutput] = useState(false);
  const [copied, setCopied] = useState(false);
  const [briefCopied, setBriefCopied] = useState(false);
  const [briefExpanded, setBriefExpanded] = useState(false);

  useEffect(() => {
    initializeBrief(report.id, createDefaultQuestionnaire(report));
  }, [initializeBrief, report]);

  const responses = storedResponses ?? createDefaultQuestionnaire(report);

  const brief = useMemo(() => generateCreativeBrief(report, responses), [report, responses]);
  const handoff = useMemo(
    () => generateWireframeHandoff(report, brief, approved),
    [approved, brief, report],
  );
  const websitePrompt = useMemo(
    () => generateWebsitePrompt(report, responses),
    [report, responses],
  );

  function setField(key: keyof QuestionnaireResponseSet, value: string) {
    updateResponse(report.id, key, value);
  }

  async function copyPrompt() {
    await navigator.clipboard.writeText(websitePrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function copyBrief() {
    const payload = [
      `Creative Brief: ${report.title}`,
      "",
      brief.summary,
      "",
      `Goals: ${brief.goals.join(" | ")}`,
      `Audience: ${brief.audience.join(" | ")}`,
      `Design direction: ${brief.designDirection.join(" | ")}`,
      `Scope: ${brief.scopePriorities.join(" | ")}`,
      `Content needs: ${brief.contentNeeds.join(" | ")}`,
      `Success measures: ${brief.successMeasures.join(" | ")}`,
      "",
      `Wireframe stage: ${handoff.approvalNote}`,
    ].join("\n");

    await navigator.clipboard.writeText(payload);
    setBriefCopied(true);
    setTimeout(() => setBriefCopied(false), 2000);
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else {
      setShowOutput(true);
    }
  }

  function handleBack() {
    if (showOutput) {
      setShowOutput(false);
    } else if (step > 1) {
      setStep(step - 1);
    }
  }

  function handleStartOver() {
    setStep(1);
    setShowOutput(false);
  }

  const id = (suffix: string) => `${formIdPrefix}-${suffix}`;

  return (
    <main className="presentation-section pb-24" id="main-content">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="AI Website Prompt Builder"
          title="Turn your audit into a complete site build brief"
          description="Answer 4 short sections. We'll generate a structured prompt you can paste directly into Claude, ChatGPT, or Cursor to scaffold the entire redesign."
        />

        {showOutput ? (
          /* ── Output panel ── */
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Badge variant="accent">AI prompt ready</Badge>
                    <CardTitle className="mt-3 text-3xl">Your website build prompt</CardTitle>
                    <p className="mt-2 text-sm leading-6 text-muted">
                      Paste this into Claude, ChatGPT, or Cursor to scaffold the full redesign.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleStartOver} variant="secondary">
                      Start over
                    </Button>
                    <Button onClick={copyPrompt}>
                      <Copy className="size-4" />
                      {copied ? "Copied ✓" : "Copy prompt"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-[8px] border border-border bg-background-alt/80 p-5 font-mono text-xs leading-relaxed text-foreground">
                  {websitePrompt}
                </pre>
              </CardContent>
            </Card>

            {/* Collapsible creative brief */}
            <Card>
              <CardHeader>
                <button
                  className="flex w-full items-center justify-between text-left"
                  type="button"
                  onClick={() => setBriefExpanded(!briefExpanded)}
                >
                  <div className="flex items-center gap-2 text-accent">
                    <FileText className="size-4" />
                    <span className="text-sm font-semibold">Creative brief (secondary output)</span>
                  </div>
                  <ChevronRight
                    className={cn(
                      "size-4 text-muted transition-transform",
                      briefExpanded && "rotate-90",
                    )}
                  />
                </button>
              </CardHeader>
              {briefExpanded ? (
                <CardContent className="space-y-5">
                  <div className="rounded-[calc(var(--theme-radius))] border border-accent/20 bg-accent/8 p-4 text-sm leading-6 text-foreground">
                    {brief.summary}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    {[
                      { label: "Goals", items: brief.goals },
                      { label: "Audience", items: brief.audience },
                      { label: "Design direction", items: brief.designDirection },
                      { label: "Scope priorities", items: brief.scopePriorities },
                    ].map(({ label, items }) => (
                      <div
                        key={label}
                        className="space-y-3 rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4"
                      >
                        <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
                        {items.map((item) => (
                          <p key={item} className="text-sm text-foreground">
                            {item}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                  <Button onClick={copyBrief} variant="secondary">
                    <Copy className="size-4" />
                    {briefCopied ? "Copied ✓" : "Copy brief"}
                  </Button>
                </CardContent>
              ) : null}
            </Card>

            {/* Approval gate / wireframe handoff */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card id="handoff">
                <CardHeader>
                  <div className="flex items-center gap-2 text-accent">
                    <Sparkles className="size-4" />
                    Approval gate
                  </div>
                  <CardTitle className="text-3xl">Approve before wireframes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-6 text-muted">
                    Keep build work out of this stage. First approve the brief, the screen
                    priorities, and the wireframe outline.
                  </p>
                  <Button
                    aria-pressed={approved}
                    className="w-full"
                    onClick={() => setApproved(report.id, !approved)}
                  >
                    <CheckCircle2 className="size-4" />
                    {approved ? "Brief approved" : "Approve brief for wireframing"}
                  </Button>
                  <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Status</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">
                      {handoff.approvalNote}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2 text-accent">
                    <FileText className="size-4" />
                    UI / UX handoff
                  </div>
                  <CardTitle className="text-3xl">Wireframe outline</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Screens</p>
                    <div className="mt-3 space-y-2">
                      {handoff.screens.map((screen) => (
                        <p key={screen} className="text-sm text-foreground">
                          {screen}
                        </p>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[calc(var(--theme-radius))] border border-accent/20 bg-accent/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-accent">Next step</p>
                    <p className="mt-2 text-sm leading-6 text-foreground">
                      Once the brief is approved, the UI / UX handoff can move into wireframes.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          /* ── Step wizard ── */
          <div className="mx-auto max-w-2xl space-y-6">
            <StepIndicator step={step} />

            <Card>
              <CardHeader>
                <Badge variant="accent">Step {step} of {TOTAL_STEPS}</Badge>
                <CardTitle className="mt-3 text-3xl">{STEP_LABELS[step - 1]}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                {step === 1 && (
                  <>
                    <BriefField
                      description="Describe what this business does and who it serves in 1–2 sentences."
                      id={id("business-description")}
                      label="Business description"
                      multiline
                      placeholder="A [type] business that helps [audience] achieve [outcome]."
                      value={responses.businessDescription}
                      onChange={(v) => setField("businessDescription", v)}
                    />
                    <BriefField
                      description="Who are the ideal visitors — their role, mindset, and buying stage."
                      id={id("target-audience")}
                      label="Target audience"
                      placeholder="e.g. Operations managers at mid-size manufacturers researching software vendors"
                      value={responses.targetAudience}
                      onChange={(v) => setField("targetAudience", v)}
                    />
                    <BriefField
                      description="What frustrations or obstacles drive them to seek out this solution."
                      id={id("pain-points")}
                      label="Customer pain points"
                      multiline
                      placeholder="e.g. Hard to compare providers, pricing opacity, unclear onboarding process"
                      value={responses.painPoints}
                      onChange={(v) => setField("painPoints", v)}
                    />
                    <BriefField
                      description="What makes this business better or different than alternatives."
                      id={id("unique-value")}
                      label="Unique value"
                      placeholder="e.g. Faster implementation, transparent pricing, dedicated support team"
                      value={responses.uniqueValue}
                      onChange={(v) => setField("uniqueValue", v)}
                    />
                  </>
                )}

                {step === 2 && (
                  <>
                    <BriefField
                      description="Names of 2–4 main competitors visitors might also be considering."
                      id={id("competitors")}
                      label="Main competitors"
                      placeholder="e.g. Acme Corp, Buildify, OldGuard Solutions"
                      value={responses.competitors}
                      onChange={(v) => setField("competitors", v)}
                    />
                    <BriefField
                      description="The specific advantages that make this business the better choice."
                      id={id("differentiators")}
                      label="Key differentiators"
                      multiline
                      placeholder="e.g. 48-hour onboarding vs. 6-week industry average, no lock-in contracts, local support team"
                      value={responses.differentiators}
                      onChange={(v) => setField("differentiators", v)}
                    />
                  </>
                )}

                {step === 3 && (
                  <>
                    <BriefField
                      description="Words that describe the desired voice and feeling of the site."
                      id={id("tone")}
                      label="Voice & tone"
                      placeholder="e.g. confident, clear, modern, approachable"
                      value={responses.tone}
                      onChange={(v) => setField("tone", v)}
                    />
                    <BriefField
                      description="Any color direction, brand colors, or palette preferences."
                      id={id("color-preference")}
                      label="Color direction"
                      placeholder="e.g. Deep navy + warm gold, or match existing brand palette"
                      value={responses.colorPreference}
                      onChange={(v) => setField("colorPreference", v)}
                    />
                    <BriefField
                      description="List what brand assets already exist (logo, photos, icons, copy)."
                      id={id("existing-assets")}
                      label="Existing assets"
                      multiline
                      placeholder="e.g. Logo in SVG, product screenshots, team photos. No written copy yet."
                      value={responses.existingAssets}
                      onChange={(v) => setField("existingAssets", v)}
                    />
                    <BriefField
                      description="Any testimonials, case studies, reviews, or social proof available."
                      id={id("testimonials")}
                      label="Social proof & testimonials"
                      multiline
                      placeholder="e.g. 3 written testimonials, one video case study, 4.8 stars on G2 with 60+ reviews"
                      value={responses.testimonials}
                      onChange={(v) => setField("testimonials", v)}
                    />
                  </>
                )}

                {step === 4 && (
                  <>
                    <BriefField
                      description="Pages that must be present in the initial release."
                      id={id("must-have-pages")}
                      label="Must-have pages"
                      placeholder="e.g. Homepage, Services, About, Pricing, Contact"
                      value={responses.mustHavePages}
                      onChange={(v) => setField("mustHavePages", v)}
                    />
                    <BriefField
                      description="Important functionality or integrations the site must support."
                      id={id("must-have-features")}
                      label="Must-have features"
                      placeholder="e.g. Contact form, booking widget, CMS, live chat"
                      value={responses.mustHaveFeatures}
                      onChange={(v) => setField("mustHaveFeatures", v)}
                    />
                    <BriefField
                      description="What content already exists, and where the gaps are."
                      id={id("content-readiness")}
                      label="Content readiness"
                      placeholder="e.g. Partial — some service descriptions exist, homepage needs full rewrite"
                      value={responses.contentReadiness}
                      onChange={(v) => setField("contentReadiness", v)}
                    />
                    <BriefField
                      description="Launch timing, deadlines, or internal review milestones."
                      id={id("launch-timing")}
                      label="Launch timing"
                      placeholder="e.g. 6–8 weeks from project kickoff, soft launch by Q3"
                      value={responses.launchTiming}
                      onChange={(v) => setField("launchTiming", v)}
                    />
                    <BriefField
                      description="The metric that will define whether the redesign worked."
                      id={id("success-metric")}
                      label="Success metric"
                      placeholder="e.g. 2x qualified leads per month within 90 days of launch"
                      value={responses.successMetric}
                      onChange={(v) => setField("successMetric", v)}
                    />
                    <BriefField
                      description="Additional context, constraints, or notes for the AI or design team."
                      id={id("internal-notes")}
                      label="Additional notes"
                      multiline
                      value={responses.internalNotes}
                      onChange={(v) => setField("internalNotes", v)}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                disabled={step === 1}
                variant="secondary"
                onClick={handleBack}
              >
                <ChevronLeft className="size-4" />
                Back
              </Button>
              <Button onClick={handleNext}>
                {step < TOTAL_STEPS ? (
                  <>
                    Next
                    <ChevronRight className="size-4" />
                  </>
                ) : (
                  <>
                    Generate prompt
                    <Sparkles className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
