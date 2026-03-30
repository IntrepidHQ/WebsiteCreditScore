"use client";

import { useEffect, useMemo, useState } from "react";

import gsap from "gsap";

import { useMotionSettings } from "@/hooks/use-motion-settings";
import type { AuditCategoryScore } from "@/lib/types/audit";
import { cn } from "@/lib/utils/cn";
import { getRadarPoint, getRadarPolygonPoints } from "@/lib/utils/score-visuals";

type RadarItem = Pick<AuditCategoryScore, "key" | "label" | "score">;

export function ScoreRadar({
  items,
  centerLabel,
  className,
}: {
  items: RadarItem[];
  centerLabel: string;
  className?: string;
}) {
  const { reduceMotion } = useMotionSettings();
  const [progress, setProgress] = useState(0);
  const centerX = 124;
  const centerY = 124;
  const radius = 82;
  const resolvedProgress = reduceMotion ? 1 : progress;
  const animatedScores = useMemo(
    () => items.map((item) => Number((item.score * resolvedProgress).toFixed(2))),
    [items, resolvedProgress],
  );

  useEffect(() => {
    if (!items.length || reduceMotion) {
      return;
    }

    const animation = gsap.to(
      { value: 0 },
      {
        value: 1,
        duration: 0.95,
        ease: "power3.out",
        onUpdate: function update() {
          setProgress(Number(this.targets()[0].value.toFixed(3)));
        },
      },
    );

    return () => animation.kill();
  }, [items.length, reduceMotion]);

  if (!items.length) {
    return (
      <div className={cn("rounded-[24px] border border-border/60 bg-panel/45 p-5", className)}>
        <p className="text-sm leading-6 text-muted">Radar data appears when a scored example is available.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-[24px] border border-border/60 bg-panel/45 p-5", className)}>
      <div className="grid gap-5 lg:grid-cols-[13.5rem_minmax(0,1fr)] lg:items-center">
        <svg
          aria-hidden="true"
          className="mx-auto block w-full max-w-[13.5rem]"
          fill="none"
          viewBox="0 0 248 248"
        >
          {[1, 0.8, 0.6, 0.4, 0.2].map((scale) => (
            <polygon
              key={scale}
              points={getRadarPolygonPoints(
                items.map(() => 10 * scale),
                centerX,
                centerY,
                radius,
              )}
              stroke="currentColor"
              strokeOpacity={scale === 1 ? 0.2 : 0.1}
              strokeWidth="1"
              className="text-border"
            />
          ))}

          {items.map((item, index) => {
            const angle = (360 / items.length) * index;
            const outer = getRadarPoint(centerX, centerY, radius, angle, 10);
            const label = getRadarPoint(centerX, centerY, radius + 22, angle, 10);

            return (
              <g key={item.key}>
                <line
                  className="text-border"
                  stroke="currentColor"
                  strokeOpacity="0.18"
                  strokeWidth="1"
                  x1={centerX}
                  x2={outer.x}
                  y1={centerY}
                  y2={outer.y}
                />
                <text
                  className="fill-muted text-[10px] font-semibold uppercase tracking-[0.12em]"
                  textAnchor="middle"
                  x={label.x}
                  y={label.y}
                >
                  {index + 1}
                </text>
              </g>
            );
          })}

          <polygon
            fill="rgba(247,178,27,0.18)"
            points={getRadarPolygonPoints(animatedScores, centerX, centerY, radius)}
            stroke="#f7b21b"
            strokeWidth="2.5"
          />

          {animatedScores.map((score, index) => {
            const point = getRadarPoint(
              centerX,
              centerY,
              radius,
              (360 / items.length) * index,
              score,
            );

            return <circle cx={point.x} cy={point.y} fill="#f7b21b" key={items[index]?.key} r="4" />;
          })}

          <circle
            cx={centerX}
            cy={centerY}
            fill="rgba(6,11,18,0.95)"
            r="26"
            stroke="rgba(255,255,255,0.08)"
          />
          <text
            className="fill-foreground text-[10px] font-semibold uppercase tracking-[0.16em]"
            textAnchor="middle"
            x={centerX}
            y={centerY - 2}
          >
            {centerLabel}
          </text>
          <text
            className="fill-muted text-[9px] font-semibold uppercase tracking-[0.12em]"
            textAnchor="middle"
            x={centerX}
            y={centerY + 14}
          >
            Score balance
          </text>
        </svg>

        <div className="grid gap-2 sm:grid-cols-2">
          {items.map((item, index) => (
            <div
              className="rounded-[16px] border border-border/60 bg-background/35 px-4 py-3"
              key={item.key}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">
                  {index + 1}. {item.label}
                </p>
                <p className="text-sm font-semibold text-accent">{item.score.toFixed(1)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
