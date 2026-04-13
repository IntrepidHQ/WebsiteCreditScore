"use client";

import { NodeGridBackdrop } from "@/features/landing/components/node-grid/node-grid-backdrop";

/**
 * Animated canvas lattice behind the login layout — powered by the
 * robot-components DotGridCanvas engine (constellation grid + WebGL noise overlay).
 */
export const LoginLatticeBackdrop = () => {
  return (
    <NodeGridBackdrop
      gridType="constellation"
      withNoiseOverlay={true}
    />
  );
};
