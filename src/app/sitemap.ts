import type { MetadataRoute } from "next";
import { TREND_ARTICLES } from "@/lib/content/trends";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://websitecreditscore.com";

  const staticRoutes: Array<{
    path: string;
    priority: number;
    frequency: MetadataRoute.Sitemap[0]["changeFrequency"];
  }> = [
    { path: "/", priority: 1.0, frequency: "weekly" },
    { path: "/benchmarks", priority: 0.9, frequency: "weekly" },
    { path: "/examples", priority: 0.85, frequency: "weekly" },
    { path: "/platform", priority: 0.8, frequency: "monthly" },
    { path: "/pricing", priority: 0.85, frequency: "monthly" },
    { path: "/docs", priority: 0.75, frequency: "monthly" },
    { path: "/docs/trends", priority: 0.8, frequency: "weekly" },
    { path: "/agencies", priority: 0.7, frequency: "monthly" },
  ];

  return [
    ...staticRoutes.map(({ path, priority, frequency }) => ({
      url: `${base}${path}`,
      lastModified: new Date(),
      changeFrequency: frequency,
      priority,
    })),
    ...TREND_ARTICLES.map((article) => ({
      url: `${base}/docs/trends/${article.slug}`,
      lastModified: new Date(article.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
