"use client";

import { useEffect, useRef, useState } from "react";

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
  dense = false,
  animateOnView = true,
}: {
  items: BreakdownItem[];
  targetItems?: BreakdownItem[];
  showWeights?: boolean;
  className?: string;
  /** Tighter rows for compact layouts (e.g. auth preview rail). */
  dense?: boolean;
  /** When true, bars animate from 0 once the module scrolls into view. */
  animateOnView?: boolean;
}) {
  const { reduceMotion } = useMotionSettings();
  const containerRef = useRef<HTMLDivElement>(null);
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const targetMap = new Map(targetItems?.map((item) => [item.key, item]) ?? []);
  const maxWeight = Math.max(...items.map((item) => item.weight), 1);
  const [hasIntersected, setHasIntersected] = useState(false);
  const isAnimationUnlocked = !animateOnView || reduceMotion || hasIntersected;

  useEffect(() => {
    if (!animateOnView || reduceMotion) {
      return;
    }

    const node = containerRef.current;

    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((entry) => entry.isIntersecting);

        if (hit) {
          setHasIntersected(true);
        }
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: [0, 0.12, 0.25] },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, [animateOnView, reduceMotion]);

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

    if (!isAnimationUnlocked) {
      barRefs.current.forEach((node) => {
        if (node) {
          node.style.width = "0%";
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
  }, [items, isAnimationUnlocked, reduceMotion]);

  if (!items.length) {
    return (
      <div className={cn("rounded-[20px] border border-border/60 bg-panel/45 p-5", className)}>
        <p className="text-sm leading-6 text-muted">No score breakdown has been generated yet.</p>
      </div>
    );
  }

  return (
    <div className={cn(dense ? "space-y-1" : "space-y-2", className)} ref={containerRef}>
      {items.map((item, index) => {
        const tone = getScoreTone(item.score);
        const target = targetMap.get(item.key);
        const pct = Math.min(100, Math.max(0, item.score * 10));

        return (
          <div
            className={cn(
              "rounded-2xl border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_92%,transparent),color-mix(in_srgb,var(--theme-background-alt)_88%,transparent))] shadow-sm shadow-background/20",
              dense ? "px-2 py-1.5" : "px-3 py-2.5",
            )}
            key={item.key}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex flex-wrap items-center gap-1.5">
                <h3
                  className={cn(
                    "truncate font-semibold text-foreground",
                    dense ? "text-[11px] leading-tight" : "text-sm",
                  )}
                >
                  {item.label}
                </h3>
                {showWeights ? (
                  <Badge className="normal-case tracking-normal" variant="neutral">
                    {item.weight.toFixed(2)}x
                  </Badge>
                ) : null}
              </div>
              <div className="shrink-0 text-right leading-none">
                <div
                  aria-label={`${item.label} score ${item.score.toFixed(1)} out of 10`}
                  className="flex items-baseline justify-end gap-0.5 tabular-nums"
                >
                  <span
                    className={cn(
                      "font-semibold tracking-tight text-foreground",
                      dense ? "text-sm" : "text-lg sm:text-xl",
                    )}
                  >
                    {item.score.toFixed(1)}
                  </span>
                  <span
                    className={cn(
                      "font-semibold uppercase tracking-[0.12em] text-muted",
                      dense ? "text-[8px]" : "text-[10px]",
                    )}
                  >
                    /10
                  </span>
                </div>
                {target ? (
                  <p
                    className={cn(
                      "font-semibold uppercase tracking-[0.14em] text-muted",
                      dense ? "mt-0.5 text-[8px]" : "mt-1 text-[10px]",
                    )}
                  >
                    Target{" "}
                    <span className="tabular-nums text-foreground">{target.score.toFixed(1)}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <div className={cn("relative", dense ? "mt-1" : "mt-2")} role="presentation">
              <div className={cn("relative w-full", dense ? "h-1.5" : "h-2.5")}>
                <div className="absolute inset-0 rounded-full bg-background/65" />
                {target ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 z-[1] border-r border-dashed border-accent/70"
                    style={{ left: `calc(${Math.min(100, target.score * 10)}% - 1px)` }}
                  />
                ) : null}
                <div
                  className={cn(
                    "relative z-[2] min-w-0 overflow-hidden rounded-full",
                    dense ? "h-1.5" : "h-2.5",
                  )}
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
                </div>
              </div>
            </div>

            {showWeights ? (
              <p
                className={cn(
                  "uppercase tracking-[0.14em] text-muted",
                  dense ? "mt-1 text-[8px]" : "mt-2 text-[10px]",
                )}
              >
                Weight {Math.round((item.weight / maxWeight) * 100)}%
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
