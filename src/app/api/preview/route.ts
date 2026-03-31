import { NextResponse } from "next/server";

import type { PreviewDevice } from "@/lib/types/audit";
import { inspectWebsite } from "@/lib/utils/site-observation";
import { getSitePreviewImage } from "@/lib/utils/site-screenshot";
import { normalizeUrl } from "@/lib/utils/url";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 25;

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

  try {
    const normalizedUrl = normalizeUrl(rawUrl);
    const observation = await inspectWebsite(normalizedUrl).catch(() => null);
    const preview = await getSitePreviewImage(
      observation?.finalUrl || normalizedUrl,
      device,
      observation?.ogImage,
    );

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
  } catch {
    return new NextResponse("Preview unavailable", { status: 404 });
  }
}
