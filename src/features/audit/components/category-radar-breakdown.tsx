import { Badge } from "@/components/ui/badge";
import type { AuditCategoryScore } from "@/lib/types/audit";
import { getScoreBandLabel, getScoreTone } from "@/lib/utils/scores";

const categoryPalette = {
  "visual-design": "#7ca2ff",
  "ux-conversion": "#f7b21b",
  "mobile-experience": "#4fd7a3",
  "seo-readiness": "#ff9a6a",
  accessibility: "#b98dff",
  "trust-credibility": "#61d7ff",
  "security-posture": "#ff7ca8",
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
  const centerX = 180;
  const centerY = 154;
  const radius = 108;
  const points = scores.map((score, index) => {
    const angle = (360 / scores.length) * index;
    return pointOnRadar(centerX, centerY, radius, angle, score.score);
  });
  const pointString = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <div className="space-y-5">
      <div className="sticky top-24 z-10 rounded-[18px] border border-border/70 bg-background-alt/88 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md md:static md:top-auto">
        <svg
          aria-hidden="true"
          className="mx-auto block w-full max-w-[42rem]"
          fill="none"
          viewBox="0 0 360 308"
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
            const label = pointOnRadar(centerX, centerY, radius + 28, angle, 10);
            const color = categoryPalette[score.key];

            return (
              <g key={score.key}>
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
                  cy={label.y - 4}
                  fill={color}
                  fillOpacity="0.16"
                  r="11"
                  stroke={color}
                  strokeOpacity="0.42"
                />
                <text
                  className="fill-foreground text-[10px] font-semibold uppercase tracking-[0.12em]"
                  textAnchor="middle"
                  x={label.x}
                  y={label.y}
                >
                  {index + 1}
                </text>
              </g>
            );
          })}

          {scores.map((score, index) => {
            const current = points[index];
            const next = points[(index + 1) % points.length];
            const color = categoryPalette[score.key];

            return (
              <polygon
                fill={color}
                fillOpacity="0.12"
                key={`${score.key}-wedge`}
                points={`${centerX},${centerY} ${current.x},${current.y} ${next.x},${next.y}`}
                stroke="none"
              />
            );
          })}

          <polygon
            fill="rgba(255,255,255,0.04)"
            points={pointString}
            stroke="rgba(255,255,255,0.22)"
            strokeWidth="2.5"
          />

          {scores.map((score, index) => {
            const point = points[index];
            const color = categoryPalette[score.key];

            return (
              <circle
                cx={point.x}
                cy={point.y}
                fill={color}
                key={score.key}
                r="5"
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

      <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
        {scores.map((score, index) => {
          const tone = getScoreTone(score.score);
          const color = categoryPalette[score.key];

          return (
            <article
              className="rounded-[16px] border border-border/70 bg-panel/60 p-4"
              key={score.key}
              style={{
                boxShadow: `inset 3px 0 0 ${color}`,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold uppercase tracking-[0.12em] text-foreground"
                      style={{
                        backgroundColor: `${color}1f`,
                        borderColor: `${color}55`,
                        color,
                      }}
                    >
                      {index + 1}
                    </span>
                    <h3 className="text-[1.1rem] font-semibold leading-tight text-foreground">
                      {score.label}
                    </h3>
                  </div>
                  <p className="mt-2 text-base leading-7 text-foreground">{score.summary}</p>
                </div>
                <p
                  className="shrink-0 font-display text-[2.2rem] font-semibold leading-none tracking-[-0.05em]"
                  style={{ color }}
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
            </article>
          );
        })}
      </div>
    </div>
  );
}
