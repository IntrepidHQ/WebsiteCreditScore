"use client";

import { useEffect, useRef, useState } from "react";

import gsap from "gsap";

import { useMotionSettings } from "@/hooks/use-motion-settings";
import { cn } from "@/lib/utils/cn";
import { getDialMetrics } from "@/lib/utils/score-visuals";

const skeletonCategories = [
  { label: "Visual design", key: "vd" },
  { label: "UX / conversion", key: "ux" },
  { label: "Mobile experience", key: "mb" },
  { label: "Trust / credibility", key: "tr" },
] as const;

type ScanLoadingOverlayProps = {
  active: boolean;
  /**
   * Landing: set true when `/api/audit` succeeded. Dial finishes to 10.0, then `onDialReachedTen` runs once.
   */
  scanDataReady?: boolean;
  /** Landing only: navigate / tear down overlay after the dial shows 10.0 and data is ready. */
  onDialReachedTen?: () => void;
  /**
   * `landing` — tied to scan API completion.
   * `route` — audit page loading shell: one climb 0→10, hold (no loop).
   */
  mode?: "landing" | "route";
};

/**
 * Full-screen loading state for live scans: dial eases toward 10 (slower near the end). No looping.
 */
export function ScanLoadingOverlay({
  active,
  scanDataReady = false,
  onDialReachedTen,
  mode = "landing",
}: ScanLoadingOverlayProps) {
  const { reduceMotion } = useMotionSettings();
  const barRefs = useRef<Array<HTMLDivElement | null>>([]);
  const radius = 64;
  const size = 168;
  const strokeWidth = 11;
  const [displayScore, setDisplayScore] = useState(0);
  const { circumference, dashOffset } = getDialMetrics(Math.min(displayScore, 10), radius);
  const onDialReachedTenRef = useRef(onDialReachedTen);
  const firedRef = useRef(false);
  const counterRef = useRef({ value: 0 });

  onDialReachedTenRef.current = onDialReachedTen;

  useEffect(() => {
    const counter = counterRef.current;

    if (!active) {
      gsap.killTweensOf(counter);
      counter.value = 0;
      firedRef.current = false;
      setDisplayScore(0);
      return;
    }

    if (reduceMotion) {
      gsap.killTweensOf(counter);
      if (mode === "route") {
        counter.value = 10;
        setDisplayScore(10);
        return;
      }
      if (scanDataReady) {
        counter.value = 10;
        setDisplayScore(10);
        if (!firedRef.current) {
          firedRef.current = true;
          queueMicrotask(() => onDialReachedTenRef.current?.());
        }
      } else {
        counter.value = 8;
        setDisplayScore(8);
      }
      return;
    }

    const tick = () => {
      setDisplayScore(Number(counter.value.toFixed(1)));
    };

    gsap.killTweensOf(counter);
    firedRef.current = false;

    if (mode === "route") {
      counter.value = 0;
      tick();
      gsap.to(counter, {
        value: 10,
        duration: 10,
        ease: "power2.out",
        onUpdate: tick,
        onComplete: () => {
          setDisplayScore(10);
        },
      });
      return () => gsap.killTweensOf(counter);
    }

    const finishToTenAndExit = () => {
      gsap.killTweensOf(counter);
      const remaining = 10 - counter.value;
      const duration = Math.min(0.55, Math.max(0.22, remaining * 0.09));
      gsap.to(counter, {
        value: 10,
        duration,
        ease: "power2.out",
        onUpdate: tick,
        onComplete: () => {
          setDisplayScore(10);
          if (!firedRef.current) {
            firedRef.current = true;
            onDialReachedTenRef.current?.();
          }
        },
      });
    };

    if (scanDataReady) {
      finishToTenAndExit();
      return () => gsap.killTweensOf(counter);
    }

    counter.value = 0;
    tick();
    gsap.to(counter, {
      value: 10,
      duration: 26,
      ease: "power2.out",
      onUpdate: tick,
      onComplete: () => {
        setDisplayScore(10);
      },
    });

    return () => gsap.killTweensOf(counter);
  }, [active, mode, reduceMotion, scanDataReady]);

  useEffect(() => {
    if (!active || reduceMotion) {
      return;
    }

    const nodes = barRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!nodes.length) {
      return;
    }

    gsap.killTweensOf(nodes);
    gsap.set(nodes, { width: "7%" });

    const tl = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    tl.to(nodes, {
      width: "52%",
      duration: 1.35,
      stagger: 0.1,
    }).to(nodes, {
      width: "28%",
      duration: 1.55,
      stagger: 0.12,
    });

    return () => {
      tl.kill();
      gsap.killTweensOf(nodes);
      gsap.set(nodes, { clearProps: "width" });
    };
  }, [active, reduceMotion]);

  if (!active) {
    return null;
  }

  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="fixed inset-0 z-[200] flex items-center justify-center bg-background/88 px-4 py-10 backdrop-blur-md"
      role="status"
    >
      <span className="sr-only">Generating audit, please wait</span>
      <div
        className={cn(
          "w-full max-w-lg rounded-[28px] border border-border/60 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--theme-panel)_88%,transparent),color-mix(in_srgb,var(--theme-background-alt)_96%,transparent))] p-6 shadow-[0_28px_80px_rgba(0,0,0,0.35)]",
        )}
      >
        <p className="text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Live scan in progress
        </p>
        <div className="mt-5 flex flex-col items-center">
          <div className="relative flex items-center justify-center">
            <svg
              aria-hidden
              className="rotate-[-90deg]"
              height={size}
              viewBox={`0 0 ${size} ${size}`}
              width={size}
            >
              <circle
                cx={size / 2}
                cy={size / 2}
                fill="none"
                r={radius}
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={strokeWidth}
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                fill="none"
                r={radius}
                stroke="var(--theme-accent)"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                strokeWidth={strokeWidth}
              />
            </svg>
            <div className="absolute flex flex-col items-center text-center">
              <span className="font-display text-[3.25rem] leading-none tracking-[-0.05em] text-foreground">
                {displayScore.toFixed(1)}
              </span>
              <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                out of 10
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          {skeletonCategories.map((row, index) => (
            <div className="space-y-1.5" key={row.key}>
              <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-[0.12em] text-muted">
                <span>{row.label}</span>
                <span className="text-foreground/70">…</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-background/40">
                <div
                  className={cn("h-full min-w-0 overflow-hidden rounded-full", !reduceMotion && "will-change-[width]")}
                  ref={(node) => {
                    barRefs.current[index] = node;
                  }}
                  style={{ width: reduceMotion ? "52%" : "7%" }}
                >
                  <div
                    className={cn(
                      "h-full w-full rounded-full bg-[linear-gradient(90deg,rgba(247,178,27,0.95),rgba(247,178,27,0.42),rgba(247,178,27,0.18))]",
                      !reduceMotion && "scan-bar-fill-animated",
                    )}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-sm leading-6 text-muted">
          Scoring the live site, benchmarks, and trust signals — this usually takes a moment.
        </p>
      </div>
    </div>
  );
}
