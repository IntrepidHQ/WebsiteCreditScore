"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { CheckCircle2, Copy, FileText, Sparkles } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { AuditReport, QuestionnaireResponseSet } from "@/lib/types/audit";
import {
  createDefaultQuestionnaire,
  generateCreativeBrief,
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
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  description?: string;
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
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <Input
          aria-describedby={descriptionId}
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
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
  const [message, setMessage] = useState("");

  useEffect(() => {
    initializeBrief(report.id, createDefaultQuestionnaire(report));
  }, [initializeBrief, report]);

  const responses =
    storedResponses ?? createDefaultQuestionnaire(report);

  const brief = useMemo(
    () => generateCreativeBrief(report, responses),
    [report, responses],
  );
  const handoff = useMemo(
    () => generateWireframeHandoff(report, brief, approved),
    [approved, brief, report],
  );

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
    setMessage("Creative brief copied.");
  }

  function setField(key: keyof QuestionnaireResponseSet, value: string) {
    updateResponse(report.id, key, value);
  }

  return (
    <main className="presentation-section pb-24" id="main-content">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Creative brief"
          title="Turn discovery answers into a wireframe-ready brief"
          description="Use this after the first outreach lands. The goal is to clarify scope, tone, and priorities before UI/UX work starts."
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="space-y-6">
            <Card id="questionnaire">
              <CardHeader>
                <Badge variant="accent">Discovery questionnaire</Badge>
                <CardTitle className="mt-3 text-3xl">Capture the client’s actual goals</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <BriefField
                  description="The main business result this site should support."
                  id={`${formIdPrefix}-primary-goal`}
                  label="Primary goal"
                  value={responses.primaryGoal}
                  onChange={(value) => setField("primaryGoal", value)}
                />
                <BriefField
                  description="The primary action visitors should take when the site is working well."
                  id={`${formIdPrefix}-primary-action`}
                  label="Primary action"
                  value={responses.primaryAction}
                  onChange={(value) => setField("primaryAction", value)}
                />
                <BriefField
                  description="A few words that should influence tone, visuals, and messaging."
                  id={`${formIdPrefix}-brand-keywords`}
                  label="Brand keywords"
                  value={responses.brandKeywords}
                  onChange={(value) => setField("brandKeywords", value)}
                />
                <BriefField
                  description="Pages that must be present in the initial release."
                  id={`${formIdPrefix}-must-have-pages`}
                  label="Must-have pages"
                  value={responses.mustHavePages}
                  onChange={(value) => setField("mustHavePages", value)}
                />
                <BriefField
                  description="Important functionality or integrations the final site must support."
                  id={`${formIdPrefix}-must-have-features`}
                  label="Must-have features"
                  value={responses.mustHaveFeatures}
                  onChange={(value) => setField("mustHaveFeatures", value)}
                />
                <BriefField
                  description="What content exists already, and where the gaps still are."
                  id={`${formIdPrefix}-content-readiness`}
                  label="Content readiness"
                  value={responses.contentReadiness}
                  onChange={(value) => setField("contentReadiness", value)}
                />
                <BriefField
                  description="Launch timing, deadlines, or internal review milestones."
                  id={`${formIdPrefix}-launch-timing`}
                  label="Launch timing"
                  value={responses.launchTiming}
                  onChange={(value) => setField("launchTiming", value)}
                />
                <BriefField
                  description="The metric that will define whether the redesign worked."
                  id={`${formIdPrefix}-success-metric`}
                  label="Success metric"
                  value={responses.successMetric}
                  onChange={(value) => setField("successMetric", value)}
                />
                <div className="md:col-span-2">
                  <BriefField
                    description="Additional context, risks, or internal notes for the design team."
                    id={`${formIdPrefix}-internal-notes`}
                    label="Internal notes"
                    multiline
                    value={responses.internalNotes}
                    onChange={(value) => setField("internalNotes", value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card id="brief">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge variant="accent">Creative brief output</Badge>
                    <CardTitle className="mt-3 text-3xl">What the UI/UX team should build toward</CardTitle>
                  </div>
                  <Button onClick={copyBrief} variant="secondary">
                    <Copy className="size-4" />
                    Copy brief
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="rounded-[calc(var(--theme-radius))] border border-accent/20 bg-accent/8 p-4 text-sm leading-6 text-foreground">
                  {brief.summary}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3 rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Goals</p>
                    {brief.goals.map((item) => (
                      <p key={item} className="text-sm text-foreground">
                        {item}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-3 rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Audience</p>
                    {brief.audience.map((item) => (
                      <p key={item} className="text-sm text-foreground">
                        {item}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-3 rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Design direction</p>
                    {brief.designDirection.map((item) => (
                      <p key={item} className="text-sm text-foreground">
                        {item}
                      </p>
                    ))}
                  </div>
                  <div className="space-y-3 rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-muted">Scope priorities</p>
                    {brief.scopePriorities.map((item) => (
                      <p key={item} className="text-sm text-foreground">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
                {message ? (
                  <p
                    className="rounded-2xl border border-accent/20 bg-accent/8 px-4 py-3 text-sm text-foreground"
                    role="status"
                  >
                    {message}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:h-fit">
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
                <div className="rounded-[calc(var(--theme-radius))] border border-border/70 bg-background-alt/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">Structure</p>
                  <div className="mt-3 space-y-2">
                    {handoff.structure.map((item) => (
                      <p key={item} className="text-sm text-foreground">
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
                <div className="rounded-[calc(var(--theme-radius))] border border-accent/20 bg-accent/8 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-accent">Next step</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    Keep build work out of this stage. Once the brief is approved, the UI / UX handoff can move into wireframes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
