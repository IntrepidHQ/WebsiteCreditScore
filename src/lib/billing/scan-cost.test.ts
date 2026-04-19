import { describe, expect, it } from "vitest";

import {
  DEFAULT_SCAN_COST_CENTS,
  REVENUE_PER_SCAN_CENTS,
  estimateScanCostCents,
} from "./scan-cost";

describe("estimateScanCostCents", () => {
  it("returns at least 1¢ even with zero inputs (never logs a free scan)", () => {
    expect(estimateScanCostCents({})).toBe(1);
  });

  it("computes Claude Sonnet inference cost to the cent ceiling", () => {
    // 1M input tokens @ $3/MT = 300¢. 1M output tokens @ $15/MT = 1500¢.
    expect(
      estimateScanCostCents({
        claudeInputTokens: 1_000_000,
        claudeOutputTokens: 1_000_000,
      }),
    ).toBe(1800);
  });

  it("rounds up to the next cent", () => {
    // 6000 input tok = 1.8¢, 1500 output tok = 2.25¢ → 4.05¢ → 5¢ ceiling
    expect(
      estimateScanCostCents({
        claudeInputTokens: 6_000,
        claudeOutputTokens: 1_500,
      }),
    ).toBe(5);
  });

  it("includes Firecrawl, Browserless, and overhead", () => {
    expect(
      estimateScanCostCents({
        firecrawlCalls: 1,
        browserlessCalls: 1,
        overheadCents: 0.1,
      }),
    ).toBe(2); // 1 + 0.3 + 0.1 = 1.4 → ceil → 2
  });

  it("DEFAULT_SCAN_COST_CENTS is still at least 1¢", () => {
    expect(DEFAULT_SCAN_COST_CENTS).toBeGreaterThanOrEqual(1);
  });

  it("REVENUE_PER_SCAN_CENTS is $1", () => {
    expect(REVENUE_PER_SCAN_CENTS).toBe(100);
  });
});
