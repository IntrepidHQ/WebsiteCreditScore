"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { ExternalLink } from "lucide-react";

import { updateLeadStageInline } from "@/app/app/actions";
import { PreviewImage } from "@/components/common/preview-image";
import { ScoreMeter } from "@/components/common/score-meter";
import { cn } from "@/lib/utils/cn";
import {
  LEAD_KANBAN_COLUMNS,
  leadStageLabel,
} from "@/lib/product/lead-kanban";
import type { LeadRecord } from "@/lib/types/product";
import type { LeadStage } from "@/lib/types/product";

const fallbackPreview = "/previews/fallback-desktop.svg";

const pruneOptimisticStages = (
  map: Partial<Record<string, LeadStage>>,
  leads: LeadRecord[],
): Partial<Record<string, LeadStage>> => {
  const next = { ...map };
  for (const id of Object.keys(next)) {
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === next[id]) {
      delete next[id];
    }
  }
  return next;
};

export const LeadsKanbanBoard = ({ leads }: { leads: LeadRecord[] }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [boardError, setBoardError] = useState<string | null>(null);
  const [optimisticStageByLeadId, setOptimisticStageByLeadId] = useState<
    Partial<Record<string, LeadStage>>
  >({});

  const handleStageChange = useCallback(
    (leadId: string, nextStage: LeadStage) => {
      setBoardError(null);
      setOptimisticStageByLeadId((m) => ({
        ...pruneOptimisticStages(m, leads),
        [leadId]: nextStage,
      }));
      startTransition(async () => {
        const result = await updateLeadStageInline(leadId, nextStage);
        if (result.ok) {
          router.refresh();
          return;
        }
        setOptimisticStageByLeadId((m) => {
          const pruned = pruneOptimisticStages(m, leads);
          const next = { ...pruned };
          delete next[leadId];
          return next;
        });
        setBoardError(result.error);
      });
    },
    [leads, router],
  );

  const getDisplayStage = (lead: LeadRecord) => {
    const pending = optimisticStageByLeadId[lead.id];
    if (pending !== undefined && pending !== lead.stage) {
      return pending;
    }
    return lead.stage;
  };

  return (
    <div className="space-y-4">
      {boardError ? (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger" role="alert">
          {boardError}
        </p>
      ) : null}
      <p aria-live="polite" className="sr-only">
        {isPending ? "Updating pipeline stage…" : ""}
      </p>

      <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:pb-0">
        {LEAD_KANBAN_COLUMNS.map((column) => {
          const columnLeads = leads.filter((lead) =>
            column.stages.includes(getDisplayStage(lead)),
          );

          return (
            <section
              aria-label={`${column.title} column`}
              className="flex w-[min(100%,18rem)] shrink-0 snap-start flex-col rounded-2xl border border-border/60 bg-panel/40 shadow-[var(--theme-shadow)] sm:w-[17.5rem]"
              key={column.id}
            >
              <header className="border-b border-border/50 px-3 py-3">
                <div className="flex items-baseline justify-between gap-2">
                  <h2 className="text-sm font-semibold text-foreground">{column.title}</h2>
                  <span className="rounded-full bg-foreground/8 px-2 py-0.5 text-xs font-medium tabular-nums text-muted">
                    {columnLeads.length}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted">{column.subtitle}</p>
              </header>

              <div className="flex min-h-[10rem] flex-1 flex-col gap-3 p-3">
                {columnLeads.length === 0 ? (
                  <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border/50 bg-panel/30 px-2 py-8 text-center text-xs text-muted">
                    No leads here yet
                  </div>
                ) : (
                  columnLeads.map((lead) => (
                    <article
                      className={cn(
                        "overflow-hidden rounded-xl border border-border/70 bg-panel/80 shadow-sm",
                        isPending && "opacity-60",
                      )}
                      key={lead.id}
                    >
                      <Link
                        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                        href={`/app/leads/${lead.id}`}
                        tabIndex={-1}
                      >
                        <PreviewImage
                          alt={`${lead.title} preview`}
                          className="aspect-[16/7] h-full min-h-24"
                          fallbackSrc={fallbackPreview}
                          src={lead.previewImage ?? fallbackPreview}
                        />
                      </Link>
                      <div className="space-y-3 p-3">
                        <div className="min-w-0">
                          <Link
                            className="font-semibold leading-snug text-foreground underline-offset-4 hover:underline"
                            href={`/app/leads/${lead.id}`}
                          >
                            {lead.title}
                          </Link>
                          <p className="mt-0.5 truncate text-xs text-muted" title={lead.normalizedUrl}>
                            {lead.normalizedUrl}
                          </p>
                        </div>
                        <ScoreMeter
                          className="max-w-full"
                          compact
                          label="Score"
                          projectedScore={lead.projectedScore}
                          score={lead.currentScore}
                          valueClassName="text-lg tracking-[-0.04em]"
                        />
                        <div className="flex flex-col gap-2">
                          <label className="grid gap-1 text-xs font-medium text-foreground" htmlFor={`stage-${lead.id}`}>
                            Stage
                          </label>
                          <select
                            className="h-9 w-full rounded-lg border border-border/70 bg-background/80 px-2 text-xs text-foreground"
                            disabled={isPending}
                            id={`stage-${lead.id}`}
                            onChange={(e) => {
                              handleStageChange(lead.id, e.target.value as LeadStage);
                            }}
                            value={getDisplayStage(lead)}
                          >
                            {LEAD_KANBAN_COLUMNS.map((col) => (
                              <optgroup key={col.id} label={col.title}>
                                {col.stages.map((st) => (
                                  <option key={st} value={st}>
                                    {leadStageLabel(st)}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <div className="flex justify-end border-t border-border/40 pt-2">
                          <Link
                            className="inline-flex items-center gap-1 text-xs font-semibold text-accent underline-offset-4 hover:underline"
                            href={`/app/leads/${lead.id}`}
                          >
                            Open lead
                            <ExternalLink aria-hidden className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
};
