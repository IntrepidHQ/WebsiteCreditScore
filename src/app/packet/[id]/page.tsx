import { notFound } from "next/navigation";

import { PacketDocument } from "@/features/audit/components/packet-document";
import { ReportEmptyState } from "@/features/audit/components/report-empty-state";
import {
  buildLiveAuditReportById,
  buildLiveAuditReportFromUrl,
} from "@/lib/mock/report-builder";
import { getProductRepository } from "@/lib/product/repository";

export default async function PacketPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string; print?: string; accent?: string; share?: string }>;
}) {
  const { id } = await params;
  const { url, print, accent, share } = await searchParams;

  let report = null;

  if (share) {
    const shared = await getProductRepository().resolvePublicShare("packet", id, share);

    if (shared) {
      report = shared.savedReport.reportSnapshot;
    }
  } else if (url) {
    try {
      report = await buildLiveAuditReportFromUrl(url);
    } catch {
      return (
        <ReportEmptyState
          title="The client packet could not be prepared"
          description="Use a valid public website URL or open the packet from an existing review."
        />
      );
    }
  } else {
    report = await buildLiveAuditReportById(id);
  }

  if (!report) {
    notFound();
  }

  return <PacketDocument accent={accent} autoPrint={print === "1"} report={report} />;
}
