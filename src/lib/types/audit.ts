import type { ProposalOffer } from "@/lib/types/product";

export type ReportProfileType = "healthcare" | "local-service" | "saas";

export type SiteNiche =
  | "restaurant-qsr"
  | "retail-ecommerce"
  | "legal"
  | "real-estate"
  | "fitness"
  | "beauty-salon"
  | "dental"
  | "construction"
  | "home-services"
  | "healthcare-general"
  | "saas-software"
  | "local-service-generic"
  | "generic";

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

/** How background/panel hues relate to the accent for more varied palettes. */
export type ThemeColorHarmony =
  | "monochromatic"
  | "complementary"
  | "analogous"
  | "split-complementary"
  | "triadic"
  | "tetradic"
  | "square";

/** Optional glass treatment for dense settings / preview surfaces (see `data-surface-finish`). */
export type ThemeSurfaceFinish = "solid" | "glassmorphic";

/** Marketing / hero lattice background (Settings + landing backdrop). */
export type HeroGridPattern =
  | "signal"
  | "squares"
  | "triangles"
  | "hex"
  | "web"
  | "quantum";

export type PreviewDevice = "desktop" | "mobile";
export type ReportProvenance = "live-observed" | "fallback-estimated" | "sample-based";
export type BenchmarkVertical =
  | "service-providers"
  | "private-healthcare"
  | "product-saas"
  | "fintech";
export type BenchmarkTier = "flagship" | "reference" | "specialist";
export type BenchmarkFocusArea = "woodworking";
export type DesignElementKey =
  | "line"
  | "shape"
  | "form"
  | "space"
  | "value"
  | "color"
  | "texture";
export type DesignPrincipleKey =
  | "balance"
  | "contrast"
  | "emphasis"
  | "movement"
  | "pattern"
  | "rhythm"
  | "unity"
  | "variety"
  | "hierarchy"
  | "alignment"
  | "proximity"
  | "proportion";
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

/** Legacy preset pairing — migrated in `createThemeTokens` when `fontDisplay` / `fontBody` are absent. */
export type ThemeFontProfile = "instrument" | "precision" | "terminal";

/** Loaded via Next font CSS variables where available; system stacks need no loader. */
export type ThemeFontStackId =
  | "instrument-serif"
  | "space-grotesk"
  | "manrope"
  | "inter"
  | "playfair-display"
  | "dm-sans"
  | "jetbrains-mono"
  | "system-serif"
  | "system-sans";

export interface ThemeTokens {
  mode: ThemeMode;
  accentColor: string;
  /** Surface tint strategy relative to the accent hue. */
  colorHarmony: ThemeColorHarmony;
  /** Glass highlight on supported panels (Settings / previews). */
  surfaceFinish: ThemeSurfaceFinish;
  /** Degrees to rotate the accent hue before surfaces are rebuilt (−24…24). */
  accentHueShift: number;
  /** Headlines / `.font-display` — Instrument Serif, Space Grotesk, etc. */
  fontDisplay: ThemeFontStackId;
  /** Body and UI sans — Manrope, Space Grotesk, or system stacks. */
  fontBody: ThemeFontStackId;
  /** Multipliers for semantic `h1`–`h6` (pairs with global base heading sizes). */
  headingScaleH1: number;
  headingScaleH2: number;
  headingScaleH3: number;
  headingScaleH4: number;
  headingScaleH5: number;
  headingScaleH6: number;
  fontScale: number;
  lineHeightScale: number;
  glowIntensity: number;
  radius: number;
  shadowIntensity: number;
  /** Extra box-shadow spread (px) layered with shadow intensity. */
  shadowSpread: number;
  spacingDensity: number;
  /** Landing hero / marketing lattice style. */
  heroGridPattern: HeroGridPattern;
  /** Opacity of glass panel fills (0–1); only affects glassmorphic studio surfaces. */
  glassFillOpacity: number;
  surfaces: ThemeSurfaces;
}

export interface ThemePreset {
  id: string;
  name: string;
  mode: ThemeMode;
  accentFamily: string;
  mood: string;
  recommendedUseCase: string;
  tokens: ThemeTokens;
}

export interface AgencyBranding {
  agencyName: string;
  logoMark: string;
  logoColor: string;
  logoScale: number;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  contactPhone: string;
  headshot: string;
  accentOverride: string;
}

export interface ClientProfile {
  type: ReportProfileType;
  niche?: SiteNiche;
  /**
   * Stable tags for indexing / matching (e.g. `profile:saas`, `niche:saas-software`, `ai:b2b-saas`).
   * Populated from profile + niche heuristics and optionally enriched after AI analysis.
   */
  industryTags?: string[];
  industryLabel: string;
  audience: string;
  /** What the live site signals about the business (headlines, meta, copy). */
  observedPositioning: string;
  /** Inferred target visitors from CTAs, proof, and on-page language. */
  observedAudienceInference: string;
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

export interface BenchmarkCriterion {
  id: string;
  category: AuditCategoryKey;
  title: string;
  description: string;
  whyItMatters: string;
  signals: string[];
}

export interface BenchmarkRubric {
  id: string;
  vertical: BenchmarkVertical;
  title: string;
  summary: string;
  fastLifts: string[];
  criteria: BenchmarkCriterion[];
}

export interface DesignPatternNote {
  id: string;
  title: string;
  source: string;
  category:
    | "typography"
    | "grid"
    | "workflow"
    | "iconography"
    | "color"
    | "prompts";
  summary: string;
  takeaways: string[];
  applicability: string;
}

export interface BenchmarkSite {
  id: string;
  vertical: BenchmarkVertical;
  focusArea?: BenchmarkFocusArea;
  tier: BenchmarkTier;
  name: string;
  url: string;
  sourceLabel: string;
  note: string;
  desktopPreviewImage: string;
  mobilePreviewImage: string;
  strengths: AuditCategoryKey[];
  whatWorks: string[];
  bestFor: string;
  reusablePatterns: string[];
  curatedWeight: number;
}

export interface DesignDimensionScore<Key extends string = string> {
  key: Key;
  label: string;
  description: string;
  score: number;
}

export interface BenchmarkScan {
  id: string;
  siteId: string;
  vertical: BenchmarkVertical;
  overallScore: number;
  designScore: number;
  animationScore: number;
  designElementScores: DesignDimensionScore<DesignElementKey>[];
  designPrincipleScores: DesignDimensionScore<DesignPrincipleKey>[];
  categoryScores: AuditCategoryScore[];
  scannedAt: string;
  previewImages: AuditPreviewAsset;
  note: string;
  tier: BenchmarkTier;
  scoreSource: "measured" | "reference";
}

export interface BenchmarkReference {
  id: string;
  siteId: string;
  vertical: BenchmarkVertical;
  focusArea?: BenchmarkFocusArea;
  tier: BenchmarkTier;
  name: string;
  url: string;
  sourceLabel: string;
  note: string;
  previewImage: string;
  mobilePreviewImage: string;
  targetScore: number;
  measuredScore?: number;
  measuredAnimationScore?: number;
  measuredCategoryScores?: AuditCategoryScore[];
  benchmarkScanId?: string;
  scoreSource?: "measured" | "reference";
  strengths: AuditCategoryKey[];
  whatWorks: string[];
  bestFor: string;
  reusablePatterns: string[];
}

export interface ObservationFact {
  id: string;
  type: ObservationFactType;
  label: string;
  value: string;
  source: ObservationFactSource;
  confidence: ObservationFactConfidence;
}

export type FetchErrorReason =
  | "timeout"
  | "dns"
  | "http-error"
  | "blocked"
  | "ssl"
  | "unknown";

export type ContentClassification =
  | "normal"
  | "parked-domain"
  | "redirect-to-unrelated"
  | "search-engine-redirect"
  | "error-page"
  | "under-construction"
  | "empty-page";

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
  motionSignals: string[];
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
  fetchError?: FetchErrorReason;
  httpStatus?: number;
  contentClassification?: ContentClassification;
  redirectTarget?: string;
  strippedTextLength?: number;
  /** PageSpeed / Lighthouse performance metrics (mobile strategy). Optional — populated
   *  only when GOOGLE_PAGESPEED_API_KEY is set and the PSI call succeeds. */
  performanceScore?: number;
  /** Largest Contentful Paint in milliseconds */
  lcp?: number;
  /** Cumulative Layout Shift score (0–1) */
  cls?: number;
  /** First Contentful Paint in milliseconds */
  fcp?: number;
  /** Total Blocking Time in milliseconds */
  tbt?: number;
  /** Speed Index in milliseconds */
  speedIndex?: number;
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
  benchmarkScanIds: string[];
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
  provenance: {
    mode: ReportProvenance;
    confidenceLabel: "high" | "medium" | "low";
    note: string;
    /** Executive summary and outreach copy from Claude when set. */
    narrativeSource?: "claude" | "heuristic";
    /** How the benchmark / competitor reference sites were chosen. */
    benchmarkSelectionSource?: "heuristic" | "claude-rerank" | "niche";
  };
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
  scannedAt?: string;
  executiveSummary?: string;
  highlights?: string[];
  scoreOverrides?: Partial<Record<AuditCategoryKey, number>>;
}
