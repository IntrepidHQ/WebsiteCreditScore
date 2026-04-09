import { NextResponse } from "next/server";

import type { PreviewDevice } from "@/lib/types/audit";
import { getSitePreviewImage } from "@/lib/utils/site-screenshot";
import { normalizeUrl } from "@/lib/utils/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
/** Browserless may run two navigation attempts; keep below host max (e.g. Vercel 60s). */
export const maxDuration = 60;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  const device = (searchParams.get("device") ?? "desktop") as PreviewDevice;

  if (!rawUrl) {
    return new NextResponse("Missing url", { status: 400 });
  }

  if (device !== "desktop" && device !== "mobile") {
    return new NextResponse("Invalid device", { status: 400 });
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrl(rawUrl, { stripWww: false });
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  try {
    // Skip inspectWebsite here: it runs Firecrawl + long fetches and burns the serverless
    // budget before Browserless/PageSpeed run. Capture APIs resolve redirects themselves.
    const preview = await getSitePreviewImage(normalizedUrl, device, undefined, normalizedUrl);

    // Always stream bytes through this route. Redirecting to Supabase often breaks
    // <img> loads (referrer/CORB/CDN quirks) and masks bad objects as “broken” images.
    return new NextResponse(new Uint8Array(preview.buffer), {
      headers: {
        "Content-Type": preview.contentType,
        "Cache-Control": "public, max-age=43200, s-maxage=43200, stale-while-revalidate=86400",
        "Cross-Origin-Resource-Policy": "same-origin",
        "X-Content-Type-Options": "nosniff",
        "X-Preview-Source": preview.source,
        "X-Preview-Reason": preview.reason,
      },
    });
  } catch (err) {
    console.error("[api/preview] fatal:", err);
    return new NextResponse("Preview unavailable", { status: 404 });
  }
}
