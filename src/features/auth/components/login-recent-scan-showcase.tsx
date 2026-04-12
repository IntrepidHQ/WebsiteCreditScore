"use client";

import type { LucideIcon } from "lucide-react";
import {
  Eye,
  Lock,
  MousePointer2,
  Palette,
  Search,
  Shield,
  Smartphone,
} from "lucide-react";
import { useMemo } from "react";

import { ScoreDial } from "@/components/common/score-dial";
import {
  LOGIN_SHOWCASE_RADAR_KEYS,
  type LoginShowcaseBreakdownItem,
  type LoginShowcasePayload,
} from "@/features/auth/lib/login-showcase-model";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import type { AuditCategoryKey } from "@/lib/types/audit";
import { cn } from "@/lib/utils/cn";
import { getScoreBand } from "@/lib/utils/scores";

const CATEGORY_ICON: Record<AuditCategoryKey, LucideIcon> = {
  "visual-design": Palette,
  "ux-conversion": MousePointer2,
  "mobile-experience": Smartphone,
  "seo-readiness": Search,
  accessibility: Eye,
  "trust-credibility": Shield,
  "security-posture": Lock,
};

const bandPillClassName: Record<
  ReturnType<typeof getScoreBand>["variant"],
  string
> = {
  success: "border-success/35 bg-success/14 text-foreground",
  accent:
    "border-accent/35 bg-[color-mix(in_srgb,var(--theme-accent)_16%,var(--theme-panel))] text-foreground",
  warning: "border-warning/35 bg-warning/14 text-foreground",
  danger: "border-danger/35 bg-danger/12 text-foreground",
};

const LoginBreakdownCard = ({ item }: { item: LoginShowcaseBreakdownItem }) => {
  const Icon = CATEGORY_ICON[item.key as AuditCategoryKey] ?? Palette;
  const band = getScoreBand(item.score);

  return (
    <article
      className={cn(
        "flex min-h-[7.5rem] flex-col justify-between rounded-2xl border border-t-[color-mix(in_srgb,var(--theme-border)_38%,#ffffff_42%)] border-r-[color-mix(in_srgb,var(--theme-border)_72%,#000000_38%)] border-b-[color-mix(in_srgb,var(--theme-border)_62%,#000000_48%)] border-l-[color-mix(in_srgb,var(--theme-border)_72%,#000000_38%)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_92%,#ffffff_4%)_0%,color-mix(in_srgb,var(--theme-panel)_88%,var(--theme-background-alt)_12%)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_34px_rgba(0,0,0,0.22)] sm:min-h-[7.75rem] sm:p-3.5",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border/55 bg-background/35 text-foreground">
            <Icon aria-hidden className="size-3.5" strokeWidth={2} />
          </span>
          <h3 className="min-w-0 text-[0.8125rem] font-semibold leading-snug tracking-tight text-foreground sm:text-sm">
            {item.label}
          </h3>
        </div>
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <p className="tabular-nums text-2xl font-semibold leading-none tracking-tight text-foreground sm:text-[1.65rem]">
          {item.score.toFixed(1)}
        </p>
        <div className="flex flex-col items-end gap-1.5">
          <span
            className={cn(
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none tracking-wide sm:text-[11px]",
              bandPillClassName[band.variant],
            )}
          >
            {band.label}
          </span>
          <p className="text-[10px] font-medium tabular-nums text-muted sm:text-[11px]">
            {item.score.toFixed(1)}
            <span className="ml-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-muted">/10</span>
          </p>
        </div>
      </div>
    </article>
  );
};

const buildOrderedBreakdown = (showcase: LoginShowcasePayload): LoginShowcaseBreakdownItem[] => {
  const map = new Map<string, LoginShowcaseBreakdownItem>();
  showcase.breakdown.forEach((row) => map.set(row.key, row));
  showcase.secondaryBreakdown.forEach((row) => map.set(row.key, row));

  return LOGIN_SHOWCASE_RADAR_KEYS.map((key) => {
    const hit = map.get(key);

    if (hit) {
      return hit;
    }

    return {
      key,
      label: key
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
      score: showcase.overallScore,
      weight: 1,
    };
  });
};

const chunkPairs = <T,>(items: T[]): Array<[T, T | undefined]> => {
  const out: Array<[T, T | undefined]> = [];

  for (let i = 0; i < items.length; i += 2) {
    out.push([items[i], items[i + 1]]);
  }

  return out;
};

const LoginBreakdownRoulette = ({ showcase }: { showcase: LoginShowcasePayload }) => {
  const { reduceMotion } = useMotionSettings();
  const ordered = useMemo(() => buildOrderedBreakdown(showcase), [showcase]);
  const pairs = useMemo(() => chunkPairs(ordered), [ordered]);

  const track = (
    <div className="flex w-full flex-col gap-3 sm:gap-3.5">
      {pairs.map(([left, right], idx) => (
        <div className="grid grid-cols-2 gap-3 sm:gap-4" key={`row-${idx}`}>
          <LoginBreakdownCard item={left} />
          {right ? <LoginBreakdownCard item={right} /> : <div aria-hidden className="min-h-[7.5rem]" />}
        </div>
      ))}
    </div>
  );

  return (
    <div
      aria-label="Category score preview"
      className={cn(
        "relative w-full overflow-hidden rounded-2xl",
        reduceMotion && "max-h-[min(360px,44vh)] overflow-y-auto overscroll-y-contain pr-1",
        !reduceMotion && "h-[min(320px,40vh)] sm:h-[min(360px,42vh)]",
      )}
    >
      {!reduceMotion ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-12 bg-gradient-to-b from-background via-background/80 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-14 bg-gradient-to-t from-background via-background/85 to-transparent"
          />
        </>
      ) : null}

      <div
        className={cn(
          reduceMotion ? "relative" : "login-breakdown-roulette__track absolute left-0 right-0 top-0",
        )}
      >
        {reduceMotion ? (
          track
        ) : (
          <>
            {track}
            <div aria-hidden>{track}</div>
          </>
        )}
      </div>
    </div>
  );
};

export const LoginRecentScanShowcase = ({
  showcase,
  className,
}: {
  showcase: LoginShowcasePayload;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-5", className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Recent public scan</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground" title={showcase.title}>
            {showcase.title}
          </p>
          <p className="truncate text-xs text-muted">{showcase.hostDisplay}</p>
        </div>

        <ScoreDial
          className="w-full max-w-[220px] shrink-0 self-start rounded-2xl border border-border/50 bg-panel/25 p-3 shadow-[0_16px_44px_rgba(0,0,0,0.22)] sm:max-w-[240px] sm:self-center sm:p-3.5"
          label="Overall"
          score={showcase.overallScore}
          showFooter={false}
        />
      </div>

      <LoginBreakdownRoulette showcase={showcase} />
    </div>
  );
};
