"use client";

import { useEffect, useRef, useState } from "react";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { useMotionSettings } from "@/hooks/use-motion-settings";

export function AnimatedScore({ score }: { score: number }) {
  const { reduceMotion } = useMotionSettings();
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (reduceMotion || !ref.current) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const counter = { value: 0 };
    const ctx = gsap.context(() => {
      gsap.to(counter, {
        value: score,
        duration: 1.4,
        ease: "power3.out",
        onUpdate: () => setValue(Number(counter.value.toFixed(1))),
        scrollTrigger: {
          trigger: ref.current,
          start: "top 88%",
          once: true,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [reduceMotion, score]);

  return <span ref={ref}>{(reduceMotion ? score : value).toFixed(1)}</span>;
}
