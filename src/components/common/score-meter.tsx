"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

import gsap from "gsap";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import { getScoreBandLabel, getScoreBandVariant } from "@/lib/utils/scores";

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;

  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  cx: number,
  cy: number,
  radius: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, radius, endAngle);
  const end = polarToCartesian(cx, cy, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M",
    start.x,
    start.y,
    "A",
    radius,
    radius,
    0,
    largeArcFlag,
    0,
    end.x,
    end.y,
  ].join(" ");
}

function scoreToAngle(score: number) {
  const normalized = Math.max(0, Math.min(10, Number(score.toFixed(1)))) / 10;

  return 180 - normalized * 180;
}

function clampMeterScore(value: number) {
  return Math.max(0, Math.min(10, Number(value.toFixed(1))));
}

const ScoreArc = React.forwardRef<
  SVGPathElement,
  {
    score: number;
    colorClassName: string;
    strokeWidth?: number;
    opacity?: number;
  }
>(function ScoreArc({ score, colorClassName, strokeWidth = 12, opacity = 1 }, ref) {
  return (
    <path
      ref={ref}
      d={describeArc(100, 100, 76, 180, scoreToAngle(score))}
      fill="none"
      opacity={opacity}
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth={strokeWidth}
      className={colorClassName}
    />
  );
});

export function ScoreMeter({
  score,
  projectedScore,
  label = "Score",
  compact = false,
  className,
  valueClassName,
}: {
  score: number;
  projectedScore?: number;
  label?: string;
  compact?: boolean;
  className?: string;
  valueClassName?: string;
}) {
  const { reduceMotion } = useMotionSettings();
  const currentScore = clampMeterScore(score);
  const hasProjection =
    typeof projectedScore === "number" && Math.abs(projectedScore - currentScore) >= 0.05;
  const projectionScore = hasProjection ? clampMeterScore(projectedScore) : null;
  const bandLabel = getScoreBandLabel(currentScore);
  const bandVariant = getScoreBandVariant(currentScore);
  const currentValueRef = useRef<HTMLParagraphElement>(null);
  const projectedValueRef = useRef<HTMLParagraphElement>(null);
  const currentArcRef = useRef<SVGPathElement>(null);
  const projectionArcRef = useRef<SVGPathElement>(null);
  const previousScoreRef = useRef(0);
  const previousProjectionRef = useRef(0);

  const segmentAngles = Array.from({ length: 5 }, (_, index) => {
    const segmentSize = 180 / 5;
    const gap = 4;
    const start = 180 - index * segmentSize;
    const end = 180 - (index + 1) * segmentSize + gap;

    return { start, end };
  });

  useEffect(() => {
    const currentValueEl = currentValueRef.current;
    if (!currentValueEl) {
      return;
    }

    if (reduceMotion) {
      currentValueEl.textContent = currentScore.toFixed(1);
      previousScoreRef.current = currentScore;
      return;
    }

    const state = { value: previousScoreRef.current };
    const tween = gsap.to(state, {
      value: currentScore,
      duration: 0.9,
      ease: "power2.out",
      onUpdate: () => {
        currentValueEl.textContent = state.value.toFixed(1);
      },
    });

    previousScoreRef.current = currentScore;

    return () => {
      tween.kill();
    };
  }, [currentScore, reduceMotion]);

  useEffect(() => {
    if (!projectionScore || !projectedValueRef.current) {
      previousProjectionRef.current = projectionScore ?? 0;
      return;
    }

    const projectionValueEl = projectedValueRef.current;

    if (reduceMotion) {
      projectionValueEl.textContent = `${projectionScore.toFixed(1)} projected`;
      previousProjectionRef.current = projectionScore;
      return;
    }

    const state = { value: previousProjectionRef.current };
    const tween = gsap.to(state, {
      value: projectionScore,
      duration: 1,
      ease: "power2.out",
      onUpdate: () => {
        projectionValueEl.textContent = `${state.value.toFixed(1)} projected`;
      },
    });

    previousProjectionRef.current = projectionScore;

    return () => {
      tween.kill();
    };
  }, [projectionScore, reduceMotion]);

  useEffect(() => {
    const animatePath = (path: SVGPathElement | null, delay = 0) => {
      if (!path) {
        return;
      }

      if (reduceMotion) {
        path.style.strokeDasharray = "";
        path.style.strokeDashoffset = "";
        return;
      }

      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;

      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.05,
        ease: "power2.out",
        delay,
      });
    };

    animatePath(currentArcRef.current, 0.05);
    animatePath(projectionArcRef.current, 0.12);
  }, [currentScore, projectionScore, reduceMotion]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">{label}</p>
        <Badge variant={bandVariant}>{bandLabel}</Badge>
      </div>

      <div
        className={cn(
          "relative",
          compact ? "w-full max-w-[15.25rem] sm:max-w-[16.5rem]" : "w-full max-w-[17.5rem] sm:max-w-[19rem]",
        )}
      >
        <svg
          aria-hidden="true"
          className="block h-auto w-full"
          viewBox="0 0 200 112"
          fill="none"
        >
          <path
            d={describeArc(100, 100, 76, 180, 0)}
            className="text-border/55"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="12"
          />
          {segmentAngles.map((segment, index) => (
            <path
              d={describeArc(100, 100, 76, segment.start, segment.end)}
              className="text-background-alt"
              fill="none"
              key={`${segment.start}-${segment.end}-${index}`}
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth="12"
            />
          ))}
          {projectionScore !== null ? (
            <ScoreArc
              colorClassName="text-warning/55"
              score={projectionScore}
              strokeWidth={14}
              ref={projectionArcRef}
            />
          ) : null}
          <ScoreArc
            colorClassName="text-accent"
            score={currentScore}
            strokeWidth={12}
            ref={currentArcRef}
          />
          <circle cx="100" cy="100" r="56" className="fill-background-alt" />
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="flex items-end gap-1.5 rounded-full border border-border/55 bg-background/86 px-4 py-2 shadow-[0_10px_28px_rgba(0,0,0,0.15)] backdrop-blur-sm">
              <p
                className={cn(
                  "font-sans text-[clamp(2.35rem,2rem+1vw,2.85rem)] font-semibold leading-none tracking-[-0.05em] text-foreground tabular-nums",
                  compact && "text-[clamp(2.05rem,1.8rem+0.85vw,2.45rem)]",
                  valueClassName,
                )}
                ref={currentValueRef}
              >
                {currentScore.toFixed(1)}
              </p>
              <span className="pb-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-muted">
                / 10
              </span>
            </div>
            {projectionScore !== null ? (
              <p
                className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-warning"
                ref={projectedValueRef}
              >
                {projectionScore.toFixed(1)} projected
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
