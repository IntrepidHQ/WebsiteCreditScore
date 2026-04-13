"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

export type MagnifierGridOcclusionProps = {
  mousePosRef: MutableRefObject<{ x: number; y: number } | null>;
  radius: number;
  theme: "dark" | "light";
  /** Whether the magnifier is active. Canvas only draws when active. */
  active?: boolean;
};

/**
 * Paints the page background color over the dot grid in a circle under the lens,
 * so only the magnified resample (drawn above) reads as "through the glass".
 *
 * Ported from robot-components/app/nodegrid/_components/magnifier-grid-occlusion.tsx
 * Adapted: reads --theme-background instead of --app-bg.
 */
export const MagnifierGridOcclusion = ({
  mousePosRef,
  radius,
  theme,
  active = true,
}: MagnifierGridOcclusionProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  const themeRef = useRef(theme);
  activeRef.current = active;
  themeRef.current = theme;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const rafRef = { id: 0 };

    const resolveBg = (): string => {
      const raw = getComputedStyle(document.documentElement)
        .getPropertyValue("--theme-background")
        .trim();
      if (raw && (raw.startsWith("#") || raw.startsWith("rgb") || raw.startsWith("hsl"))) {
        return raw;
      }
      return themeRef.current === "light" ? "#f7f7f7" : "#0f0f0f";
    };

    const tick = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.id = requestAnimationFrame(tick);
        return;
      }
      const w = canvas.width;
      const h = canvas.height;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const pos = mousePosRef.current;
      if (!pos || radius < 4 || !activeRef.current) {
        rafRef.id = requestAnimationFrame(tick);
        return;
      }

      /** Slightly larger than the lens to hide grid anti-alias at the rim */
      const R = radius + 2;
      ctx.fillStyle = resolveBg();
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, R, 0, Math.PI * 2);
      ctx.fill();

      rafRef.id = requestAnimationFrame(tick);
    };

    rafRef.id = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(rafRef.id);
    };
  }, [radius, theme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 40,
      }}
    />
  );
};
