import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Building2,
  Clock,
  Eye,
  FileText,
  Gauge,
  MousePointer2,
  Palette,
  Presentation,
  Search,
  Share2,
  ShieldCheck,
  Star,
  Timer,
  TrendingUp,
  Zap,
} from "lucide-react";

const BLOG_SLUG_ICONS: Record<string, LucideIcon> = {
  "how-to-check-if-a-website-is-legit": ShieldCheck,
  "website-trust-scores-explained": Gauge,
  "why-your-website-looks-untrustworthy": AlertTriangle,
  "online-reputation-audit": Search,
  "red-flags-customers-notice-in-5-seconds": Timer,
  "from-credibility-score-to-sales-pitch": Presentation,
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
