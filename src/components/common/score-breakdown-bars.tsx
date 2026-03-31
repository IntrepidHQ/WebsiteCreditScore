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
    <div className={cn("rounded-[24px] border border-border/60 bg-panel/45 p-5", className)}>
      <div className="space-y-4">
        {items.map((item, index) => {
          const tone = getScoreTone(item.score);
          const target = targetMap.get(item.key);

          return (
            <div key={item.key}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2">
                  <h3 className="truncate text-sm font-semibold text-foreground">{item.label}</h3>
                  {showWeights ? (
                    <Badge className="normal-case tracking-normal" variant="neutral">
                      {item.weight.toFixed(2)}x
                    </Badge>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  {target ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Target {target.score.toFixed(1)}
                    </p>
                  ) : null}
                  <p className="text-sm font-semibold text-foreground">{item.score.toFixed(1)}</p>
                </div>
              </div>
              <div className="relative h-3 overflow-hidden rounded-full bg-background/65">
                {target ? (
                  <div
                    aria-hidden="true"
                    className="absolute inset-y-0 border-r border-dashed border-accent/65"
                    style={{ left: `calc(${target.score * 10}% - 1px)` }}
                  />
                ) : null}
                <div
                  className="h-full rounded-full"
                  ref={(node) => {
                    barRefs.current[index] = node;
                  }}
                  style={{
                    backgroundImage: toneFills[tone],
                    width: reduceMotion ? `${item.score * 10}%` : "0%",
                  }}
                />
              </div>
              {showWeights ? (
                <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-muted">
                  Weight {Math.round((item.weight / maxWeight) * 100)}%
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
