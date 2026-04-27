import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Clock,
  Eye,
  FileText,
  MousePointer2,
  Palette,
  Share2,
  Star,
  TrendingUp,
  Zap,
} from "lucide-react";

const BLOG_SLUG_ICONS: Record<string, LucideIcon> = {
  "business-legitimacy": Building2,
  "online-reputation": Star,
  "visual-design": Palette,
  "ux-conversion": MousePointer2,
  transparency: Eye,
  "technical-health": Zap,
  "content-quality": FileText,
  "social-presence": Share2,
  longevity: Clock,
  "financial-signals": TrendingUp,
};

export function getBlogIconForSlug(slug: string): LucideIcon {
  return BLOG_SLUG_ICONS[slug] ?? FileText;
}
