import type { AgentChatReportContext } from "@/features/app/components/agent-chat-panel";
import type { SavedReport } from "@/lib/types/product";

export const buildAgentChatReportContext = (saved?: SavedReport | null): AgentChatReportContext | null => {
  if (!saved?.reportSnapshot) {
    return null;
  }
  const report = saved.reportSnapshot;
  return {
    title: saved.title,
    normalizedUrl: saved.normalizedUrl,
    overallScore: report.overallScore,
    executiveSummary: report.executiveSummary,
    categoryScores: report.categoryScores.map((c) => ({
      key: c.key,
      label: c.label,
      score: c.score,
    })),
    findings: report.findings.slice(0, 14).map((f) => ({
      title: f.title,
      severity: f.severity,
    })),
  };
};
