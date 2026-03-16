import { NextResponse } from "next/server";

import { buildLiveAuditReportFromUrl } from "@/lib/mock/report-builder";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };

    if (!body.url) {
      return NextResponse.json(
        { error: "Enter a website URL to generate the audit." },
        { status: 400 },
      );
    }

    const report = await buildLiveAuditReportFromUrl(body.url);

    return NextResponse.json({
      id: report.id,
      normalizedUrl: report.normalizedUrl,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate the audit.",
      },
      { status: 400 },
    );
  }
}
