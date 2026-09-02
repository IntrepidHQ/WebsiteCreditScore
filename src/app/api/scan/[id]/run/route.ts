import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { claimScanRun, getScan } from "@/lib/db/scans";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Starts a persisted scan worker and returns immediately. The scan page polls
 * the database record, so browser navigation cannot cancel the paid research.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }

  const scan = await getScan(id);
  if (!scan) return NextResponse.json({ error: "not found" }, { status: 404 });
  if (!scan.paid) return NextResponse.json({ error: "payment required" }, { status: 402 });
  if (scan.status === "done") return NextResponse.json({ status: "done" });

  const claimed = await claimScanRun(id);
  if (!claimed) return NextResponse.json({ status: scan.status, running: scan.status === "streaming" }, { status: 202 });

  const workerUrl = new URL(`/api/scan/${id}/stream`, req.url);
  console.info(`[scan/run] queued worker dispatch for ${id} -> ${workerUrl.origin}`);
  after(async () => {
    try {
      console.info(`[scan/run] dispatching worker for ${id}`);
      const response = await fetch(workerUrl, { headers: { "x-wcs-scan-worker": "1" }, cache: "no-store" });
      console.info(`[scan/run] worker response for ${id}: ${response.status}`);
      if (!response.body) return;
      const reader = response.body.getReader();
      while (!(await reader.read()).done) {
        // Consume the worker's SSE stream so the scan continues after the POST responds.
      }
      console.info(`[scan/run] worker completed for ${id}`);
    } catch (error) {
      console.error(`[scan/run] worker dispatch failed for ${id}:`, error);
    }
  });

  return NextResponse.json({ status: "streaming", running: true }, { status: 202 });
}
