"use client";

import { NodeGridBackdrop } from "@/features/landing/components/node-grid/node-grid-backdrop";

/**
 * Soft lattice behind the login layout — uses theme surface tokens (no film grain:
 * grain reads as “dirty” on a long-form auth screen and fights WC contrast).
 */
export const LoginLatticeBackdrop = () => {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(165deg,var(--theme-background)_0%,color-mix(in_srgb,var(--theme-background-alt)_38%,var(--theme-background))_42%,var(--theme-background-alt)_100%))]" />
      <div
        className="absolute inset-0 opacity-[0.55] mix-blend-soft-light"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 12%, color-mix(in srgb, var(--theme-accent) 14%, transparent), transparent 42%), radial-gradient(circle at 88% 0%, color-mix(in srgb, var(--theme-muted) 10%, transparent), transparent 38%)",
        }}
      />
      <NodeGridBackdrop
        className="opacity-[0.22]"
        gridType="constellation"
        linkHoverFromPointer={false}
        withNoiseOverlay={false}
      />
    </div>
  );
};
