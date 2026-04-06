"use client";

import { useEffect, useRef } from "react";

import gsap from "gsap";

import { Badge } from "@/components/ui/badge";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import { cn } from "@/lib/utils/cn";
import { getScoreTone } from "@/lib/utils/scores";
import type { AuditCategoryScore } from "@/lib/types/audit";

const toneFills = {
  success: "linear-gradient(90deg, rgba(61,213,152,0.9), rgba(61,213,152,0.45))",
  accent: "linear-gradient(90deg, rgba(247,178,27,0.9), rgba(247,178,27,0.48))",
  warning: "linear-gradient(90deg, rgba(255,207,102,0.9), rgba(255,207,102,0.42))",
  danger: "linear-gradient(90deg, rgba(255,139,139,0.92), rgba(255,139,139,0.45))",
} as const;

type BreakdownItem = Pick<AuditCategoryScore, "key" | "label" | "score" | "weight">;

export function ScoreBreakdownBars({
  items,
  targetItems,
  showWeights,
  className,
}: {
  items: BreakdownItem[];
  targetItems?: BreakdownItem[];
  showWeights?: boolean;
  className?: string;
}) {
  const { reduceMotion } = useMotionSettings();
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const targetMap = new Map(targetItems?.map((item) => [item.key, item]) ?? []);
  const maxWeight = Math.max(...items.map((item) => item.weight), 1);

  useEffect(() => {
    if (!items.length) {
      return;
    }

    if (reduceMotion) {
      barRefs.current.forEach((node, index) => {
        const score = items[index]?.score ?? 0;

        if (node) {
          node.style.width = `${score * 10}%`;
        }
      });

      return;
    }

    const animation = gsap.fromTo(
      barRefs.current.filter(Boolean),
      { width: 0 },
      {
        width: (index) => `${(items[index]?.score ?? 0) * 10}%`,
        duration: 0.85,
        stagger: 0.06,
        ease: "power3.out",
      },
    );

    return () => {
      animation.kill();
    };
  }, [items, reduceMotion]);

  if (!items.length) {
    return (
      <div className={cn("rounded-[20px] border border-border/60 bg-panel/45 p-5", className)}>
        <p className="text-sm leading-6 text-muted">No score breakdown has been generated yet.</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => {
        const tone = getScoreTone(item.score);
        const target = targetMap.get(item.key);
        const pct = Math.min(100, Math.max(0, item.score * 10));

        return (
          <div
            className="rounded-[18px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_92%,transparent),color-mix(in_srgb,var(--theme-background-alt)_88%,transparent))] p-4 shadow-sm shadow-background/20"
            key={item.key}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-foreground">{item.label}</h3>
                {showWeights ? (
                  <Badge className="normal-case tracking-normal" variant="neutral">
                    {item.weight.toFixed(2)}x
                  </Badge>
                ) : null}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Your score</p>
                <p className="mt-0.5 font-sans text-2xl font-semibold tabular-nums tracking-tight text-foreground">
                  {item.score.toFixed(1)}
                </p>
              </div>
              {target ? (
                <div className="text-right">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">Target</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums tracking-tight text-muted">
                    {target.score.toFixed(1)}
                  </p>
                </div>
              ) : null}
            </div>

            <div
              aria-label={`${item.label} score ${item.score.toFixed(1)} out of 10`}
              className="relative mt-4"
              role="group"
            >
              <div className="relative h-4 w-full">
                <div className="absolute inset-0 rounded-full bg-background/65" />
                {target ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 z-[1] border-r border-dashed border-accent/70"
                    style={{ left: `calc(${Math.min(100, target.score * 10)}% - 1px)` }}
                  />
                ) : null}
                <div
                  className="relative z-[2] h-4 min-w-0 overflow-visible rounded-full"
                  data-testid={`score-bar-fill-${item.key}`}
                  ref={(node) => {
                    barRefs.current[index] = node;
                  }}
                  style={{
                    width: reduceMotion ? `${pct}%` : "0%",
                  }}
                >
                  <div
                    className="h-full w-full rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                    style={{ backgroundImage: toneFills[tone] }}
                  />
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute bottom-full left-full z-[3] mb-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-accent/45 bg-accent/20 px-2 py-0.5 text-[11px] font-bold tabular-nums text-accent shadow-sm backdrop-blur-sm"
                  >
                    {item.score.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {showWeights ? (
              <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted">
                Weight {Math.round((item.weight / maxWeight) * 100)}%
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
