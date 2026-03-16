import { notFound } from "next/navigation";

import { ReportEmptyState } from "@/features/audit/components/report-empty-state";
import { BriefBuilder } from "@/features/brief/components/brief-builder";
import {
  buildLiveAuditReportById,
  buildLiveAuditReportFromUrl,
} from "@/lib/mock/report-builder";

export default async function BriefPage({
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
          title="The discovery brief could not be prepared"
          description="Use a valid public website URL or open the brief from an existing audit workspace."
        />
      );
    }
  } else {
    report = await buildLiveAuditReportById(id);
  }

  if (!report) {
    notFound();
  }

  return <BriefBuilder report={report} />;
}
