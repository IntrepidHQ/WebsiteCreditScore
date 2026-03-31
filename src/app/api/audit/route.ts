import { NextResponse } from "next/server";

import { buildLiveAuditReportFromUrl } from "@/lib/mock/report-builder";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };

    if (!body.url) {
      return NextResponse.json(
        { error: "Enter a website URL to generate the audit." },
        { status: 400 },
      );
    }

    const session = await getOptionalWorkspaceSession();

    if (session) {
      const repository = getProductRepository(session);
      const workspace = await repository.ensureWorkspace(session);
      const lead = await repository.createLeadFromUrl(workspace.id, body.url, session);

      return NextResponse.json({
        id: lead.id,
        leadId: lead.id,
        normalizedUrl: lead.normalizedUrl,
        persisted: true,
      });
    }

    const report = await buildLiveAuditReportFromUrl(body.url);

    return NextResponse.json({
      id: report.id,
      normalizedUrl: report.normalizedUrl,
      report,
      persisted: false,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_TOKENS") {
      return NextResponse.json(
        { error: "You are out of tokens. Add more on pricing to run another scan." },
        { status: 402 },
      );
    }

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
