import { notFound } from "next/navigation";

import { WorkspaceThemeFrame } from "@/components/common/workspace-theme-frame";
import { ReportEmptyState } from "@/features/audit/components/report-empty-state";
import { BriefBuilder } from "@/features/brief/components/brief-builder";
import {
  buildLiveAuditReportById,
  buildLiveAuditReportFromUrl,
} from "@/lib/mock/report-builder";
import { getProductRepository } from "@/lib/product/repository";
import { getCachedReport } from "@/lib/utils/scan-cache";
import { normalizeUrl } from "@/lib/utils/url";

export default async function BriefPage({
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
    const shared = await getProductRepository().resolvePublicShare("brief", id, share);

    if (shared) {
      report = shared.savedReport.reportSnapshot;
    }
  } else if (url) {
    try {
      const normalized = normalizeUrl(url);
      report = await getCachedReport(normalized);

      if (!report) {
        report = await buildLiveAuditReportFromUrl(url);
      }
    } catch {
      return (
        <ReportEmptyState
          title="The discovery brief could not be prepared"
          description="Use a valid public website URL or open the brief from an existing review."
        />
      );
    }
  } else {
    report = await buildLiveAuditReportById(id);
  }

  if (!report) {
    notFound();
  }

  return (
    <WorkspaceThemeFrame>
      <BriefBuilder report={report} />
    </WorkspaceThemeFrame>
  );
}
