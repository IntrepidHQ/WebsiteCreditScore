"use client";

import dynamic from "next/dynamic";

import { ScoreDial } from "@/components/common/score-dial";
import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import type { AuditCategoryKey } from "@/lib/types/audit";
import { cn } from "@/lib/utils/cn";

const DEMO_SCORE = 8.7;

const DEMO_BREAKDOWN: Array<{
  key: AuditCategoryKey;
  label: string;
  score: number;
  weight: number;
}> = [
  { key: "visual-design", label: "Visual design", score: 8.4, weight: 1.05 },
  { key: "ux-conversion", label: "UX & conversion", score: 7.9, weight: 1.15 },
  { key: "mobile-experience", label: "Mobile experience", score: 8.1, weight: 1.0 },
  { key: "seo-readiness", label: "SEO readiness", score: 7.2, weight: 0.95 },
  { key: "accessibility", label: "Accessibility", score: 8.6, weight: 0.9 },
  { key: "trust-credibility", label: "Trust & credibility", score: 8.8, weight: 1.1 },
  { key: "security-posture", label: "Security posture", score: 7.5, weight: 0.85 },
];

const ScoreRadar = dynamic(
  () => import("@/components/common/score-radar").then((m) => m.ScoreRadar),
  { ssr: false },
);

export function LoginScoreShowcase({
  variant,
  className,
}: {
  variant: "full" | "compact" | "rail" | "mobile";
  className?: string;
}) {
  const radarItems = DEMO_BREAKDOWN.map(({ key, label, score }) => ({ key, label, score }));

  if (variant === "mobile") {
    return (
      <div
        className={cn(
          "flex w-full max-w-[18rem] flex-row items-center justify-center gap-4 sm:max-w-none sm:justify-start",
          className,
        )}
      >
        <div className="login-showcase-ambient shrink-0 origin-center scale-[0.68] sm:origin-left sm:scale-[0.76]">
          <ScoreDial
            bandLabel="Strong"
            className="w-[min(100%,220px)] p-3 shadow-[0_12px_36px_rgba(0,0,0,0.2)]"
            label="Example"
            score={DEMO_SCORE}
            showFooter={false}
          />
        </div>
        <div className="min-w-0 text-left">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">Example audit</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-foreground">acme-example.com</p>
          <p className="text-xs text-muted">Live score preview</p>
        </div>
      </div>
    );
  }

  if (variant === "rail") {
    return (
      <div className={cn("login-showcase-ambient flex w-full flex-col items-stretch gap-3 lg:gap-3.5", className)}>
        <div className="w-full origin-top scale-[0.88] lg:scale-95 xl:scale-100">
          <ScoreDial
            bandLabel="Strong"
            className="w-full max-w-[min(100%,260px)] p-3 shadow-[0_14px_40px_rgba(0,0,0,0.2)] lg:p-4"
            label="Example audit"
            score={DEMO_SCORE}
            showFooter={false}
          />
        </div>
        <ScoreBreakdownBars dense items={DEMO_BREAKDOWN.slice(0, 4)} />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("flex w-full max-w-[19rem] flex-col items-stretch gap-4", className)}>
        <ScoreDial
          bandLabel="Strong"
          className="p-4 shadow-[0_16px_48px_rgba(0,0,0,0.18)]"
          label="Example score"
          score={DEMO_SCORE}
        />
        <ScoreBreakdownBars className="max-h-[220px] overflow-y-auto pr-1" items={DEMO_BREAKDOWN.slice(0, 4)} />
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)]", className)}>
      <ScoreDial
        bandLabel="Strong"
        className="h-fit p-4 shadow-[0_20px_56px_rgba(0,0,0,0.22)] lg:p-5"
        label="Example audit"
        score={DEMO_SCORE}
      />
      <div className="flex min-w-0 flex-col gap-4">
        <ScoreBreakdownBars className="max-h-[min(40vh,280px)] overflow-y-auto pr-1" items={DEMO_BREAKDOWN} />
        <div className="relative h-[200px] overflow-hidden rounded-[20px] border border-border/50 bg-panel/35">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 w-[500px] origin-top -translate-x-1/2 scale-[0.38]"
          >
            <ScoreRadar centerLabel="Balance" items={radarItems} className="border-0 bg-transparent p-3 shadow-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
