import type {
  AuditCategoryKey,
  AuditCategoryScore,
  DesignDimensionScore,
  DesignElementKey,
  DesignPrincipleKey,
  SiteObservation,
} from "@/lib/types/audit";
import { clampScore } from "@/lib/utils/scores";

function getCategoryScore(
  categoryScores: AuditCategoryScore[],
  key: AuditCategoryKey,
) {
  return categoryScores.find((item) => item.key === key)?.score ?? 5;
}

function createScore<Key extends string>(
  key: Key,
  label: string,
  description: string,
  raw: number,
): DesignDimensionScore<Key> {
  return {
    key,
    label,
    description,
    score: clampScore(raw),
  };
}

export function buildDesignElementScores(
  observation: SiteObservation,
  categoryScores: AuditCategoryScore[],
) {
  const visual = getCategoryScore(categoryScores, "visual-design");
  const ux = getCategoryScore(categoryScores, "ux-conversion");
  const mobile = getCategoryScore(categoryScores, "mobile-experience");
  const accessibility = getCategoryScore(categoryScores, "accessibility");
  const trust = getCategoryScore(categoryScores, "trust-credibility");
  const seo = getCategoryScore(categoryScores, "seo-readiness");
  const motionBonus = observation.motionSignals.length > 0 ? 0.3 : -0.2;

  return [
    createScore<DesignElementKey>(
      "line",
      "Line",
      "How clearly the page uses directional rhythm, hierarchy, and reading flow.",
      visual * 0.6 + seo * 0.2 + motionBonus + (observation.heroHeading ? 1.1 : -0.4),
    ),
    createScore<DesignElementKey>(
      "shape",
      "Shape",
      "How well interface blocks and calls to action feel grouped and intentional.",
      visual * 0.55 + ux * 0.3 + (observation.primaryCtas.length <= 3 ? 0.7 : -0.3),
    ),
    createScore<DesignElementKey>(
      "form",
      "Form",
      "How much depth, structure, and visual layering the composition creates without clutter.",
      visual * 0.55 +
        trust * 0.25 +
        mobile * 0.15 +
        (observation.templateSignals.length ? -0.8 : 0.4) +
        motionBonus * 0.5,
    ),
    createScore<DesignElementKey>(
      "space",
      "Space",
      "How effectively spacing creates calm, pacing, and content separation.",
      visual * 0.4 + mobile * 0.35 + accessibility * 0.25,
    ),
    createScore<DesignElementKey>(
      "value",
      "Value",
      "How clearly contrast and visual emphasis separate what matters from what does not.",
      accessibility * 0.5 + visual * 0.3 + trust * 0.2,
    ),
    createScore<DesignElementKey>(
      "color",
      "Color",
      "How disciplined the palette feels and whether color reinforces trust and action.",
      visual * 0.55 + trust * 0.2 + accessibility * 0.15 + (observation.templateSignals.length ? -0.5 : 0.3),
    ),
    createScore<DesignElementKey>(
      "texture",
      "Texture",
      "How much proof, image treatment, and content richness add depth without noise.",
      trust * 0.45 + visual * 0.25 + seo * 0.2 + (observation.trustSignals.length * 0.15),
    ),
  ];
}

export function buildDesignPrincipleScores(
  observation: SiteObservation,
  categoryScores: AuditCategoryScore[],
) {
  const visual = getCategoryScore(categoryScores, "visual-design");
  const ux = getCategoryScore(categoryScores, "ux-conversion");
  const mobile = getCategoryScore(categoryScores, "mobile-experience");
  const accessibility = getCategoryScore(categoryScores, "accessibility");
  const trust = getCategoryScore(categoryScores, "trust-credibility");
  const seo = getCategoryScore(categoryScores, "seo-readiness");
  const security = getCategoryScore(categoryScores, "security-posture");
  const motionSignalBonus = observation.motionSignals.length ? 0.4 : -0.3;

  return [
    createScore<DesignPrincipleKey>(
      "balance",
      "Balance",
      "Whether visual weight feels distributed with control instead of crowding one area.",
      visual * 0.45 + mobile * 0.2 + accessibility * 0.2,
    ),
    createScore<DesignPrincipleKey>(
      "contrast",
      "Contrast",
      "Whether important content and actions stand apart clearly enough to guide attention.",
      accessibility * 0.45 + visual * 0.25 + ux * 0.2,
    ),
    createScore<DesignPrincipleKey>(
      "emphasis",
      "Emphasis",
      "Whether the page makes the main promise and next step feel dominant enough.",
      visual * 0.35 + ux * 0.35 + (observation.heroHeading ? 0.8 : -0.5),
    ),
    createScore<DesignPrincipleKey>(
      "movement",
      "Movement",
      "Whether the layout gives the eye a natural sequence from promise to proof to action.",
      ux * 0.4 + visual * 0.25 + mobile * 0.25 + motionSignalBonus,
    ),
    createScore<DesignPrincipleKey>(
      "pattern",
      "Pattern",
      "Whether the site reuses structures and components consistently enough to feel intentional.",
      visual * 0.35 + accessibility * 0.2 + security * 0.1 + (observation.templateSignals.length ? -0.4 : 0.4),
    ),
    createScore<DesignPrincipleKey>(
      "rhythm",
      "Rhythm",
      "Whether pacing, spacing, and repetition create a readable cadence.",
      visual * 0.35 + mobile * 0.3 + seo * 0.1 + accessibility * 0.15 + motionSignalBonus * 0.5,
    ),
    createScore<DesignPrincipleKey>(
      "unity",
      "Unity",
      "Whether the page feels like one system rather than multiple disconnected parts.",
      visual * 0.45 + trust * 0.2 + (observation.templateSignals.length ? -0.5 : 0.3),
    ),
    createScore<DesignPrincipleKey>(
      "variety",
      "Variety",
      "Whether the page creates enough interest and depth without becoming chaotic.",
      visual * 0.3 + trust * 0.15 + seo * 0.15 + (observation.trustSignals.length ? 0.6 : -0.2),
    ),
    createScore<DesignPrincipleKey>(
      "hierarchy",
      "Hierarchy",
      "Whether the visitor can tell what to look at first, second, and third.",
      visual * 0.45 + ux * 0.2 + seo * 0.15 + (observation.heroHeading ? 0.8 : -0.4),
    ),
    createScore<DesignPrincipleKey>(
      "alignment",
      "Alignment",
      "Whether content blocks feel related and positioned with discipline.",
      visual * 0.35 + accessibility * 0.2 + mobile * 0.2,
    ),
    createScore<DesignPrincipleKey>(
      "proximity",
      "Proximity",
      "Whether related content, proof, and actions stay close enough to support decisions.",
      ux * 0.4 + trust * 0.2 + mobile * 0.2,
    ),
    createScore<DesignPrincipleKey>(
      "proportion",
      "Proportion",
      "Whether the scale relationship between text, imagery, and interface feels deliberate.",
      visual * 0.45 + mobile * 0.2 + trust * 0.15,
    ),
  ];
}

export function calculateDesignScore(
  designElementScores: DesignDimensionScore<DesignElementKey>[],
  designPrincipleScores: DesignDimensionScore<DesignPrincipleKey>[],
  animationScore?: number,
) {
  const values = [...designElementScores, ...designPrincipleScores];
  const rawScores = values.map((item) => item.score);

  if (typeof animationScore === "number") {
    rawScores.push(animationScore);
  }

  if (!rawScores.length) {
    return 0;
  }

  const average = rawScores.reduce((sum, score) => sum + score, 0) / rawScores.length;
  const strongCount = rawScores.filter((score) => score >= 7.5).length;
  const weakCount = rawScores.filter((score) => score < 6).length;
  const consistencyBonus =
    weakCount === 0 && rawScores.length > 0
      ? 0.4
      : strongCount >= Math.ceil(rawScores.length * 0.7)
        ? 0.2
        : 0;

  return clampScore(average + consistencyBonus);
}
