import type { MetadataRoute } from "next";

const routes = [
  "",
  "/benchmarks",
  "/blog",
  "/cookies",
  "/docs",
  "/pricing",
  "/privacy",
  "/restore",
  "/terms",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return routes.map((route) => ({
    url: `https://websitecreditscore.com${route}`,
    lastModified: now,
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}
