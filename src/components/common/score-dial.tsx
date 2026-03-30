"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import gsap from "gsap";

import { Badge } from "@/components/ui/badge";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import { getScoreBandLabel, getScoreBandVariant } from "@/lib/utils/scores";
import { cn } from "@/lib/utils/cn";
import { getDialMetrics } from "@/lib/utils/score-visuals";

const toneStroke = {
  success: "#3dd598",
  accent: "#f7b21b",
  warning: "#ffcf66",
  danger: "#ff8b8b",
} as const;

export function ScoreDial({
  score,
  label,
  bandLabel,
  projectedScore,
  className,
}: {
  score: number;
  label: string;
  bandLabel?: string;
  projectedScore?: number;
  className?: string;
}) {
  const { reduceMotion } = useMotionSettings();
  const radius = 76;
  const size = 196;
  const strokeWidth = 12;
  const progressRef = useRef<SVGCircleElement>(null);
  const [displayScore, setDisplayScore] = useState(reduceMotion ? score : 0);
  const resolvedBandLabel = bandLabel ?? getScoreBandLabel(score);
  const bandVariant = getScoreBandVariant(score);
  const strokeColor = toneStroke[bandVariant];
  const metrics = useMemo(() => getDialMetrics(score, radius), [score, radius]);
  const showProjected =
    typeof projectedScore === "number" && projectedScore > score + 0.05;
  const resolvedDisplayScore = reduceMotion ? score : displayScore;

  useEffect(() => {
    if (reduceMotion) {
      if (progressRef.current) {
        progressRef.current.style.strokeDashoffset = `${metrics.dashOffset}`;
      }

      return;
    }

    const counter = { value: 0, dashOffset: metrics.circumference };

    const animation = gsap.to(counter, {
      value: score,
      dashOffset: metrics.dashOffset,
      duration: 1.1,
      ease: "power3.out",
      onUpdate: () => {
        setDisplayScore(Number(counter.value.toFixed(1)));

        if (progressRef.current) {
          progressRef.current.style.strokeDashoffset = `${counter.dashOffset}`;
        }
      },
    });

    return () => animation.kill();
  }, [metrics.circumference, metrics.dashOffset, reduceMotion, score]);

  return (
    <div
      className={cn(
        "rounded-[24px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_82%,transparent),color-mix(in_srgb,var(--theme-background-alt)_94%,transparent))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.2)]",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
          {label}
        </p>
        <Badge variant={bandVariant}>{resolvedBandLabel}</Badge>
      </div>

      <div className="mt-6 grid place-items-center">
        <div className="relative">
          <svg
            aria-hidden="true"
            className="block"
            fill="none"
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            width={size}
          >
            <defs>
              <linearGradient id="score-dial-track" x1="0%" x2="100%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
              </linearGradient>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#score-dial-track)"
              strokeWidth={strokeWidth}
            />
            <circle
              cx={size / 2}
              cy={size / 2}
              ref={progressRef}
              r={radius}
              stroke={strokeColor}
              strokeDasharray={metrics.circumference}
              strokeDashoffset={reduceMotion ? metrics.dashOffset : metrics.circumference}
              strokeLinecap="round"
              strokeWidth={strokeWidth}
              style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
            />
          </svg>

          <div className="absolute inset-0 grid place-items-center">
            <div className="space-y-1 text-center">
              <p className="font-display text-[clamp(3.1rem,2.3rem+0.8vw,4rem)] leading-[0.9] tracking-[-0.05em] text-foreground">
                {resolvedDisplayScore.toFixed(1)}
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">
                Score
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm leading-6 text-muted">Benchmark-ready work generally clears 8.</p>
        {showProjected ? (
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
            Target {projectedScore.toFixed(1)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
