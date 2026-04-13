import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { WorkspaceThemeFrame } from "@/components/common/workspace-theme-frame";
import { AuditReportContent } from "@/features/audit/components/audit-report-content";
import { ReportEmptyState } from "@/features/audit/components/report-empty-state";
import {
  buildLiveAuditReportById,
  buildLiveAuditReportFromUrl,
} from "@/lib/mock/report-builder";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";
import { getProductRepository } from "@/lib/product/repository";
import { getCachedReport } from "@/lib/utils/scan-cache";
import { normalizeUrl } from "@/lib/utils/url";

async function resolveReportForMeta(id: string, url?: string, share?: string) {
  try {
    if (share) {
      const shared = await getProductRepository().resolvePublicShare("audit", id, share);
      return shared?.savedReport.reportSnapshot ?? null;
    }
    if (url) {
      const normalized = normalizeUrl(url);
      const cached = await getCachedReport(normalized);
      return cached ?? (await buildLiveAuditReportFromUrl(url));
    }
    return await buildLiveAuditReportById(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string; share?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const { url, share } = await searchParams;
  const report = await resolveReportForMeta(id, url, share);

  if (!report) {
    return { title: "Site Audit | WebsiteCreditScore" };
  }

  const domain = report.normalizedUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const score = Number(report.overallScore ?? 0).toFixed(1);
  const title = `${report.title || domain} — Score ${score} | WebsiteCreditScore`;
  const description = report.executiveSummary
    ? report.executiveSummary.slice(0, 160)
    : `Site audit and redesign score for ${domain}.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default async function AuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string; share?: string }>;
}) {
  const { id } = await params;
  const { url, share } = await searchParams;

  let report = null;

  if (share) {
    const shared = await getProductRepository().resolvePublicShare("audit", id, share);

    if (shared) {
      report = shared.savedReport.reportSnapshot;
    }
  } else if (url) {
    try {
      // Check scan cache first to avoid redundant re-scanning
      const normalized = normalizeUrl(url);
      report = await getCachedReport(normalized);

      if (!report) {
        report = await buildLiveAuditReportFromUrl(url);
      }
    } catch {
      return (
        <ReportEmptyState
          title="This URL needs a cleaner format"
          description="Use a valid public website URL to generate the audit. The report route itself is working, but the incoming URL was not parseable."
        />
      );
    }
  } else {
    report = await buildLiveAuditReportById(id);
  }

  if (!report) {
    notFound();
  }

  const session = await getOptionalWorkspaceSession();
  const isAuthenticated = Boolean(session);

  return (
    <WorkspaceThemeFrame>
      <AuditReportContent isAuthenticated={isAuthenticated} report={report} />
    </WorkspaceThemeFrame>
  );
}
