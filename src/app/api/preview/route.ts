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
  const runId = `preview-${Date.now()}`;

  // #region agent log
  fetch("http://127.0.0.1:7468/ingest/c5386a22-ca2a-4aae-9102-924794d536c2", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8da5be" },
    body: JSON.stringify({
      sessionId: "8da5be",
      runId,
      hypothesisId: "H5",
      location: "src/app/api/preview/route.ts:18",
      message: "preview route request received",
      data: { hasRawUrl: Boolean(rawUrl), device },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!rawUrl) {
    return new NextResponse("Missing url", { status: 400 });
  }

  if (device !== "desktop" && device !== "mobile") {
    return new NextResponse("Invalid device", { status: 400 });
  }

  try {
    const normalizedUrl = normalizeUrl(rawUrl);
    const observation = await inspectWebsite(normalizedUrl).catch(() => null);
    // #region agent log
    fetch("http://127.0.0.1:7468/ingest/c5386a22-ca2a-4aae-9102-924794d536c2", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8da5be" },
      body: JSON.stringify({
        sessionId: "8da5be",
        runId,
        hypothesisId: "H2",
        location: "src/app/api/preview/route.ts:39",
        message: "inspectWebsite completed",
        data: {
          normalizedUrl,
          observationFound: Boolean(observation),
          fetchSucceeded: observation?.fetchSucceeded ?? null,
          hasOgImage: Boolean(observation?.ogImage),
          finalUrl: observation?.finalUrl ?? null,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    const preview = await getSitePreviewImage(
      observation?.finalUrl || normalizedUrl,
      device,
      observation?.ogImage,
    );
    // #region agent log
    fetch("http://127.0.0.1:7468/ingest/c5386a22-ca2a-4aae-9102-924794d536c2", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8da5be" },
      body: JSON.stringify({
        sessionId: "8da5be",
        runId,
        hypothesisId: "H1",
        location: "src/app/api/preview/route.ts:59",
        message: "preview image resolved",
        data: {
          source: preview.source,
          reason: preview.reason,
          contentType: preview.contentType,
          bufferBytes: preview.buffer.byteLength,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

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
  } catch (error) {
    // #region agent log
    fetch("http://127.0.0.1:7468/ingest/c5386a22-ca2a-4aae-9102-924794d536c2", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8da5be" },
      body: JSON.stringify({
        sessionId: "8da5be",
        runId,
        hypothesisId: "H5",
        location: "src/app/api/preview/route.ts:83",
        message: "preview route failed",
        data: { errorMessage: error instanceof Error ? error.message : "unknown-error" },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    return new NextResponse("Preview unavailable", { status: 404 });
  }
}
