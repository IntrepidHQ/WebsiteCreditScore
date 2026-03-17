import { AuditReportSections } from "@/features/audit/components/audit-report-sections";
import type { AuditReport } from "@/lib/types/audit";

export function AuditReportContent({ report }: { report: AuditReport }) {
  return (
    <main id="main-content">
      <AuditReportSections report={report} />
    </main>
  );
}
