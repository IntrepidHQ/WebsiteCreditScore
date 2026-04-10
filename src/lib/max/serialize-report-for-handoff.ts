import type { AuditReport } from "@/lib/types/audit";

/**
 * Compact JSON for Claude MAX handoff — avoids dumping full HTML-sized fields.
 */
export const serializeAuditForMaxHandoff = (report: AuditReport, assetUrls: string[]) => {
  const obs = report.siteObservation;

  return {
    site: {
      title: report.title,
      url: report.normalizedUrl,
    },
    overallScore: report.overallScore,
    executiveSummary: report.executiveSummary,
    categoryScores: report.categoryScores.map((c) => ({
      key: c.key,
      label: c.label,
      score: c.score,
      weight: c.weight,
      summary: c.summary,
      details: c.details.slice(0, 4),
    })),
    clientProfile: {
      type: report.clientProfile.type,
      industryLabel: report.clientProfile.industryLabel,
      audience: report.clientProfile.audience,
      observedPositioning: report.clientProfile.observedPositioning,
      primaryGoal: report.clientProfile.primaryGoal,
      trustDrivers: report.clientProfile.trustDrivers.slice(0, 8),
    },
    findings: report.findings.slice(0, 28).map((f) => ({
      title: f.title,
      severity: f.severity,
      category: f.category,
      summary: f.summary,
      recommendation: f.recommendation,
      businessImpact: f.businessImpact,
    })),
    opportunities: report.opportunities.slice(0, 14).map((o) => ({
      title: o.title,
      summary: o.summary,
      currentState: o.currentState,
      futureState: o.futureState,
      claim: o.claim,
    })),
    rebuildPhases: report.rebuildPhases.map((p) => ({
      title: p.title,
      summary: p.summary,
      timeline: p.timeline,
      deliverables: p.deliverables,
      outcome: p.outcome,
    })),
    pricing: {
      stickyNote: report.pricingBundle.stickyNote,
      base: {
        title: report.pricingBundle.baseItem.title,
        description: report.pricingBundle.baseItem.description,
        deliverables: report.pricingBundle.baseItem.deliverables,
        estimatedScoreLift: report.pricingBundle.baseItem.estimatedScoreLift,
        estimatedLiftLabel: report.pricingBundle.baseItem.estimatedLiftLabel,
        liftFocus: report.pricingBundle.baseItem.liftFocus,
      },
      addOns: report.pricingBundle.addOns.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description,
        defaultSelected: a.defaultSelected,
        estimatedScoreLift: a.estimatedScoreLift,
        estimatedLiftLabel: a.estimatedLiftLabel,
        liftFocus: a.liftFocus,
        deliverables: a.deliverables,
        benchmarkNote: a.benchmarkNote,
      })),
      recommendedIds: report.pricingBundle.recommendedIds,
    },
    benchmarkReferences: report.benchmarkReferences.slice(0, 6).map((b) => ({
      name: b.name,
      url: b.url,
      note: b.note,
      strengths: b.strengths,
      whatWorks: b.whatWorks?.slice?.(0, 4) ?? [],
    })),
    performance: obs
      ? {
          fetchSucceeded: obs.fetchSucceeded,
          performanceScore: obs.performanceScore,
          lcp: obs.lcp,
          cls: obs.cls,
          fcp: obs.fcp,
          tbt: obs.tbt,
          speedIndex: obs.speedIndex,
        }
      : null,
    dataroomImageUrls: assetUrls,
  };
};
