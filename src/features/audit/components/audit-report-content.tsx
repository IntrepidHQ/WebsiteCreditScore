import { Suspense } from "react";

import { AuditReportSections } from "@/features/audit/components/audit-report-sections";
import { AuditSaveLeadsPanel } from "@/features/audit/components/audit-save-leads-panel";
import type { AuditReport } from "@/lib/types/audit";

export function AuditReportContent({
  report,
  isAuthenticated = false,
}: {
  report: AuditReport;
  isAuthenticated?: boolean;
}) {
  return (
    <main id="main-content">
      <Suspense fallback={null}>
        <AuditSaveLeadsPanel isAuthenticated={isAuthenticated} normalizedUrl={report.normalizedUrl} />
      </Suspense>
      <AuditReportSections isAuthenticated={isAuthenticated} report={report} />
    </main>
  );
}
