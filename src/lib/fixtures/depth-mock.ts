import fixture from "@/lib/fixtures/wcs-mock.json";
import type { WCSReport } from "@/lib/schema";
import type { ScanDepthKey } from "@/lib/scan-depth";
import { SCAN_DEPTH_PROFILES } from "@/lib/scan-depth";

const DEPTH_ORDER: ScanDepthKey[] = ["aerial", "surface", "deep", "trench", "mantle", "core"];

const EXTRA_SOURCES = [
  { url: "https://www.apple.com/newsroom/", title: "Apple Newsroom", domain: "apple.com" },
  { url: "https://support.apple.com/", title: "Apple Support", domain: "apple.com" },
  { url: "https://www.apple.com/compliance/", title: "Apple Compliance", domain: "apple.com" },
  { url: "https://www.apple.com/environment/", title: "Apple Environment", domain: "apple.com" },
  { url: "https://www.apple.com/legal/internet-services/terms/site.html", title: "Apple Website Terms", domain: "apple.com" },
  { url: "https://developer.apple.com/security/", title: "Apple Platform Security", domain: "developer.apple.com" },
  { url: "https://www.sec.gov/edgar/browse/?CIK=320193", title: "Apple SEC Filings", domain: "sec.gov" },
  { url: "https://www.ftc.gov/news-events/topics/competition-guidance/mergers-competition", title: "FTC Competition Guidance", domain: "ftc.gov" },
  { url: "https://www.apple.com/supplier-responsibility/", title: "Apple Supplier Responsibility", domain: "apple.com" },
  { url: "https://www.apple.com/privacy/", title: "Apple Privacy", domain: "apple.com" },
  { url: "https://www.apple.com/accessibility/", title: "Apple Accessibility", domain: "apple.com" },
  { url: "https://www.apple.com/business/", title: "Apple Business", domain: "apple.com" },
  { url: "https://www.apple.com/education/", title: "Apple Education", domain: "apple.com" },
  { url: "https://www.apple.com/legal/sales-support/sales-policies/retail_us.html", title: "Apple Sales Policies", domain: "apple.com" },
  { url: "https://www.apple.com/legal/warranty/", title: "Apple Warranty", domain: "apple.com" },
  { url: "https://www.apple.com/legal/privacy/data/en/apple-pay/", title: "Apple Pay Privacy", domain: "apple.com" },
  { url: "https://www.apple.com/jobs/us/", title: "Apple Jobs", domain: "apple.com" },
  { url: "https://www.apple.com/leadership/", title: "Apple Leadership", domain: "apple.com" },
  { url: "https://www.apple.com/investor-relations/", title: "Investor Relations", domain: "apple.com" },
  { url: "https://www.apple.com/legal/", title: "Apple Legal", domain: "apple.com" },
];

const SOURCE_TARGETS: Record<ScanDepthKey, number> = {
  aerial: 15,
  surface: 22,
  deep: 32,
  trench: 55,
  mantle: 85,
  core: 150,
};

function extendSources(report: WCSReport, depth: ScanDepthKey) {
  const target = SOURCE_TARGETS[depth];
  const sources = [...report.sources];
  let index = 0;
  while (sources.length < target) {
    const source = EXTRA_SOURCES[index % EXTRA_SOURCES.length];
    const cycle = Math.floor(index / EXTRA_SOURCES.length) + 1;
    sources.push({
      ...source,
      title: cycle === 1 ? source.title : `${source.title} · corroboration ${cycle}`,
    });
    index++;
  }
  return sources;
}

export function buildDepthMockReport(depth: ScanDepthKey): WCSReport {
  const report = structuredClone(fixture) as WCSReport;
  const profile = SCAN_DEPTH_PROFILES[depth];
  const depthIndex = DEPTH_ORDER.indexOf(depth);
  report.scanned_at = new Date().toISOString();
  report.sources = extendSources(report, depth);

  if (depthIndex >= 1) {
    report.coverage_summary = `${profile.label} reviewed ${profile.searches} search angles and organized ${report.sources.length} cited sources into stronger credibility, reputation, technical, and market-context evidence.`;
    report.source_clusters = [
      { label: "First-party proof", summary: "Investor relations, legal, privacy, retail, support, and leadership pages confirm ownership and operating maturity.", count: Math.round(report.sources.length * 0.34) },
      { label: "Independent validation", summary: "Third-party performance, reputation, regulatory, market-cap, and archive references corroborate the company story.", count: Math.round(report.sources.length * 0.42) },
      { label: "Risk context", summary: "Repair, App Store, antitrust, and policy sources separate regulatory risk from fraud or solvency risk.", count: Math.round(report.sources.length * 0.24) },
    ];
  }

  if (depthIndex >= 2) {
    report.market_context = "Apple operates as the premium reference point for consumer technology websites: the site is not merely credible, it is a category benchmark for product storytelling, checkout trust, support depth, and ecosystem confidence.";
    report.peers = [
      ...(report.peers ?? []),
      { domain: "sony.com", comparison: "Sony has strong product storytelling but less consistent conversion architecture and weaker cross-device purchase clarity." },
      { domain: "dell.com", comparison: "Dell exposes more configuration detail but feels more transactional and less trust-building for mainstream buyers." },
    ];
  }

  if (depthIndex >= 3) {
    report.benchmark_gaps = [
      { dimension: "transparency", current: "Strong public policies but constrained repair ecosystem.", benchmark: "Best-in-class openness includes pricing, refunds, repairability, and third-party access clarity.", gap: "Repair policy remains the main credibility deduction." },
      { dimension: "ux_conversion", current: "Excellent Apple Pay checkout and mobile UX.", benchmark: "Category leaders make every customization path equally simple.", gap: "Complex high-end product configuration still introduces friction." },
      { dimension: "social_presence", current: "Massive verified footprint and executive visibility.", benchmark: "Sustained executive and brand communication across platforms.", gap: "Corporate account cadence is intentionally sparse." },
    ];
  }

  if (depthIndex >= 4) {
    report.risk_matrix = [
      { risk: "Right-to-repair scrutiny", likelihood: "high", impact: "medium", mitigation: "Track repair-policy changes and separate consumer choice risk from fraud risk." },
      { risk: "App Store antitrust pressure", likelihood: "high", impact: "medium", mitigation: "Monitor EU DMA and US DOJ outcomes; impact is regulatory, not operational credibility." },
      { risk: "Premium pricing perception", likelihood: "medium", impact: "low", mitigation: "Benchmark against product quality, retention, support, and ecosystem value." },
    ];
  }

  if (depthIndex >= 5) {
    report.decision_memo = {
      verdict: "Proceed with confidence; Apple is a reference-grade credibility profile with regulatory watch items.",
      buy_side_summary: "For a diligence buyer, Apple.com demonstrates maximum legitimacy, technical health, design discipline, and financial stability. The only serious concerns are regulatory and ecosystem-control issues that affect openness rather than trustworthiness.",
      watch_items: ["EU Digital Markets Act compliance", "US DOJ antitrust case", "Right-to-repair policy expansion", "App Store commission transparency"],
      next_steps: ["Use Apple as an aspirational benchmark for product clarity", "Copy the support-policy visibility pattern", "Avoid copying ecosystem lock-in opacity", "Track legal/regulatory developments separately from credibility score"],
    };
  }

  report.overall.headline = `${profile.label}: ${report.overall.headline}`;
  return report;
}
