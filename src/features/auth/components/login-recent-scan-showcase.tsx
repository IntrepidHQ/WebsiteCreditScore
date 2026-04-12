"use client";

import dynamic from "next/dynamic";

import { ScoreDial } from "@/components/common/score-dial";
import { ScoreBreakdownBars } from "@/components/common/score-breakdown-bars";
import type { LoginShowcasePayload } from "@/features/auth/lib/resolve-login-showcase";
import { cn } from "@/lib/utils/cn";

const ScoreRadar = dynamic(
  () => import("@/components/common/score-radar").then((m) => m.ScoreRadar),
  { ssr: false },
);

export const LoginRecentScanShowcase = ({
  showcase,
  className,
}: {
  showcase: LoginShowcasePayload;
  className?: string;
}) => {
  const radarItems = showcase.breakdown.map(({ key, label, score }) => ({ key, label, score }));

  return (
    <div className={cn("login-showcase-ambient flex w-full flex-col gap-4", className)}>
      <div className="flex flex-col items-stretch gap-4 lg:flex-row lg:items-start lg:gap-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3 lg:gap-3.5">
          <div className="w-full origin-top scale-[0.88] lg:scale-95 xl:scale-100">
            <ScoreDial
              className="w-full max-w-[min(100%,260px)] p-3 shadow-[0_14px_40px_rgba(0,0,0,0.2)] lg:p-4"
              label="Public scan"
              score={showcase.overallScore}
              showFooter={false}
            />
          </div>
          <ScoreBreakdownBars dense items={showcase.breakdown} />
        </div>

        <section
          aria-label="Category score balance"
          className="relative mx-auto flex h-[200px] w-[200px] shrink-0 items-center justify-center overflow-visible sm:h-[220px] sm:w-[220px] lg:mx-0 lg:mt-2"
        >
          <div className="absolute left-1/2 top-1/2 w-[500px] origin-center -translate-x-1/2 -translate-y-1/2 scale-[0.38] sm:scale-[0.42]">
            <ScoreRadar
              centerLabel="Balance"
              items={radarItems}
              className="rounded-none border-0 bg-transparent p-2 shadow-none"
            />
          </div>
        </section>
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
          Public recent scan
        </p>
        <p className="mt-0.5 truncate text-xs font-semibold text-foreground" title={showcase.title}>
          {showcase.title}
        </p>
        <p className="truncate text-[11px] text-muted">{showcase.hostDisplay}</p>
      </div>
    </div>
  );
};
