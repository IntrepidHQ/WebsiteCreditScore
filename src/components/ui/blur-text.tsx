"use client";

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
  onAnimationComplete?: () => void;
}

export function BlurText({
  text,
  delay = 80,
  className = "",
  animateBy = "words",
  direction = "top",
  threshold = 0.1,
  onAnimationComplete,
}: BlurTextProps) {
  const segments = animateBy === "words" ? text.split(" ") : text.split("");
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  const fromY = direction === "top" ? -20 : 20;

  return (
    <span ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {segments.map((segment, index) => (
        <motion.span
          key={index}
          initial={{ filter: "blur(8px)", opacity: 0, y: fromY }}
          animate={inView ? { filter: "blur(0px)", opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: (index * delay) / 1000, ease: "easeOut" }}
          onAnimationComplete={index === segments.length - 1 ? onAnimationComplete : undefined}
          style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
        >
          {segment}
          {animateBy === "words" && index < segments.length - 1 ? "\u00A0" : ""}
        </motion.span>
      ))}
    </span>
  );
}
