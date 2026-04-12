/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { cn } from "@/lib/utils/cn";

const WORDMARK_SRC = "/brand/website-credit-score.svg";

/**
 * Static SVG wordmark from `/public/brand`. Use `on-dark` on dark `background` / panel (default SVG is light);
 * use `on-light` only on truly light surfaces (inverts to near-black).
 */
export const BrandWordmarkLink = ({
  className,
  variant,
}: {
  className?: string;
  variant: "on-dark" | "on-light";
}) => {
  return (
    <Link
      className={cn(
        "inline-block rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/35 focus-visible:ring-offset-2",
        variant === "on-light" && "focus-visible:ring-offset-background",
        variant === "on-dark" && "focus-visible:ring-offset-background",
        className,
      )}
      href="/"
    >
      <img
        alt="WebsiteCreditScore.com"
        className={cn(
          "h-8 w-auto sm:h-9",
          "max-w-[min(100%,17.5rem)] object-left object-contain",
          variant === "on-light" && "brightness-0 opacity-[0.92]",
          variant === "on-dark" &&
            "drop-shadow-[0_1px_0_rgba(0,0,0,0.85)] drop-shadow-[0_0_18px_rgba(0,0,0,0.35)]",
        )}
        height={94}
        src={WORDMARK_SRC}
        width={536}
      />
    </Link>
  );
};
