import type { LucideIcon } from "lucide-react";
import {
  Accessibility,
  BadgeCheck,
  MousePointer2,
  Palette,
  Search,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import type { AuditCategoryKey } from "@/lib/types/audit";

export const scoreCategoryPalette: Record<AuditCategoryKey, string> = {
  "visual-design": "#7ca2ff",
  "ux-conversion": "#f7b21b",
  "mobile-experience": "#4fd7a3",
  "seo-readiness": "#ff9a6a",
  accessibility: "#b98dff",
  "trust-credibility": "#61d7ff",
  "security-posture": "#ff7ca8",
};

export const scoreCategoryIcons: Record<AuditCategoryKey, LucideIcon> = {
  "visual-design": Palette,
  "ux-conversion": MousePointer2,
  "mobile-experience": Smartphone,
  "seo-readiness": Search,
  accessibility: Accessibility,
  "trust-credibility": BadgeCheck,
  "security-posture": ShieldCheck,
};
