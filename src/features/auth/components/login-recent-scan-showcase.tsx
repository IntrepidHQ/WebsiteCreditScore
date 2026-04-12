"use client";

import dynamic from "next/dynamic";
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

import {
  buildLoginShowcaseRadarItems,
  LOGIN_SHOWCASE_RADAR_KEYS,
  type LoginShowcaseBreakdownItem,
  type LoginShowcasePayload,
} from "@/features/auth/lib/login-showcase-model";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import type { AuditCategoryKey } from "@/lib/types/audit";
import { cn } from "@/lib/utils/cn";
import { getScoreBand } from "@/lib/utils/scores";

const ScoreRadar = dynamic(
  () => import("@/components/common/score-radar").then((m) => m.ScoreRadar),
  { ssr: false },
);

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

const LoginBreakdownCard = ({
  item,
  className,
}: {
  item: LoginShowcaseBreakdownItem;
  className?: string;
}) => {
  const Icon = CATEGORY_ICON[item.key as AuditCategoryKey] ?? Palette;
  const band = getScoreBand(item.score);

  return (
    <article
      className={cn(
        "flex min-h-[6.75rem] w-[min(100%,240px)] shrink-0 flex-col justify-between rounded-2xl border border-t-[color-mix(in_srgb,var(--theme-border)_38%,#ffffff_42%)] border-r-[color-mix(in_srgb,var(--theme-border)_72%,#000000_38%)] border-b-[color-mix(in_srgb,var(--theme-border)_62%,#000000_48%)] border-l-[color-mix(in_srgb,var(--theme-border)_72%,#000000_38%)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_92%,#ffffff_4%)_0%,color-mix(in_srgb,var(--theme-panel)_88%,var(--theme-background-alt)_12%)_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_14px_34px_rgba(0,0,0,0.22)] sm:min-h-[7.25rem] sm:w-[260px] sm:p-3.5",
        className,
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

export const LoginShowcaseRadarHero = ({
  showcase,
  className,
}: {
  showcase: LoginShowcasePayload;
  className?: string;
}) => {
  const radarItems = useMemo(() => buildLoginShowcaseRadarItems(showcase), [showcase]);

  return (
    <div className={cn("w-full min-w-0", className)}>
      <ScoreRadar
        centerLabel="Current score"
        className="border border-border/55 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_92%,#ffffff_3%)_0%,color-mix(in_srgb,var(--theme-panel)_86%,var(--theme-background-alt)_14%)_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_18px_48px_rgba(0,0,0,0.2)]"
        items={radarItems}
        showCategoryGrid={false}
      />
    </div>
  );
};

const LoginBreakdownRouletteHorizontal = ({ showcase }: { showcase: LoginShowcasePayload }) => {
  const { reduceMotion } = useMotionSettings();
  const ordered = useMemo(() => buildOrderedBreakdown(showcase), [showcase]);

  const strip = (
    <div className="flex w-max flex-row items-stretch gap-4 pr-4 sm:gap-5">
      {ordered.map((item) => (
        <LoginBreakdownCard item={item} key={item.key} />
      ))}
    </div>
  );

  return (
    <div
      aria-label="Category score preview"
      className={cn(
        "relative w-full overflow-hidden rounded-2xl",
        reduceMotion && "overflow-x-auto overscroll-x-contain pb-1",
        !reduceMotion && "h-[min(8.75rem,22vh)] sm:h-[9.5rem]",
      )}
    >
      {!reduceMotion ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-10 bg-gradient-to-r from-background via-background/85 to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-12 bg-gradient-to-l from-background via-background/88 to-transparent"
          />
        </>
      ) : null}

      <div
        className={cn(
          reduceMotion ? "relative flex w-full min-h-full" : "login-breakdown-roulette-x__track flex w-max flex-row",
        )}
      >
        {reduceMotion ? (
          strip
        ) : (
          <>
            {strip}
            <div aria-hidden className="flex w-max flex-row items-stretch gap-4 pr-4 sm:gap-5">
              {ordered.map((item) => (
                <LoginBreakdownCard item={item} key={`dup-${item.key}`} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const LoginScanMetaFooter = ({
  showcase,
  className,
}: {
  showcase: LoginShowcasePayload;
  className?: string;
}) => {
  return (
    <footer className={cn("min-w-0", className)}>
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Recent public scan</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-foreground" title={showcase.title}>
        {showcase.title}
      </p>
      <p className="truncate text-xs text-muted">{showcase.hostDisplay}</p>
    </footer>
  );
};

export const LoginGraphicsColumn = ({
  showcase,
  className,
}: {
  showcase: LoginShowcasePayload;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-6 md:gap-8", className)}>
      <LoginShowcaseRadarHero showcase={showcase} />

      <p className="text-balance text-center font-display text-lg leading-snug tracking-tight text-foreground sm:text-xl md:text-left md:text-[1.35rem] md:leading-[1.35] lg:text-[1.45rem]">
        Benchmark testing, reviews, and <em className="text-foreground/95 italic">website redesigns</em> from a
        single scan
      </p>

      <LoginBreakdownRouletteHorizontal showcase={showcase} />
    </div>
  );
};
