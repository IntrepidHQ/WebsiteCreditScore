import { notFound } from "next/navigation";

import { WorkspaceThemeFrame } from "@/components/common/workspace-theme-frame";
import { AuditReportContent } from "@/features/audit/components/audit-report-content";
import { ReportEmptyState } from "@/features/audit/components/report-empty-state";
import {
  buildLiveAuditReportById,
  buildLiveAuditReportFromUrl,
} from "@/lib/mock/report-builder";

export default async function AuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string }>;
}) {
  const { id } = await params;
  const { url } = await searchParams;

  let report = null;

  if (url) {
    try {
      report = await buildLiveAuditReportFromUrl(url);
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

  return (
    <WorkspaceThemeFrame>
      <AuditReportContent report={report} />
    </WorkspaceThemeFrame>
  );
}
