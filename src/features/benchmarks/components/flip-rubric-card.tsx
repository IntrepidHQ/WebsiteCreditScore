"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";
import type { BenchmarkRubric } from "@/lib/types/audit";

export function FlipRubricCard({
  label,
  rubric,
}: {
  label: string;
  rubric: Pick<BenchmarkRubric, "title" | "summary" | "fastLifts">;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="group relative min-h-[300px] cursor-pointer [perspective:1200px]"
      onClick={() => setFlipped((f) => !f)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") setFlipped((f) => !f);
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={cn(
          "absolute inset-0 transition-transform duration-500 [transform-style:preserve-3d]",
          flipped
            ? "[transform:rotateY(180deg)]"
            : "sm:group-hover:[transform:rotateY(180deg)]",
        )}
      >
        {/* Front */}
        <Card className="absolute inset-0 overflow-auto rounded-[24px] border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] [backface-visibility:hidden]">
          <CardHeader className="space-y-4">
            <Badge variant="accent">{label}</Badge>
            <CardTitle className="text-[clamp(2.2rem,1.9rem+0.6vw,3rem)]">
              {rubric.title}
            </CardTitle>
            <p className="text-base leading-7 text-muted">{rubric.summary}</p>
          </CardHeader>
          <div className="px-6 pb-5">
            <p className="text-xs text-muted/55 transition group-hover:text-muted/80">
              Hover or tap to see quick wins →
            </p>
          </div>
        </Card>

        {/* Back */}
        <Card className="absolute inset-0 overflow-auto rounded-[24px] border-accent/25 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-accent)_7%,var(--theme-panel)),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center justify-between">
              <Badge variant="neutral">3 quick wins</Badge>
              <span className="text-xs text-muted/50">tap to flip back</span>
            </div>
            <CardTitle className="text-xl font-semibold leading-snug text-foreground">
              {rubric.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-0">
            {rubric.fastLifts.map((item) => (
              <div
                className="rounded-[18px] border border-border/50 bg-background/30 px-4 py-3 text-sm leading-6 text-foreground"
                key={item}
              >
                {item}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
