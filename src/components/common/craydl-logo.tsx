"use client";

import Image from "next/image";

import { useThemeStore } from "@/store/theme-store";

export function CraydlLogo({
  compact = false,
}: {
  compact?: boolean;
}) {
  const mode = useThemeStore((state) => state.tokens.mode);
  const logoSrc =
    mode === "dark" ? "/brand/craydl-logo-light.png" : "/brand/craydl-logo-dark.png";

  return (
    <div className="flex min-w-0 flex-col">
      <Image
        alt="Craydl"
        className={compact ? "h-auto w-[10rem]" : "h-auto w-[13rem] sm:w-[15rem]"}
        height={390}
        priority={!compact}
        sizes={compact ? "160px" : "(max-width: 640px) 208px, 240px"}
        src={logoSrc}
        width={3169}
      />
      <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted">
        Web Design Agency
      </span>
    </div>
  );
}
