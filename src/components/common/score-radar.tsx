"use client";

import { useEffect, useMemo, useState } from "react";

import gsap from "gsap";

import { scoreCategoryIcons, scoreCategoryPalette } from "@/components/common/score-category-meta";
import { Badge } from "@/components/ui/badge";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import type { AuditCategoryScore } from "@/lib/types/audit";
import { cn } from "@/lib/utils/cn";
import { getRadarPoint, getRadarPolygonPoints } from "@/lib/utils/score-visuals";

type RadarItem = Pick<AuditCategoryScore, "key" | "label" | "score">;

export function ScoreRadar({
  items,
  centerLabel,
  className,
  showCategoryGrid = true,
  variant = "card",
  centerScore,
}: {
  items: RadarItem[];
  centerLabel: string;
  className?: string;
  /** When false, only the chart + header row render (e.g. login hero). */
  showCategoryGrid?: boolean;
  /** Strip outer panel chrome for open layouts (e.g. login column). */
  variant?: "card" | "bare";
  /** Fixed hub score (overall); polygon still animates from category scores. */
  centerScore?: number;
}) {
  const { reduceMotion } = useMotionSettings();
  const [progress, setProgress] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const width = 500;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 154;
  const labelOffset = radius + 46;
  const resolvedProgress = reduceMotion ? 1 : progress;
  const animatedScores = useMemo(
    () => items.map((item) => Number((item.score * resolvedProgress).toFixed(2))),
    [items, resolvedProgress],
  );
  const animatedAverage = useMemo(
    () =>
      Number(
        (
          animatedScores.reduce((total, score) => total + score, 0) / Math.max(animatedScores.length, 1)
        ).toFixed(1),
      ),
    [animatedScores],
  );
  const hubScore =
    typeof centerScore === "number" && Number.isFinite(centerScore)
      ? Number(centerScore.toFixed(1))
      : animatedAverage;
  const activeItem = useMemo(() => items.find((item) => item.key === activeKey) ?? null, [activeKey, items]);
  const activeTooltip = useMemo(() => {
    if (!activeItem) {
      return null;
    }

    const index = items.findIndex((item) => item.key === activeItem.key);

    if (index < 0) {
      return null;
    }

    const point = getRadarPoint(centerX, centerY, labelOffset, (360 / items.length) * index, 10);

    return {
      left: `${(point.x / width) * 100}%`,
      top: `${(point.y / height) * 100}%`,
    };
  }, [activeItem, centerX, centerY, items, labelOffset]);

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

    return () => {
      animation.kill();
    };
  }, [items.length, reduceMotion]);

  if (!items.length) {
    return (
      <div
        className={cn(
          variant === "card" && "rounded-[24px] border border-border/60 bg-panel/45 p-5",
          variant === "bare" && "rounded-none border-0 bg-transparent p-0",
          className,
        )}
      >
        <p className="text-sm leading-6 text-muted">Radar data appears when a scored example is available.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        variant === "card" && "rounded-[24px] border border-border/60 bg-panel/45 p-5",
        variant === "bare" && "rounded-none border-0 bg-transparent p-0 shadow-none ring-0",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
          {centerLabel}
        </p>
        <Badge variant="neutral">Average {animatedAverage.toFixed(1)}</Badge>
      </div>

      <div className={cn(showCategoryGrid ? "space-y-5" : "space-y-0")}>
        <div className="relative">
          {activeItem && activeTooltip ? (
            <div
              className="pointer-events-none absolute z-20 max-w-40 rounded-[14px] border border-border/70 bg-background/94 px-3 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-md"
              style={{
                left: activeTooltip.left,
                top: activeTooltip.top,
                transform: "translate(-50%, calc(-100% - 12px))",
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {activeItem.label}
              </p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {activeItem.score.toFixed(1)} / 10
              </p>
            </div>
          ) : null}
          <svg
            aria-hidden="true"
            className="mx-auto block w-full max-w-[30rem]"
            fill="none"
            viewBox={`0 0 ${width} ${height}`}
          >
            {[1, 0.8, 0.6, 0.4, 0.2].map((scale) => (
              <polygon
                key={scale}
                points={getRadarPolygonPoints(items.map(() => 10 * scale), centerX, centerY, radius)}
                stroke="currentColor"
                strokeOpacity={scale === 1 ? 0.18 : 0.09}
                strokeWidth="1"
                className="text-border"
              />
            ))}

            {items.map((item, index) => {
              const angle = (360 / items.length) * index;
              const outer = getRadarPoint(centerX, centerY, radius, angle, 10);
              const label = getRadarPoint(centerX, centerY, labelOffset, angle, 10);
              const color = scoreCategoryPalette[item.key];

              return (
                <g
                  key={item.key}
                  onFocus={() => setActiveKey(item.key)}
                  onMouseEnter={() => setActiveKey(item.key)}
                  onMouseLeave={() => setActiveKey(null)}
                >
                  <line
                    stroke={color}
                    strokeOpacity="0.34"
                    strokeWidth="1"
                    x1={centerX}
                    x2={outer.x}
                    y1={centerY}
                    y2={outer.y}
                  />
                  <circle
                    cx={label.x}
                    cy={label.y}
                    fill={color}
                    fillOpacity="0.16"
                    r="18"
                    stroke={color}
                    strokeOpacity="0.4"
                    strokeWidth="1"
                  />
                  <text
                    className="fill-foreground text-[10px] font-semibold uppercase tracking-[0.02em]"
                    textAnchor="middle"
                    x={label.x}
                    y={label.y + 3.5}
                  >
                    {item.score.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {items.map((item, index) => {
              const current = getRadarPoint(
                centerX,
                centerY,
                radius,
                (360 / items.length) * index,
                animatedScores[index] ?? 0,
              );
              const next = getRadarPoint(
                centerX,
                centerY,
                radius,
                (360 / items.length) * ((index + 1) % items.length),
                animatedScores[(index + 1) % items.length] ?? 0,
              );

              return (
                <polygon
                  fill={scoreCategoryPalette[item.key]}
                  fillOpacity="0.1"
                  key={`${item.key}-wedge`}
                  points={`${centerX},${centerY} ${current.x},${current.y} ${next.x},${next.y}`}
                  stroke="none"
                />
              );
            })}

            <polygon
              fill="rgba(255,255,255,0.04)"
              points={getRadarPolygonPoints(animatedScores, centerX, centerY, radius)}
              stroke="rgba(255,255,255,0.24)"
              strokeWidth="1"
            />

            {animatedScores.map((score, index) => {
              const item = items[index];
              const point = getRadarPoint(
                centerX,
                centerY,
                radius,
                (360 / items.length) * index,
                score,
              );

              return (
                <circle
                  cx={point.x}
                  cy={point.y}
                  fill={scoreCategoryPalette[item.key]}
                  key={item.key}
                  onMouseEnter={() => setActiveKey(item.key)}
                  onMouseLeave={() => setActiveKey(null)}
                  r="5"
                />
              );
            })}

            <circle
              cx={centerX}
              cy={centerY}
              fill="rgba(10,13,22,0.94)"
              r="24"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="1"
            />
            <text className="fill-foreground" textAnchor="middle" x={centerX} y={centerY + 4}>
              {hubScore.toFixed(1)}
            </text>
          </svg>
        </div>

        {showCategoryGrid ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => {
              const Icon = scoreCategoryIcons[item.key];
              const color = scoreCategoryPalette[item.key];

              return (
                <div
                  className="rounded-[16px] border border-border/60 bg-background/35 px-4 py-3"
                  key={item.key}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full border"
                          style={{
                            backgroundColor: `${color}1f`,
                            borderColor: `${color}55`,
                            color,
                          }}
                        >
                          <Icon className="size-4" />
                        </span>
                      </div>
                      <h3 className="mt-3 text-[1rem] font-semibold leading-6 text-foreground">
                        {item.label}
                      </h3>
                    </div>
                    <p className="shrink-0 text-sm font-semibold" style={{ color }}>
                      {item.score.toFixed(1)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
