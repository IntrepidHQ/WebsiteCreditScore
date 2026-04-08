import { AuditReportSections } from "@/features/audit/components/audit-report-sections";
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
      <AuditReportSections isAuthenticated={isAuthenticated} report={report} />
    </main>
  );
}
