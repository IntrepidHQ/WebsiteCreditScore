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

import { scoreCategoryPalette } from "@/components/common/score-category-meta";
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

const LoginBreakdownCard = ({
  item,
  className,
}: {
  item: LoginShowcaseBreakdownItem;
  className?: string;
}) => {
  const Icon = CATEGORY_ICON[item.key as AuditCategoryKey] ?? Palette;
  const band = getScoreBand(item.score);
  const categoryKey = item.key as AuditCategoryKey;
  const categoryColor = scoreCategoryPalette[categoryKey] ?? "#94a3b8";
  const edgeStroke = `linear-gradient(90deg, color-mix(in srgb, ${categoryColor} 70%, transparent), color-mix(in srgb, ${categoryColor} 30%, transparent) 50%, color-mix(in srgb, ${categoryColor} 70%, transparent))`;

  return (
    <article
      className={cn(
        "relative flex min-h-[6.75rem] w-[min(100%,240px)] shrink-0 flex-col justify-between overflow-hidden rounded-2xl border-y border-r border-border/40 bg-background/30 p-3 sm:min-h-[7.25rem] sm:w-[260px] sm:p-3.5",
        className,
      )}
      style={{
        borderLeftColor: categoryColor,
        borderLeftWidth: 4,
        backgroundImage: `linear-gradient(180deg, color-mix(in srgb, ${categoryColor} 14%, transparent), color-mix(in srgb, ${categoryColor} 6%, transparent))`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px"
        style={{ backgroundImage: edgeStroke, opacity: 0.95 }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-px"
        style={{ backgroundImage: edgeStroke, opacity: 0.95 }}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background/35 text-foreground"
            style={{ borderColor: `color-mix(in srgb, ${categoryColor} 55%, transparent)` }}
          >
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
            className="rounded-full border px-2 py-0.5 text-[10px] font-semibold leading-none tracking-wide sm:text-[11px]"
            style={{
              borderColor: `color-mix(in srgb, ${categoryColor} 55%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${categoryColor} 18%, transparent)`,
            }}
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
        centerScore={showcase.overallScore}
        items={radarItems}
        showCategoryGrid={false}
        variant="bare"
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
