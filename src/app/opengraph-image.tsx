import { ImageResponse } from "next/og";

/**
 * Default Open Graph image for the site.
 *
 * Next's `opengraph-image.tsx` convention: the file becomes the default
 * og:image for any page that doesn't declare its own, which lifts CTR in
 * social previews without needing a static asset pipeline. Runs on the edge.
 */

export const runtime = "edge";
export const alt = "WebsiteCreditScore.com — Score your website in 60 seconds";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "linear-gradient(135deg, #0b0c10 0%, #131823 55%, #1b2233 100%)",
          color: "#f6f7fb",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            letterSpacing: "-0.01em",
            color: "#a8b0c3",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "#5b8cff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "#0b0c10",
            }}
          >
            W
          </div>
          WebsiteCreditScore.com
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 88,
              lineHeight: 1.02,
              letterSpacing: "-0.04em",
              fontWeight: 700,
              color: "#f6f7fb",
              maxWidth: 960,
            }}
          >
            Score your website in 60 seconds.
          </div>
          <div
            style={{
              fontSize: 32,
              lineHeight: 1.3,
              color: "#c7cddb",
              maxWidth: 880,
            }}
          >
            A single number for trust, UX, mobile, SEO, accessibility, and security — with the
            evidence behind every point.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 22,
            color: "#8891a8",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 20px",
              borderRadius: 999,
              background: "rgba(91, 140, 255, 0.16)",
              color: "#cdd8ff",
            }}
          >
            Live scan · Structured audit · Benchmark against your industry
          </div>
          <div style={{ color: "#a8b0c3" }}>websitecreditscore.com</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
