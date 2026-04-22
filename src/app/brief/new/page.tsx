import type { Metadata } from "next";

import { WorkspaceThemeFrame } from "@/components/common/workspace-theme-frame";
import { BriefBuilder } from "@/features/brief/components/brief-builder";
import type { AuditReport } from "@/lib/types/audit";

const EMPTY_PREVIEW_ASSET = { desktop: "", mobile: "" };

// Minimal stub report for standalone mode (no URL / audit required)
const stubReport: AuditReport = {
  id: "standalone-brief",
  title: "Your Website",
  url: "",
  normalizedUrl: "",
  executiveSummary: "",
  overallScore: 0,
  categoryScores: [],
  findings: [],
  opportunities: [],
  rebuildPhases: [],
  pricingBundle: {
    baseItem: {
      id: "stub-base",
      title: "",
      description: "",
      price: 0,
      defaultSelected: true,
      impactLevel: "core",
      sourceLabel: "",
      synergyWith: [],
      category: "",
      deliverables: [],
      benchmarkNote: "",
      estimatedLiftLabel: "",
      estimatedScoreLift: 0,
      liftFocus: [],
    },
    addOns: [],
    recommendedIds: [],
    stickyNote: "",
  },
  clientProfile: {
    type: "saas",
    industryLabel: "Business",
    audience: "Business decision-makers",
    observedPositioning: "",
    observedAudienceInference: "",
    primaryGoal: "Generate qualified leads",
    trustDrivers: ["expertise", "social proof", "clear pricing"],
    competitors: [],
  },
  proposalCtas: [],
  competitorSnapshots: [],
  benchmarkReferences: [],
  benchmarkScanIds: [],
  objectionHandling: [],
  roiDefaults: {
    monthlyLeadGain: 0,
    leadToClientRate: 0,
    averageClientValue: 0,
  },
  previewSet: {
    current: EMPTY_PREVIEW_ASSET,
    future: EMPTY_PREVIEW_ASSET,
    fallbackCurrent: EMPTY_PREVIEW_ASSET,
    fallbackFuture: EMPTY_PREVIEW_ASSET,
    mobileLabel: "",
    desktopLabel: "",
  },
  siteObservation: {
    fetchedAt: "",
    finalUrl: "",
    pageTitle: "",
    metaDescription: "",
    heroHeading: "",
    aboutSnippet: "",
    verifiedFacts: [],
    primaryCtas: [],
    trustSignals: [],
    seoSignals: [],
    securitySignals: [],
    technicalSignals: [],
    motionSignals: [],
    notableDetails: [],
    templateSignals: [],
    screenshotUrl: "",
    formCount: 0,
    internalLinkCount: 0,
    headingCount: 0,
    hasViewport: false,
    hasCanonical: false,
    hasSchema: false,
    hasLang: false,
    missingAltRatio: 0,
    fetchSucceeded: false,
  },
  outreachEmail: {
    subject: "",
    previewLine: "",
    body: "",
  },
  proposalOffer: null,
  researchTrace: {
    steps: [],
    extractedElements: { ctaLabels: [], trustSignals: [] },
    missingSignals: [],
    analysisMode: "fallback-estimated",
  },
  socialProof: [],
  provenance: {
    mode: "fallback-estimated",
    confidenceLabel: "low",
    note: "Standalone brief — no audit performed.",
  },
};

export const metadata: Metadata = {
  title: "AI Website Prompt Builder | WebsiteCreditScore",
  description:
    "Answer 4 sections about your business. Get a structured prompt to scaffold a full website redesign with AI.",
};

export default function BriefNewPage() {
  return (
    <WorkspaceThemeFrame>
      <BriefBuilder report={stubReport} />
    </WorkspaceThemeFrame>
  );
}
