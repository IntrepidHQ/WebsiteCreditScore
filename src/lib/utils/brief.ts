import type {
  AuditReport,
  CreativeBrief,
  QuestionnaireResponseSet,
  WireframeHandoff,
} from "@/lib/types/audit";

export function createDefaultQuestionnaire(
  report: AuditReport,
): QuestionnaireResponseSet {
  return {
    primaryGoal: report.clientProfile.primaryGoal,
    primaryAction:
      report.clientProfile.type === "saas"
        ? "Book a qualified demo"
        : report.clientProfile.type === "healthcare"
          ? "Request or book an appointment"
          : "Request an estimate",
    brandKeywords:
      report.clientProfile.type === "saas"
        ? "confident, clear, modern, proven"
        : report.clientProfile.type === "healthcare"
          ? "calm, expert, welcoming, trustworthy"
          : "premium, dependable, local, responsive",
    mustHavePages:
      report.clientProfile.type === "saas"
        ? "Homepage, solutions, pricing, demo flow, proof library"
        : report.clientProfile.type === "healthcare"
          ? "Homepage, services, provider bios, locations, patient resources"
          : "Homepage, services, service areas, about, financing, contact",
    mustHaveFeatures:
      report.clientProfile.type === "saas"
        ? "Demo scheduling, proof modules, comparison content"
        : report.clientProfile.type === "healthcare"
          ? "Booking flow, insurance clarity, FAQ, trust modules"
          : "Estimate funnel, service area proof, review modules",
    contentReadiness: "Partial. We have some content, but key pages need rewriting.",
    launchTiming: "Within the next 6 to 8 weeks.",
    successMetric: "Higher-quality leads and a clearer conversion path.",
    internalNotes: "",
  };
}

export function generateCreativeBrief(
  report: AuditReport,
  questionnaire: QuestionnaireResponseSet,
): CreativeBrief {
  const priorityFindings = report.findings
    .filter((finding) => finding.severity === "high")
    .slice(0, 3)
    .map((finding) => finding.title);

  return {
    summary: `${report.title} needs a cleaner, more persuasive web experience that supports ${questionnaire.primaryGoal.toLowerCase()} while making ${questionnaire.primaryAction.toLowerCase()} feel obvious and lower-risk.`,
    goals: [
      questionnaire.primaryGoal,
      `Support ${questionnaire.primaryAction.toLowerCase()} without extra friction.`,
      `Resolve the top issues flagged in the audit: ${priorityFindings.join(", ")}.`,
    ],
    audience: [
      report.clientProfile.audience,
      `Decision needs: ${report.clientProfile.trustDrivers.join(", ")}.`,
    ],
    designDirection: [
      `Brand direction: ${questionnaire.brandKeywords}.`,
      "Use clearer hierarchy, stronger first-screen messaging, and more visible trust assets.",
      "Keep the interface premium, readable, and conversion-led on mobile.",
    ],
    scopePriorities: [
      questionnaire.mustHavePages,
      questionnaire.mustHaveFeatures,
      "Preserve what is already working while tightening the lead path.",
    ],
    contentNeeds: [
      questionnaire.contentReadiness,
      "Rewrite core headlines, proof blocks, and CTA language around the agreed positioning.",
      "Identify missing trust content such as process, reviews, team proof, and FAQs.",
    ],
    successMeasures: [
      questionnaire.successMetric,
      "Stronger first-screen clarity and improved CTA follow-through.",
      "Cleaner handoff into launch analytics and post-launch testing.",
    ],
  };
}

export function generateWireframeHandoff(
  report: AuditReport,
  brief: CreativeBrief,
  approved: boolean,
): WireframeHandoff {
  return {
    projectStage: approved ? "approved-for-wireframes" : "discovery",
    screens: [
      "Homepage hero and proof sequence",
      "Primary conversion flow",
      "Core service / solutions page",
      "About / trust page",
      "Contact or booking path",
    ],
    structure: [
      `Prioritize pages: ${brief.scopePriorities[0]}.`,
      "Clarify information hierarchy before adding visual complexity.",
      `Ensure the layout supports ${report.clientProfile.primaryGoal.toLowerCase()}.`,
    ],
    experiencePriorities: [
      ...brief.designDirection.slice(0, 2),
      "Treat mobile flow, trust reinforcement, and CTA placement as wireframe-level decisions.",
    ],
    approvalNote: approved
      ? "Creative brief approved. UI/UX wireframe work can begin."
      : "Waiting for approval on goals, scope, and design direction before wireframing.",
  };
}
