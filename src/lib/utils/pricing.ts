import type { PricingBundle, PricingItem, RoiScenarioDefaults } from "@/lib/types/audit";

export interface PricingSummary {
  baseItem: PricingItem;
  selectedAddOns: PricingItem[];
  selectedPackageItems: PricingItem[];
  addOnsTotal: number;
  total: number;
  selectedIds: string[];
  synergyNotes: string[];
  recommendedUpsells: PricingItem[];
  projectedScoreLift: number;
}

export interface RoiScenarioResult {
  monthlyPipelineValue: number;
  paybackMonths: number;
  annualizedValue: number;
}

export function getDefaultSelectedIds(bundle: PricingBundle) {
  return [bundle.baseItem.id, ...bundle.addOns.filter((item) => item.defaultSelected).map((item) => item.id)];
}

function uniq(values: string[]) {
  return [...new Set(values)];
}

export function getSelectedPricingItems(
  bundle: PricingBundle,
  selectedIds: string[],
) {
  const selectedSet = new Set(selectedIds);
  const selectedAddOns = bundle.addOns.filter((item) => selectedSet.has(item.id));

  return {
    baseItem: bundle.baseItem,
    selectedAddOns,
  };
}

export function collectSynergyNotes(items: PricingItem[], selectedIds: string[]) {
  const selectedSet = new Set(selectedIds);
  const seenPairs = new Set<string>();

  return items.flatMap((item) => {
    if (!selectedSet.has(item.id)) {
      return [];
    }

    const overlaps = item.synergyWith.filter((relatedId) => selectedSet.has(relatedId));

    return overlaps.flatMap((relatedId) => {
      const pairKey = [item.id, relatedId].sort().join(":");

      if (seenPairs.has(pairKey)) {
        return [];
      }

      seenPairs.add(pairKey);

      return [
        `${item.title} + ${items.find((entry) => entry.id === relatedId)?.title ?? "Selected upgrade"}`,
      ];
    });
  });
}

export function getRecommendedUpsells(
  bundle: PricingBundle,
  selectedIds: string[],
  limit = 3,
) {
  const selectedSet = new Set(selectedIds);

  return bundle.addOns
    .filter((item) => !selectedSet.has(item.id))
    .sort((left, right) => {
      const leftScore =
        left.synergyWith.filter((id) => selectedSet.has(id)).length +
        (left.impactLevel === "transformative" ? 2 : left.impactLevel === "high" ? 1 : 0);
      const rightScore =
        right.synergyWith.filter((id) => selectedSet.has(id)).length +
        (right.impactLevel === "transformative" ? 2 : right.impactLevel === "high" ? 1 : 0);

      return rightScore - leftScore;
    })
    .slice(0, limit);
}

export function calculatePricingSummary(
  bundle: PricingBundle,
  selectedIds: string[],
): PricingSummary {
  const normalizedSelectedIds = uniq([bundle.baseItem.id, ...selectedIds]);
  const { baseItem, selectedAddOns } = getSelectedPricingItems(
    bundle,
    normalizedSelectedIds,
  );

  const addOnsTotal = selectedAddOns.reduce((sum, item) => sum + item.price, 0);
  const selectedPackageItems = [baseItem, ...selectedAddOns];

  return {
    baseItem,
    selectedAddOns,
    selectedPackageItems,
    addOnsTotal,
    total: baseItem.price + addOnsTotal,
    selectedIds: normalizedSelectedIds,
    synergyNotes: collectSynergyNotes(bundle.addOns, normalizedSelectedIds),
    recommendedUpsells: getRecommendedUpsells(bundle, normalizedSelectedIds),
    projectedScoreLift: Number(
      selectedPackageItems.reduce((sum, item) => sum + item.estimatedScoreLift, 0).toFixed(1),
    ),
  };
}

export function calculateProjectedScore(
  currentScore: number,
  selectedItems: PricingItem[],
) {
  const orderedItems = [...selectedItems].sort((left, right) => {
    if (left.category === "base") {
      return -1;
    }

    if (right.category === "base") {
      return 1;
    }

    return right.estimatedScoreLift - left.estimatedScoreLift;
  });

  const projected = orderedItems.reduce((score, item, index) => {
    if (item.category === "base" || index === 0) {
      const baseFactor = currentScore < 5.5 ? 1 : currentScore < 7 ? 0.85 : 0.55;

      return Math.min(9.8, score + item.estimatedScoreLift * baseFactor);
    }

    const remainingGap = Math.max(0, 10 - score);
    const appliedLift = item.estimatedScoreLift * Math.max(0.42, remainingGap / 8.5);

    return Math.min(9.8, score + appliedLift);
  }, currentScore);

  return Number(projected.toFixed(1));
}

export function calculateRoiScenario(
  projectCost: number,
  scenario: RoiScenarioDefaults,
): RoiScenarioResult {
  const monthlyPipelineValue =
    scenario.monthlyLeadGain *
    (scenario.leadToClientRate / 100) *
    scenario.averageClientValue;

  const safeMonthlyValue = Math.max(monthlyPipelineValue, 1);

  return {
    monthlyPipelineValue: Number(monthlyPipelineValue.toFixed(0)),
    paybackMonths: Number((projectCost / safeMonthlyValue).toFixed(1)),
    annualizedValue: Number((monthlyPipelineValue * 12).toFixed(0)),
  };
}
