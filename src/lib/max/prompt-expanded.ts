import type { AuditReport } from "@/lib/types/audit";

import { buildMaxPrompt } from "@/lib/max/prompt";

function bulletBlock(title: string, lines: string[]) {
  if (!lines.length) {
    return "";
  }
  return [`## ${title}`, ...lines.map((l) => `- ${l}`), ""].join("\n");
}

/**
 * Rich template handoff when Claude is unavailable — still maps to categories, pricing, and phases.
 */
export function buildMaxPromptExpanded(report: AuditReport | null, opts?: { assetUrls?: string[] }) {
  if (!report) {
    return buildMaxPrompt(null);
  }

  const assets = opts?.assetUrls?.filter(Boolean) ?? [];
  const assetSection =
    assets.length > 0
      ? [
          "## Client assets (Dataroom)",
          "Use these URLs as the source of truth for photography, logos, or UI chrome in the build:",
          ...assets.map((u) => `- ${u}`),
          "",
        ].join("\n")
      : "";

  const categories = report.categoryScores.map(
    (c) =>
      `${c.label} (${c.key}): ${c.score.toFixed(1)}/10 — ${c.summary}`,
  );

  const findings = report.findings
    .filter((f) => f.severity === "high" || f.severity === "medium")
    .slice(0, 12)
    .map((f) => `[${f.severity}] ${f.title}: ${f.recommendation}`);

  const pricingLines = [
    `Base scope: ${report.pricingBundle.baseItem.title} — ${report.pricingBundle.baseItem.description}`,
    `Estimated score lift (base): ${report.pricingBundle.baseItem.estimatedLiftLabel} (${report.pricingBundle.baseItem.estimatedScoreLift}+ pts signal).`,
    ...report.pricingBundle.addOns
      .filter((a) => a.defaultSelected || report.pricingBundle.recommendedIds.includes(a.id))
      .slice(0, 8)
      .map(
        (a) =>
          `Add-on: ${a.title} — deliverables: ${a.deliverables.slice(0, 3).join("; ")}${a.deliverables.length > 3 ? "…" : ""} (lift focus: ${a.liftFocus.join(", ")}).`,
      ),
    report.pricingBundle.stickyNote ? `Note: ${report.pricingBundle.stickyNote}` : "",
  ].filter(Boolean);

  const phases = report.rebuildPhases.map(
    (p) => `${p.title} (${p.timeline}): ${p.summary} — Deliver: ${p.deliverables.join("; ")}`,
  );

  const benchmarks = report.benchmarkReferences
    .slice(0, 5)
    .map((b) => `${b.name} (${b.url}): ${b.note}`);

  const opportunities = report.opportunities
    .slice(0, 8)
    .map((o) => `${o.title}: ${o.futureState}`);

  const perf = report.siteObservation;
  const perfLine =
    perf?.performanceScore != null
      ? `Performance (mobile PSI layer): score ${perf.performanceScore}${perf.lcp != null ? `, LCP ${Math.round(perf.lcp)}ms` : ""}.`
      : "";

  return [
    buildMaxPrompt(report),
    "",
    "---",
    "",
    "## Deep handoff (template)",
    "",
    assetSection,
    bulletBlock("Scores by pillar (address each in the build)", categories),
    bulletBlock("Issues to fix (priority)", findings),
    bulletBlock("Opportunity targets", opportunities),
    bulletBlock("Delivery phases (mirror in your task breakdown)", phases),
    bulletBlock("Pricing-aligned scope (what the client paid for / expects)", pricingLines),
    bulletBlock("Benchmark patterns to borrow", benchmarks),
    perfLine ? `## Performance\n- ${perfLine}\n` : "",
    "## Acceptance criteria",
    "- Ship a credible V1 that improves hierarchy, proof, and primary conversion path.",
    "- Explicitly close the highest-severity findings above (or document intentional tradeoffs).",
    "- Respect reduced motion; keep interaction latency low.",
    "- Use dataroom URLs when provided; do not invent fake brands or stock unless necessary.",
    "",
  ]
    .filter(Boolean)
    .join("\n");
}
