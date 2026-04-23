"use client";

import { useEffect, useMemo, useState } from "react";

import gsap from "gsap";

import { scoreCategoryIcons, scoreCategoryPalette } from "@/components/common/score-category-meta";
import { Badge } from "@/components/ui/badge";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import type { AuditCategoryScore } from "@/lib/types/audit";
import { getRadarPoint, getRadarPolygonPoints } from "@/lib/utils/score-visuals";
import { getScoreBandLabel, getScoreTone } from "@/lib/utils/scores";

export function CategoryRadarBreakdown({
  scores,
}: {
  scores: AuditCategoryScore[];
}) {
  const { reduceMotion } = useMotionSettings();
  const [progress, setProgress] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const width = 540;
  const height = 540;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 170;
  const labelOffset = radius + 50;
  const resolvedProgress = reduceMotion ? 1 : progress;
  const animatedScores = useMemo(
    () => scores.map((item) => Number((item.score * resolvedProgress).toFixed(2))),
    [resolvedProgress, scores],
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
  const activeItem = useMemo(
    () => scores.find((item) => item.key === activeKey) ?? null,
    [activeKey, scores],
  );
  const activeTooltip = useMemo(() => {
    if (!activeItem) {
      return null;
    }

    const index = scores.findIndex((item) => item.key === activeItem.key);

    if (index < 0) {
      return null;
    }

    const point = getRadarPoint(centerX, centerY, labelOffset, (360 / scores.length) * index, 10);

    return {
      left: `${(point.x / width) * 100}%`,
      top: `${(point.y / height) * 100}%`,
    };
  }, [activeItem, centerX, centerY, labelOffset, scores]);

  useEffect(() => {
    if (!scores.length || reduceMotion) {
      return;
    }

    const animation = gsap.to(
      { value: 0 },
      {
        value: 1,
        duration: 1,
        ease: "power3.out",
        onUpdate: function update() {
          setProgress(Number(this.targets()[0].value.toFixed(3)));
        },
      },
    );

    return () => {
      animation.kill();
    };
  }, [reduceMotion, scores.length]);

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(21rem,0.82fr)_minmax(0,1.18fr)] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <div className="rounded-[24px] border border-border/70 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_84%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted">
                Site balance
              </p>
              <Badge variant="neutral">Average {animatedAverage.toFixed(1)}</Badge>
            </div>

            <div className="relative">
            {activeItem && activeTooltip ? (
              <div
                className="pointer-events-none absolute z-20 max-w-44 rounded-[14px] border border-border/70 bg-background/94 px-3 py-2 shadow-[0_18px_40px_rgba(0,0,0,0.28)] backdrop-blur-md"
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
              className="mx-auto block w-full"
              fill="none"
              viewBox={`0 0 ${width} ${height}`}
            >
              {[1, 0.8, 0.6, 0.4, 0.2].map((scale) => (
                <polygon
                  key={scale}
                  className="text-border"
                  points={getRadarPolygonPoints(scores.map(() => 10 * scale), centerX, centerY, radius)}
                  stroke="currentColor"
                  strokeOpacity={scale === 1 ? 0.22 : 0.12}
                  strokeWidth="1"
                />
              ))}

              {scores.map((score, index) => {
                const angle = (360 / scores.length) * index;
                const outer = getRadarPoint(centerX, centerY, radius, angle, 10);
                const label = getRadarPoint(centerX, centerY, labelOffset, angle, 10);
                const color = scoreCategoryPalette[score.key];

                return (
                  <g
                    key={score.key}
                    onFocus={() => setActiveKey(score.key)}
                    onMouseEnter={() => setActiveKey(score.key)}
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
                      r="19"
                      stroke={color}
                      strokeOpacity="0.42"
                      strokeWidth="1"
                    />
                    <text
                      className="fill-foreground text-[10px] font-semibold uppercase tracking-[0.02em]"
                      textAnchor="middle"
                      x={label.x}
                      y={label.y + 3.5}
                    >
                      {score.score.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {scores.map((score, index) => {
                const current = getRadarPoint(
                  centerX,
                  centerY,
                  radius,
                  (360 / scores.length) * index,
                  animatedScores[index] ?? 0,
                );
                const next = getRadarPoint(
                  centerX,
                  centerY,
                  radius,
                  (360 / scores.length) * ((index + 1) % scores.length),
                  animatedScores[(index + 1) % scores.length] ?? 0,
                );

                return (
                  <polygon
                    fill={scoreCategoryPalette[score.key]}
                    fillOpacity="0.12"
                    key={`${score.key}-wedge`}
                    points={`${centerX},${centerY} ${current.x},${current.y} ${next.x},${next.y}`}
                    stroke="none"
                  />
                );
              })}

              <polygon
                fill="rgba(255,255,255,0.04)"
                points={getRadarPolygonPoints(animatedScores, centerX, centerY, radius)}
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1"
              />

              {animatedScores.map((score, index) => {
                const item = scores[index];
                const point = getRadarPoint(
                  centerX,
                  centerY,
                  radius,
                  (360 / scores.length) * index,
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
                r="26"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <text
                className="fill-foreground"
                textAnchor="middle"
                x={centerX}
                y={centerY + 4}
              >
                {animatedAverage.toFixed(1)}
              </text>
            </svg>
          </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            {scores.map((score) => {
              const tone = getScoreTone(score.score);
              const color = scoreCategoryPalette[score.key];
              const Icon = scoreCategoryIcons[score.key];

              return (
                <article
                  className="overflow-hidden rounded-[16px] border border-border/70 bg-panel/60"
                  key={score.key}
                >
                  <div className="px-4 py-3.5">
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
                        <h3 className="mt-3 text-[1.02rem] font-semibold leading-6 text-foreground">
                          {score.label}
                        </h3>
                        <p className="mt-2 text-sm leading-6 text-muted">{score.summary}</p>
                      </div>
                      <p
                        className="shrink-0 font-display text-[2rem] leading-none tracking-[-0.05em]"
                        style={{ color }}
                      >
                        {score.score.toFixed(1)}
                      </p>
                    </div>
                    <div className="mt-3 space-y-2">
                      <Badge variant={tone}>{getScoreBandLabel(score.score)}</Badge>
                      <div className="h-1.5 overflow-hidden rounded-full bg-background/40">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${score.score * 10}%`,
                            backgroundColor: color,
                            opacity: 0.65,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
        </div>
      </div>
    </div>
  );
}
