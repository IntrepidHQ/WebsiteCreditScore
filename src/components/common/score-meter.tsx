import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { getScoreBandLabel, getScoreBandVariant } from "@/lib/utils/scores";

function formatScore(value: number) {
  return `${value.toFixed(1)} / 10`;
}

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
  const bandLabel = getScoreBandLabel(score);
  const bandVariant = getScoreBandVariant(score);
  const showProjected =
    typeof projectedScore === "number" && projectedScore > score + 0.05;

  return (
    <div
      className={cn(
        "rounded-[12px] border border-border/70 bg-background-alt/60 p-4",
        compact ? "space-y-3" : "space-y-4 p-5 sm:p-6",
        className,
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
          {label}
        </p>
        <Badge className="whitespace-nowrap" variant={bandVariant}>
          {bandLabel}
        </Badge>
      </div>

      <div className="space-y-2">
        <p
          className={cn(
            "font-display text-[clamp(3.35rem,2.6rem+1.45vw,5.2rem)] font-semibold leading-[0.9] tracking-[-0.05em] text-foreground",
            compact && "text-[clamp(2.35rem,1.95rem+0.9vw,3.3rem)]",
            valueClassName,
          )}
        >
          {formatScore(score)}
        </p>
        {showProjected ? (
          <p className="text-[0.84rem] font-semibold uppercase tracking-[0.12em] text-warning">
            Projected {formatScore(projectedScore)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
