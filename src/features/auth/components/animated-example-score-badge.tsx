"use client";

import { useEffect, useRef } from "react";

import gsap from "gsap";

import { useMotionSettings } from "@/hooks/use-motion-settings";

/** Decorative “example audit” ring with a draw animation (honors reduced motion). */
export function AnimatedExampleScoreBadge() {
  const { reduceMotion } = useMotionSettings();
  const progressRef = useRef<SVGCircleElement | null>(null);
  const score = 87;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const targetOffset = circumference - filled;

  useEffect(() => {
    const node = progressRef.current;
    if (!node || reduceMotion) {
      return;
    }

    gsap.fromTo(
      node,
      { strokeDashoffset: circumference },
      {
        strokeDashoffset: targetOffset,
        duration: 1.35,
        ease: "power2.out",
        delay: 0.15,
      },
    );

    const pulse = gsap.to(node, {
      opacity: 0.82,
      duration: 2.4,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });

    return () => {
      pulse.kill();
      gsap.killTweensOf(node);
    };
  }, [circumference, targetOffset, reduceMotion]);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="rotate-[-90deg]" height="136" viewBox="0 0 136 136" width="136">
        <circle
          cx="68"
          cy="68"
          fill="none"
          r={radius}
          stroke="rgba(247,178,27,0.12)"
          strokeWidth="10"
        />
        <circle
          ref={progressRef}
          cx="68"
          cy="68"
          fill="none"
          r={radius}
          stroke="#f7b21b"
          strokeDasharray={circumference}
          strokeDashoffset={reduceMotion ? targetOffset : circumference}
          strokeLinecap="round"
          strokeWidth="10"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-display text-4xl leading-none text-foreground">{score}</span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-accent">Score</span>
      </div>
    </div>
  );
}
