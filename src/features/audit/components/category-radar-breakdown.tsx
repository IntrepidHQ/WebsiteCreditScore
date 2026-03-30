import { Badge } from "@/components/ui/badge";
import type { AuditCategoryScore } from "@/lib/types/audit";
import { cn } from "@/lib/utils/cn";
import { getScoreBandLabel, getScoreTone } from "@/lib/utils/scores";

const toneStroke = {
  success: "#34b26b",
  accent: "#7ca2ff",
  warning: "#f2c84d",
  danger: "#ef6b64",
} as const;

function pointOnRadar(
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
  value: number,
) {
  const normalized = value / 10;
  const scaledRadius = radius * normalized;
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: centerX + Math.cos(radians) * scaledRadius,
    y: centerY + Math.sin(radians) * scaledRadius,
  };
}

function polygonPoints(
  centerX: number,
  centerY: number,
  radius: number,
  count: number,
  scale = 1,
) {
  return Array.from({ length: count }, (_, index) => {
    const angle = (360 / count) * index;
    const radians = ((angle - 90) * Math.PI) / 180;
    return `${centerX + Math.cos(radians) * radius * scale},${centerY + Math.sin(radians) * radius * scale}`;
  }).join(" ");
}

export function CategoryRadarBreakdown({
  scores,
}: {
  scores: AuditCategoryScore[];
}) {
  const centerX = 116;
  const centerY = 116;
  const radius = 82;
  const points = scores
    .map((score, index) => {
      const angle = (360 / scores.length) * index;
      const point = pointOnRadar(centerX, centerY, radius, angle, score.score);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  return (
    <div className="grid gap-5 xl:grid-cols-[16rem_minmax(0,1fr)]">
      <div className="rounded-[10px] border border-border/70 bg-background-alt/60 p-4">
        <svg
          aria-hidden="true"
          className="mx-auto block w-full max-w-[15rem]"
          fill="none"
          viewBox="0 0 232 232"
        >
          {[1, 0.8, 0.6, 0.4, 0.2].map((scale) => (
            <polygon
              key={scale}
              points={polygonPoints(centerX, centerY, radius, scores.length, scale)}
              stroke="currentColor"
              strokeOpacity={scale === 1 ? 0.22 : 0.12}
              strokeWidth="1"
              className="text-border"
            />
          ))}

          {scores.map((score, index) => {
            const angle = (360 / scores.length) * index;
            const outer = pointOnRadar(centerX, centerY, radius, angle, 10);
            const label = pointOnRadar(centerX, centerY, radius + 22, angle, 10);

            return (
              <g key={score.key}>
                <line
                  className="text-border"
                  stroke="currentColor"
                  strokeOpacity="0.2"
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
            fill="rgba(124,162,255,0.18)"
            points={points}
            stroke="#7ca2ff"
            strokeWidth="2.5"
          />

          {scores.map((score, index) => {
            const angle = (360 / scores.length) * index;
            const point = pointOnRadar(centerX, centerY, radius, angle, score.score);
            const tone = getScoreTone(score.score);

            return (
              <circle
                cx={point.x}
                cy={point.y}
                fill={toneStroke[tone]}
                key={score.key}
                r="4.5"
              />
            );
          })}

          <circle
            cx={centerX}
            cy={centerY}
            fill="rgba(10,13,22,0.92)"
            r="26"
            stroke="rgba(255,255,255,0.08)"
          />
          <text
            className="text-foreground"
            fill="currentColor"
            textAnchor="middle"
            x={centerX}
            y={centerY - 1}
          >
            /10
          </text>
          <text
            className="fill-muted text-[9px] font-semibold uppercase tracking-[0.14em]"
            textAnchor="middle"
            x={centerX}
            y={centerY + 16}
          >
            Score map
          </text>
        </svg>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {scores.map((score, index) => {
          const tone = getScoreTone(score.score);

          return (
            <div
              className="rounded-[10px] border border-border/70 bg-panel/60 p-4"
              key={score.key}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
                    {index + 1}. {score.label}
                  </p>
                  <p className="mt-2 text-base leading-7 text-foreground">{score.summary}</p>
                </div>
                <p
                  className={cn(
                    "shrink-0 font-display text-[2.2rem] font-semibold leading-none tracking-[-0.05em]",
                    tone === "success" && "text-success",
                    tone === "accent" && "text-accent",
                    tone === "warning" && "text-warning",
                    tone === "danger" && "text-danger",
                  )}
                >
                  {score.score.toFixed(1)}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <Badge variant={tone}>{getScoreBandLabel(score.score)}</Badge>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                  {score.score.toFixed(1)} / 10
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
