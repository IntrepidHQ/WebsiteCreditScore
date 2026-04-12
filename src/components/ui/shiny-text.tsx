"use client";

import { cn } from "@/lib/utils/cn";

interface ShinyTextProps {
  text: string;
  className?: string;
  speed?: number;
  disabled?: boolean;
}

export function ShinyText({ text, className = "", speed = 3, disabled = false }: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  if (disabled) {
    return <span className={cn("inline-block", className)}>{text}</span>;
  }

  return (
    <span
      className={cn("inline-block bg-clip-text animate-shine", className)}
      style={{
        backgroundImage:
          "linear-gradient(110deg, #f7b21b 0%, #f7b21b 35%, #fffbe6 50%, #f7b21b 65%, #f7b21b 100%)",
        backgroundSize: "200% auto",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        animationDuration,
      }}
    >
      {text}
    </span>
  );
}
