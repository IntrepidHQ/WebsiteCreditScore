import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { PricingConfigurator } from "@/features/pricing/components/pricing-configurator";
import { buildAuditReportFromUrl } from "@/lib/mock/report-builder";
import { calculatePricingSummary, getDefaultSelectedIds } from "@/lib/utils/pricing";
import { usePricingStore } from "@/store/pricing-store";

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

    render(<PricingConfigurator report={report} />);

    expect(
      await screen.findAllByText(`$${expected.total.toLocaleString()}`),
    ).toHaveLength(2);
  });

  it("updates the total when an add-on is selected", async () => {
    const user = userEvent.setup();
    const startingTotal = calculatePricingSummary(
      report.pricingBundle,
      getDefaultSelectedIds(report.pricingBundle),
    ).total;

    render(<PricingConfigurator report={report} />);

    await user.click(screen.getAllByRole("button", { name: /^add /i })[0]);

    await waitFor(() =>
      expect(screen.queryAllByText(`$${startingTotal.toLocaleString()}`)).toHaveLength(0),
    );
  });
});
