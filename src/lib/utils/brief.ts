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
    // Step 1: Business
    businessDescription: "A [type] business that helps [audience] achieve [outcome].",
    targetAudience: "Decision-makers researching options before committing to a provider.",
    painPoints: "Customers struggle to find trustworthy, clearly-priced solutions with transparent processes.",
    uniqueValue: "We deliver [outcome] faster and with more hands-on support than typical alternatives.",
    // Step 2: Competition & positioning
    competitors: "",
    differentiators: "",
    // Step 3: Brand & tone
    tone:
      report.clientProfile.type === "saas"
        ? "confident, modern, clear"
        : report.clientProfile.type === "healthcare"
          ? "warm, expert, reassuring"
          : "professional, dependable, approachable",
    colorPreference: "",
    existingAssets: "Logo available. Some photography. No existing copy blocks.",
    testimonials: "",
    // Step 4: Scope & timeline
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
    launchTiming: "6–8 weeks from project kickoff.",
    successMetric: "Higher-quality leads and a clearer conversion path.",
    internalNotes: "",
    // Legacy fields
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

export function generateWebsitePrompt(
  report: AuditReport,
  questionnaire: QuestionnaireResponseSet,
): string {
  const topIssues = report.findings
    .filter((f) => f.severity === "high")
    .slice(0, 3)
    .map((f) => `• ${f.title}`)
    .join("\n");

  return `You are a senior web designer and conversion strategist. Build a complete website redesign plan for the following business.

━━━ BUSINESS OVERVIEW ━━━
${questionnaire.businessDescription || "[Describe the business in 2 sentences]"}

━━━ TARGET AUDIENCE ━━━
${questionnaire.targetAudience}

━━━ PROBLEMS THEY SOLVE ━━━
${questionnaire.painPoints}

━━━ UNIQUE VALUE ━━━
${questionnaire.uniqueValue}

━━━ COMPETITIVE LANDSCAPE ━━━
Competitors: ${questionnaire.competitors || "Not specified"}
Key differentiators: ${questionnaire.differentiators || "Not specified"}

━━━ BRAND & TONE ━━━
Voice/Tone: ${questionnaire.tone}
Color direction: ${questionnaire.colorPreference || "Match existing brand or derive from positioning"}
Existing assets: ${questionnaire.existingAssets}

━━━ SOCIAL PROOF ━━━
${questionnaire.testimonials || "Testimonials and case studies to be gathered during discovery"}

━━━ SCOPE ━━━
Required pages: ${questionnaire.mustHavePages}
Required features: ${questionnaire.mustHaveFeatures}
Content readiness: ${questionnaire.contentReadiness}

━━━ TIMELINE & SUCCESS ━━━
Launch target: ${questionnaire.launchTiming}
Success metric: ${questionnaire.successMetric}

━━━ SITE AUDIT CONTEXT ━━━
Current score: ${report.overallScore.toFixed(1)}/10
Top issues to resolve:
${topIssues || "• No critical issues flagged"}

━━━ ADDITIONAL NOTES ━━━
${questionnaire.internalNotes || "None"}

━━━ YOUR DELIVERABLE ━━━
Produce:
1. A recommended site architecture (pages, hierarchy, navigation)
2. A wireframe outline for the homepage (above-the-fold, sections, CTA placement)
3. A copywriting brief for each major page (headline direction, body focus, CTA copy)
4. Three design direction options (minimal/bold/editorial) with rationale
5. A prioritized implementation checklist

Be specific, conversion-focused, and grounded in the audit findings above.`.trim();
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
