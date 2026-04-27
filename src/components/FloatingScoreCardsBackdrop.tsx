"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export type FloatingScoreCardInput = {
  id: string;
  label: string;
  grade: string;
  scoreOutOf10: string;
  color: string;
};

/** Positions orbit the hero card center; offsets tuned so outer cards nearly touch the browser mockup */
type Layout = {
  top: string;
  /** translateX after centering (negative = left of center) */
  tx: string;
  ty: string;
  rotate: number;
  zIndex: number;
  blur: boolean;
  opacity: number;
  scale: number;
  hideBelow?: "sm" | "md" | "lg";
  duration: number;
};

const LAYOUTS: Layout[] = [
  // Outer ring: cards live in negative space around the browser shell, not on top of it.
  { top: "11%", tx: "calc(-1 * (min(17.8rem, 49vw) + 5.1rem))", ty: "-12%", rotate: -7, zIndex: 3, blur: false, opacity: 0.95, scale: 0.99, duration: 4.6 },
  { top: "13%", tx: "calc(min(17.8rem, 49vw) + 5.1rem)", ty: "-11%", rotate: 6, zIndex: 3, blur: false, opacity: 0.95, scale: 0.99, duration: 5.2 },
  { top: "33%", tx: "calc(-1 * (min(18.3rem, 50vw) + 5rem))", ty: "-3%", rotate: -5, zIndex: 2, blur: false, opacity: 0.9, scale: 0.96, hideBelow: "lg", duration: 4.9 },
  { top: "35%", tx: "calc(min(18.3rem, 50vw) + 5rem)", ty: "-2%", rotate: 5, zIndex: 2, blur: false, opacity: 0.88, scale: 0.96, hideBelow: "lg", duration: 5.5 },
  { top: "71%", tx: "calc(-1 * (min(17.4rem, 46vw) + 4.9rem))", ty: "8%", rotate: 4, zIndex: 3, blur: false, opacity: 0.93, scale: 0.97, hideBelow: "md", duration: 4.7 },
  { top: "73%", tx: "calc(min(17.4rem, 46vw) + 4.9rem)", ty: "8%", rotate: -6, zIndex: 3, blur: false, opacity: 0.94, scale: 0.98, hideBelow: "md", duration: 5.3 },
  { top: "52%", tx: "calc(-1 * (min(20rem, 53vw) + 5rem))", ty: "-21%", rotate: 8, zIndex: 1, blur: true, opacity: 0.79, scale: 0.88, hideBelow: "md", duration: 6.1 },
  { top: "50%", tx: "calc(min(20rem, 53vw) + 5rem)", ty: "-18%", rotate: -9, zIndex: 1, blur: true, opacity: 0.78, scale: 0.88, hideBelow: "sm", duration: 5.8 },
];

const hideBelowClass: Record<NonNullable<Layout["hideBelow"]>, string> = {
  sm: "hidden sm:block",
  md: "hidden md:block",
  lg: "hidden lg:block",
};

function MiniFloatCard({
  label,
  grade,
  scoreOutOf10,
  color,
}: Omit<FloatingScoreCardInput, "id">) {
  return (
    <div
      className="rounded-xl p-2.5 shadow-2xl"
      style={{
        border: `1px solid color-mix(in srgb, ${color} 35%, var(--theme-border) 40%)`,
        background:
          "linear-gradient(155deg, color-mix(in srgb, var(--theme-panel) 82%, transparent), color-mix(in srgb, var(--theme-elevated) 65%, transparent))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow:
          "0 28px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="flex h-7 min-w-[1.75rem] items-center justify-center rounded-full px-1 text-[10px] font-score leading-none"
          style={{
            border: `1px solid color-mix(in srgb, ${color} 55%, transparent)`,
            color,
            backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`,
          }}
        >
          {grade}
        </span>
        <span className="font-score text-[1.35rem] leading-none sm:text-2xl" style={{ color }}>
          {scoreOutOf10}
        </span>
      </div>
      <p
        className="mt-2 line-clamp-2 text-[10px] font-medium leading-snug"
        style={{ color: "var(--theme-muted)" }}
      >
        {label}
      </p>
      <p className="mt-0.5 font-score text-[9px] opacity-70" style={{ color: "var(--theme-muted)" }}>
        /10
      </p>
    </div>
  );
}

export function FloatingScoreCardsBackdrop({
  cards,
  children,
}: {
  cards: FloatingScoreCardInput[];
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const items = cards.slice(0, LAYOUTS.length).map((c, i) => ({ ...c, layout: LAYOUTS[i] }));

  return (
    <div className="relative mx-auto w-full max-w-3xl lg:max-w-none">
      <div
        className="relative mx-auto min-h-[440px] w-full max-w-[30rem] sm:min-h-[470px] sm:max-w-[34rem] lg:min-h-[530px] lg:max-w-[42rem]"
        style={{ isolation: "isolate" }}
      >
        {items.map(({ id, layout, ...card }) => {
          const blurPx = layout.blur ? "0.38px" : undefined;
          const pos: React.CSSProperties = {
            position: "absolute",
            left: "50%",
            top: layout.top,
            zIndex: layout.zIndex,
            width: "9.25rem",
            marginLeft: "-4.625rem",
            transform: `translate(${layout.tx}, ${layout.ty}) rotate(${layout.rotate}deg) scale(${layout.scale})`,
            filter: blurPx ? `blur(${blurPx})` : undefined,
            opacity: layout.opacity,
          };

          const hideCls = layout.hideBelow ? hideBelowClass[layout.hideBelow] : "";

          return (
            <div key={id} className={`pointer-events-none select-none ${hideCls}`} style={pos}>
              <motion.div
                animate={reduceMotion ? undefined : { y: [0, -5, 0] }}
                transition={
                  reduceMotion
                    ? undefined
                    : {
                        duration: layout.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: id.length * 0.04,
                      }
                }
              >
                <MiniFloatCard {...card} />
              </motion.div>
            </div>
          );
        })}

        <div className="relative z-10 flex min-h-[inherit] items-center justify-center px-2 py-6 sm:px-4 sm:py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
