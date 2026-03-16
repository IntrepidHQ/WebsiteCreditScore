import { ReportEmptyState } from "@/features/audit/components/report-empty-state";

export default function NotFound() {
  return (
    <ReportEmptyState
      title="Audit not found"
      description="This report link does not map to one of the seeded examples, and no URL was provided to regenerate it."
    />
  );
}
