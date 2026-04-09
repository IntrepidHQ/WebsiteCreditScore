"use client";

import { useEffect, useState } from "react";

import gsap from "gsap";

import { useMotionSettings } from "@/hooks/use-motion-settings";
import { cn } from "@/lib/utils/cn";
import { getDialMetrics } from "@/lib/utils/score-visuals";

const skeletonCategories = [
  { label: "Visual design", key: "vd" },
  { label: "UX / conversion", key: "ux" },
  { label: "Mobile experience", key: "mb" },
  { label: "Trust / credibility", key: "tr" },
] as const;

/**
 * Full-screen loading state for live scans: dial counts toward 10 while category bars pulse.
 */
export function ScanLoadingOverlay({ active }: { active: boolean }) {
  const { reduceMotion } = useMotionSettings();
  const radius = 64;
  const size = 168;
  const strokeWidth = 11;
  const [displayScore, setDisplayScore] = useState(0);
  const { circumference, dashOffset } = getDialMetrics(Math.min(displayScore, 10), radius);

  useEffect(() => {
    if (!active) {
      setDisplayScore(0);
      return;
    }

    if (reduceMotion) {
      setDisplayScore(7.2);
      return;
    }

    const counter = { value: 0 };
    const scoreTween = gsap.to(counter, {
      value: 10,
      duration: 14,
      ease: "none",
      repeat: -1,
      onUpdate: () => {
        setDisplayScore(Number(counter.value.toFixed(1)));
      },
    });

    return () => {
      scoreTween.kill();
    };
  }, [active, reduceMotion]);

  if (!active) {
    return null;
  }

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/88 px-4 py-10 backdrop-blur-md"
      role="status"
    >
      <span className="sr-only">Generating audit, please wait</span>
      <div
        className={cn(
          "w-full max-w-lg rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]",
        )}
      >
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Live scan in progress
        </p>
        <div className="mt-5 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <svg
              aria-hidden
              className="rotate-[-90deg]"
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              width={size}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                fill="none"
                r={radius}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                fill="none"
                r={radius}
                stroke="var(--theme-accent)"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="font-display text-[3.25rem] leading-none tracking-[-0.05em] text-foreground">
                {displayScore.toFixed(1)}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                out of 10
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {skeletonCategories.map((row) => (
            <div className="space-y-1.5" key={row.key}>
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                <span>{row.label}</span>
                <span className="text-foreground/70">…</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-background/40">
                <div
                  className={cn(
                    "h-full rounded-full bg-[linear-gradient(90deg,rgba(247,178,27,0.95),rgba(247,178,27,0.35))]",
                    reduceMotion ? "w-[55%]" : "w-[45%] animate-pulse",
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm leading-6 text-muted">
          Scoring the live site, benchmarks, and trust signals — this usually takes a moment.
        </p>
      </div>
    </div>
  );
}
