"use client";

import { Badge } from "@/components/ui/badge";
import { ShinyText } from "@/components/ui/shiny-text";
import { useThemeStore } from "@/store/theme-store";

export const LandingHeroEyebrowBadge = () => {
  const mode = useThemeStore((state) => state.tokens.mode);
  const isLight = mode === "light";

  return (
    <Badge className="tracking-[0.16em]" variant={isLight ? "inverse" : "accent"}>
      <ShinyText disabled={isLight} speed={4} text="Website Audits, Reviews, and Redesigns" />
    </Badge>
  );
};
