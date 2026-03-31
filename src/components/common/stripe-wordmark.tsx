import { cn } from "@/lib/utils/cn";

export function StripeWordmark({
  className,
}: {
  className?: string;
}) {
  return (
    <svg
      aria-label="Stripe"
      className={cn("h-5 w-auto", className)}
      role="img"
      viewBox="0 0 86 28"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect fill="#635BFF" height="28" rx="9" width="86" />
      <text
        fill="white"
        fontFamily="var(--font-space-grotesk), var(--font-manrope), sans-serif"
        fontSize="16"
        fontWeight="700"
        letterSpacing="-0.04em"
        x="15"
        y="19"
      >
        stripe
      </text>
    </svg>
  );
}
