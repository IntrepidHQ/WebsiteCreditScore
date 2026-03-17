import type { ProposalOffer } from "@/lib/types/product";

export type ReportProfileType = "healthcare" | "local-service" | "saas";

export type AuditCategoryKey =
  | "visual-design"
  | "ux-conversion"
  | "mobile-experience"
  | "seo-readiness"
  | "accessibility"
  | "trust-credibility"
  | "security-posture";

export type FindingSection =
  | "what-working"
  | "costing-leads"
  | "technical-seo"
  | "security-posture";

export type FindingType = "positive" | "issue" | "technical" | "security";

export type SeverityLevel = "low" | "medium" | "high";

export type ConfidenceLevel = "detected" | "inferred" | "recommended";

export type ImpactLabel =
  | "Proven Benchmark"
  | "Best Practice"
  | "Detected Issue"
  | "Strategic Recommendation"
  | "High-Leverage Upgrade";

export type BenchmarkType =
  | "heuristic"
  | "benchmark"
  | "platform-observation"
  | "recommendation";

export type ThemeMode = "light" | "dark";
export type PreviewDevice = "desktop" | "mobile";
export type ObservationFactType = "about" | "phone" | "email" | "address";
export type ObservationFactSource =
  | "tel-link"
  | "mailto-link"
  | "schema"
  | "contact-block"
  | "meta-description"
  | "paragraph";
export type ObservationFactConfidence = "verified" | "observed";

export type PricingImpactLevel = "core" | "high" | "transformative";

export interface AuditCategoryScore {
  key: AuditCategoryKey;
  label: string;
  score: number;
  summary: string;
  weight: number;
  details: string[];
}

export interface Evidence {
  id: string;
  label: string;
  detail: string;
  kind: "visual" | "content" | "technical" | "trust" | "heuristic";
}

export interface Benchmark {
  id: string;
  claim: string;
  confidenceLevel: "low" | "medium" | "high";
  sourceLabel: string;
  benchmarkType: BenchmarkType;
  notes: string;
  synergy?: string[];
  impactLabel: ImpactLabel;
}

export interface Finding {
  id: string;
  type: FindingType;
  title: string;
  summary: string;
  severity: SeverityLevel;
  category: AuditCategoryKey;
  section: FindingSection;
  businessImpact: string;
  recommendation: string;
  confidenceLevel: ConfidenceLevel;
  evidence: Evidence[];
  benchmark: Benchmark[];
  screenshots: string[];
  tags: string[];
}

export interface Opportunity {
  id: string;
  title: string;
  summary: string;
  impactLabel: ImpactLabel;
  claim: string;
  confidenceLevel: "low" | "medium" | "high";
  sourceLabel: string;
  benchmarkType: BenchmarkType;
  notes: string;
  synergy: string[];
  currentState: string;
  futureState: string;
  previewImage: string;
}

export interface RebuildPhase {
  id: string;
  title: string;
  summary: string;
  timeline: string;
  deliverables: string[];
  outcome: string;
}

export interface PricingItem {
  id: string;
  title: string;
  description: string;
  price: number;
  defaultSelected: boolean;
  impactLevel: PricingImpactLevel;
  sourceLabel: string;
  synergyWith: string[];
  category: string;
  deliverables: string[];
  benchmarkNote: string;
  estimatedLiftLabel: string;
  estimatedScoreLift: number;
  liftFocus: AuditCategoryKey[];
}

export interface PricingBundle {
  baseItem: PricingItem;
  addOns: PricingItem[];
  recommendedIds: string[];
  stickyNote: string;
}

export interface ThemeSurfaces {
  background: string;
  backgroundAlt: string;
  panel: string;
  elevated: string;
  border: string;
  foreground: string;
  muted: string;
  accent: string;
  accentSoft: string;
  accentForeground: string;
  glow: string;
  success: string;
  warning: string;
  danger: string;
}

export interface ThemeTokens {
  mode: ThemeMode;
  accentColor: string;
  fontScale: number;
  radius: number;
  shadowIntensity: number;
  spacingDensity: number;
  surfaces: ThemeSurfaces;
}

export interface AgencyBranding {
  agencyName: string;
  logoMark: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  headshot: string;
  accentOverride: string;
}

export interface ClientProfile {
  type: ReportProfileType;
  industryLabel: string;
  audience: string;
  primaryGoal: string;
  trustDrivers: string[];
  competitors: string[];
}

export interface ProposalCTA {
  id: string;
  label: string;
  description: string;
  intent: "primary" | "secondary" | "utility";
  href?: string;
}

export interface OutreachEmailTemplate {
  subject: string;
  previewLine: string;
  body: string;
}

export interface QuestionnaireResponseSet {
  primaryGoal: string;
  primaryAction: string;
  brandKeywords: string;
  mustHavePages: string;
  mustHaveFeatures: string;
  contentReadiness: string;
  launchTiming: string;
  successMetric: string;
  internalNotes: string;
}

export interface CreativeBrief {
  summary: string;
  goals: string[];
  audience: string[];
  designDirection: string[];
  scopePriorities: string[];
  contentNeeds: string[];
  successMeasures: string[];
}

export interface WireframeHandoff {
  projectStage: "discovery" | "approved-for-wireframes";
  screens: string[];
  structure: string[];
  experiencePriorities: string[];
  approvalNote: string;
}

export interface CompetitorSnapshot {
  id: string;
  name: string;
  relationship: "your-site" | "reference";
  url: string;
  previewImage: string;
  note: string;
  overallScore: number;
  metrics: Array<{
    id: string;
    label: string;
    value: number;
    format: "score" | "percent";
  }>;
}

export interface BenchmarkReference {
  id: string;
  name: string;
  url: string;
  sourceLabel: string;
  note: string;
  previewImage: string;
  targetScore: number;
  measuredScore?: number;
  measuredCategoryScores?: AuditCategoryScore[];
  scoreSource?: "measured" | "reference";
  strengths: AuditCategoryKey[];
  whatWorks: string[];
  bestFor: string;
}

export interface ObservationFact {
  id: string;
  type: ObservationFactType;
  label: string;
  value: string;
  source: ObservationFactSource;
  confidence: ObservationFactConfidence;
}

export interface SiteObservation {
  fetchedAt: string;
  finalUrl: string;
  pageTitle: string;
  metaDescription: string;
  heroHeading: string;
  aboutSnippet: string;
  verifiedFacts: ObservationFact[];
  primaryCtas: string[];
  trustSignals: string[];
  seoSignals: string[];
  securitySignals: string[];
  technicalSignals: string[];
  notableDetails: string[];
  templateSignals: string[];
  screenshotUrl: string;
  ogImage?: string;
  formCount: number;
  internalLinkCount: number;
  headingCount: number;
  hasViewport: boolean;
  hasCanonical: boolean;
  hasSchema: boolean;
  hasLang: boolean;
  missingAltRatio: number;
  fetchSucceeded: boolean;
}

export interface RoiScenarioDefaults {
  monthlyLeadGain: number;
  leadToClientRate: number;
  averageClientValue: number;
}

export interface AuditPreviewAsset {
  desktop: string;
  mobile: string;
}

export interface AuditPreviewSet {
  current: AuditPreviewAsset;
  future: AuditPreviewAsset;
  fallbackCurrent: AuditPreviewAsset;
  fallbackFuture: AuditPreviewAsset;
  mobileLabel: string;
  desktopLabel: string;
}

export interface AuditReport {
  id: string;
  title: string;
  url: string;
  normalizedUrl: string;
  executiveSummary: string;
  overallScore: number;
  categoryScores: AuditCategoryScore[];
  findings: Finding[];
  opportunities: Opportunity[];
  rebuildPhases: RebuildPhase[];
  pricingBundle: PricingBundle;
  clientProfile: ClientProfile;
  proposalCtas: ProposalCTA[];
  competitorSnapshots: CompetitorSnapshot[];
  benchmarkReferences: BenchmarkReference[];
  objectionHandling: string[];
  roiDefaults: RoiScenarioDefaults;
  previewSet: AuditPreviewSet;
  siteObservation: SiteObservation;
  outreachEmail: OutreachEmailTemplate;
  proposalOffer?: ProposalOffer | null;
  socialProof: Array<{
    id: string;
    name: string;
    role: string;
    quote: string;
  }>;
}

export interface SampleAuditCard {
  id: string;
  title: string;
  url: string;
  previewUrl?: string;
  profile: ReportProfileType;
  summary: string;
  previewImage: string;
  fallbackPreviewImage?: string;
  score?: number;
  executiveSummary?: string;
  highlights?: string[];
  scoreOverrides?: Partial<Record<AuditCategoryKey, number>>;
}
