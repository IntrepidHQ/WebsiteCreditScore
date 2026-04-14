import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { PricingConfigurator } from "@/features/pricing/components/pricing-configurator";
import { buildAuditReportFromUrl } from "@/lib/mock/report-builder";
import { applyProposalOffer } from "@/lib/utils/proposal-offers";
import { calculatePricingSummary, getDefaultSelectedIds } from "@/lib/utils/pricing";
import { usePricingStore } from "@/store/pricing-store";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("PricingConfigurator", () => {
  const report = buildAuditReportFromUrl("https://pulseboardhq.com");

  beforeEach(() => {
    usePricingStore.setState({
      selectionsByReport: {},
      roiByReport: {},
    });
  });

  it("renders the default calculated total", async () => {
    const expected = calculatePricingSummary(
      report.pricingBundle,
      getDefaultSelectedIds(report.pricingBundle),
    );
    const offered = applyProposalOffer(expected.total, report.proposalOffer);

    render(<PricingConfigurator report={report} />);

    expect(
      await screen.findByText(`$${offered.finalTotal.toLocaleString()}`, {
        selector: "[aria-live='polite']",
      }),
    ).toBeInTheDocument();
  });

  it("updates the total when an add-on is selected", async () => {
    const user = userEvent.setup();
    const firstOptionalAddOn = report.pricingBundle.addOns[0]!;
    const nextSummary = calculatePricingSummary(report.pricingBundle, [
      ...getDefaultSelectedIds(report.pricingBundle),
      firstOptionalAddOn.id,
    ]);
    const nextOffered = applyProposalOffer(nextSummary.total, report.proposalOffer);

    render(<PricingConfigurator report={report} />);

    await user.click(
      screen.getByRole("button", {
        name: new RegExp(`^Add ${escapeRegExp(firstOptionalAddOn.title)}$`, "i"),
      }),
    );

    await waitFor(() =>
      expect(
        screen.getByText(`$${nextOffered.finalTotal.toLocaleString()}`, {
          selector: "[aria-live='polite']",
        }),
      ).toBeInTheDocument(),
    );
  });
});
