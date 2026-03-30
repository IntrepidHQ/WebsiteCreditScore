"use client";

import Image from "next/image";
import { cn } from "@/lib/utils/cn";

export function WebsiteCreditScoreLogo({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <Image
      alt="WebsiteCreditScore.com"
      className={cn(
        compact
          ? "h-auto w-[11rem] max-w-none"
          : "h-auto w-[17rem] max-w-none sm:w-[19rem]",
        className,
      )}
      decoding="async"
      draggable={false}
      height={94}
      priority={!compact}
      unoptimized
      src="/brand/website-credit-score.svg"
      sizes={compact ? "176px" : "(max-width: 640px) 272px, 304px"}
      width={536}
    />
  );
}
