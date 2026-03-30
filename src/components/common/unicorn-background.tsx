"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const UnicornScene = dynamic(() => import("unicornstudio-react/next"), { ssr: false });

const PROJECT_ID = "fy3DzlOCSA694aAFdt9M";
const SDK_URL =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v2.1.5/dist/unicornStudio.umd.js";

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

function BackgroundFallback() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(113,209,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(170,255,165,0.12),transparent_35%),linear-gradient(180deg,rgba(4,8,20,0.95),rgba(4,8,20,0.8))]"
    />
  );
}

export function UnicornBackground() {
  const prefersReducedMotion = usePrefersReducedMotion();

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden print:hidden">
      <BackgroundFallback />
      {!prefersReducedMotion ? (
        <UnicornScene
          ariaLabel="Decorative background scene"
          className="absolute inset-0 h-full w-full opacity-75 saturate-110"
          fps={30}
          height="100%"
          lazyLoad
          paused={false}
          placeholder={<BackgroundFallback />}
          production
          projectId={PROJECT_ID}
          scale={0.4}
          sdkUrl={SDK_URL}
          showPlaceholderOnError
          showPlaceholderWhileLoading
          width="100%"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,10,0.22),rgba(3,5,10,0.54)_18%,rgba(3,5,10,0.78)_100%)]" />
    </div>
  );
}
