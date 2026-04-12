"use client";

import dynamic from "next/dynamic";
import { useMemo } from "react";

import { ScoreDial } from "@/components/common/score-dial";
import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import {
  buildLoginShowcaseRadarItems,
  LOGIN_SHOWCASE_PRIMARY_KEYS,
  type LoginShowcasePayload,
} from "@/features/auth/lib/login-showcase-model";
import { useMotionSettings } from "@/hooks/use-motion-settings";
import { cn } from "@/lib/utils/cn";
import { getScoreTone } from "@/lib/utils/scores";

const ScoreRadar = dynamic(
  () => import("@/components/common/score-radar").then((m) => m.ScoreRadar),
  { ssr: false },
);

const toneFills = {
  success: "linear-gradient(180deg, rgba(61,213,152,0.95), rgba(61,213,152,0.45))",
  accent: "linear-gradient(180deg, rgba(247,178,27,0.95), rgba(247,178,27,0.45))",
  warning: "linear-gradient(180deg, rgba(255,207,102,0.95), rgba(255,207,102,0.42))",
  danger: "linear-gradient(180deg, rgba(255,139,139,0.95), rgba(255,139,139,0.45))",
} as const;

const LoginShowcaseSecondaryRail = ({
  items,
}: {
  items: LoginShowcasePayload["secondaryBreakdown"];
}) => {
  return (
    <ul className="flex h-full min-h-0 flex-col justify-center gap-2.5">
      {items.map((item) => {
        const tone = getScoreTone(item.score);
        const pct = Math.min(100, Math.max(0, item.score * 10));

        return (
          <li key={item.key}>
            <div className="rounded-xl border border-border/55 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_92%,transparent))] px-3 py-2.5 shadow-sm shadow-background/15">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-semibold leading-snug text-foreground">{item.label}</p>
                <p className="shrink-0 tabular-nums text-xs font-semibold text-foreground">
                  {item.score.toFixed(1)}
                  <span className="ml-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                    /10
                  </span>
                </p>
              </div>
              <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-background/60" role="presentation">
                <div
                  aria-hidden
                  className="h-full rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]"
                  style={{
                    width: `${pct}%`,
                    backgroundImage: toneFills[tone],
                  }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export const LoginRecentScanShowcase = ({
  showcase,
  className,
}: {
  showcase: LoginShowcasePayload;
  className?: string;
}) => {
  const { reduceMotion } = useMotionSettings();
  const radarItems = useMemo(() => buildLoginShowcaseRadarItems(showcase), [showcase]);
  const primaryItems = useMemo(() => {
    return LOGIN_SHOWCASE_PRIMARY_KEYS.map((key) => showcase.breakdown.find((row) => row.key === key)).filter(
      Boolean,
    ) as LoginShowcasePayload["breakdown"];
  }, [showcase.breakdown]);

  return (
    <div className={cn("login-showcase-ambient flex w-full flex-col gap-4", className)}>
      <section
        aria-label="Recent scan score visuals"
        className="login-showcase-bento-grid relative isolate w-full overflow-hidden rounded-2xl bg-transparent"
      >
        <div className="login-showcase-bento__radar relative flex min-h-[220px] items-center justify-center border-b border-border/50 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_90%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] px-3 py-5 sm:min-h-[248px] sm:px-5 sm:py-6 lg:border-r lg:border-border/50">
          {!reduceMotion ? (
            <>
              <span aria-hidden className="login-bento-edge-scan login-bento-edge-scan--h" />
              <span aria-hidden className="login-bento-edge-scan login-bento-edge-scan--h-top lg:hidden" />
            </>
          ) : null}
          <div className="relative z-[1] w-full max-w-[min(100%,460px)]">
            <ScoreRadar
              centerLabel="Balance"
              className="rounded-[22px] border-0 bg-transparent p-1 shadow-none sm:p-2"
              items={radarItems}
            />
          </div>
        </div>

        <div className="login-showcase-bento__dial relative flex items-center justify-center border-b border-r border-border/50 bg-panel/25 px-3 py-4 sm:px-4 sm:py-5 lg:border-b-0">
          {!reduceMotion ? <span aria-hidden className="login-bento-edge-scan login-bento-edge-scan--v" /> : null}
          <ScoreDial
            className="w-full max-w-[min(100%,248px)] p-3 shadow-[0_16px_44px_rgba(0,0,0,0.22)] sm:p-4"
            label="Public scan"
            score={showcase.overallScore}
            showFooter={false}
          />
        </div>

        <div className="login-showcase-bento__bars relative border-b border-border/50 bg-panel/25 p-3 sm:p-4 lg:border-b-0">
          <ScoreBreakdownBars animateOnView={false} dense items={primaryItems} />
        </div>

        <div className="login-showcase-bento__rail relative border-t border-border/50 bg-panel/20 px-3 py-4 sm:px-4 sm:py-5 lg:border-l lg:border-t-0 lg:border-border/50">
          {!reduceMotion ? <span aria-hidden className="login-bento-edge-scan login-bento-edge-scan--rail" /> : null}
          <LoginShowcaseSecondaryRail items={showcase.secondaryBreakdown} />
        </div>
      </section>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">Public recent scan</p>
        <p className="mt-0.5 truncate text-xs font-semibold text-foreground" title={showcase.title}>
          {showcase.title}
        </p>
        <p className="truncate text-[11px] text-muted">{showcase.hostDisplay}</p>
      </div>
    </div>
  );
};
