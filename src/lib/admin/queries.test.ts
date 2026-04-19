import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock the service client before importing the queries module.
vi.mock("@/lib/supabase/service", () => ({
  getSupabaseServiceClient: vi.fn(),
}));

import { getSupabaseServiceClient } from "@/lib/supabase/service";
import {
  getAdminCustomer,
  getAdminCustomers,
  getAdminDailySeries,
  getAdminScansForCustomer,
  getAdminSummary,
} from "./queries";

type MockClient = ReturnType<typeof buildMockClient>;

/**
 * Build a tiny fluent builder that records the table name and returns a
 * configurable response. We only implement the chain methods queries.ts uses:
 * from().select().eq()/order()/gte()/maybeSingle() — each returns a thenable
 * that resolves to `{ data, error }`.
 */
function buildMockClient(
  tableResponses: Record<string, { data: unknown; error: unknown }>,
) {
  const calls: Array<{ table: string }> = [];
  const client = {
    from(table: string) {
      calls.push({ table });
      const response = tableResponses[table] ?? { data: [], error: null };
      const builder: Record<string, unknown> = {};
      const chain = () => builder;
      builder.select = chain;
      builder.eq = chain;
      builder.order = chain;
      builder.gte = chain;
      builder.maybeSingle = () => Promise.resolve(response);
      builder.then = (
        resolve: (value: unknown) => unknown,
        reject?: (reason: unknown) => unknown,
      ) => Promise.resolve(response).then(resolve, reject);
      return builder;
    },
    _calls: calls,
  };
  return client;
}

const setClient = (client: MockClient | null) => {
  vi.mocked(getSupabaseServiceClient).mockReturnValue(
    client as unknown as ReturnType<typeof getSupabaseServiceClient>,
  );
};

describe("admin/queries graceful degradation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns [] from getAdminCustomers when the service client is unavailable", async () => {
    setClient(null);
    await expect(getAdminCustomers()).resolves.toEqual([]);
  });

  it("returns null from getAdminCustomer when the service client is unavailable", async () => {
    setClient(null);
    await expect(getAdminCustomer("anything")).resolves.toBeNull();
  });

  it("returns [] from getAdminScansForCustomer when the service client is unavailable", async () => {
    setClient(null);
    await expect(getAdminScansForCustomer("anything")).resolves.toEqual([]);
  });

  it("returns [] from getAdminDailySeries when the service client is unavailable", async () => {
    setClient(null);
    await expect(getAdminDailySeries(30)).resolves.toEqual([]);
  });

  it("returns a zeroed summary when the service client is unavailable", async () => {
    setClient(null);
    await expect(getAdminSummary()).resolves.toEqual({
      totalCustomers: 0,
      payingCustomers: 0,
      scansLast30Days: 0,
      revenueCentsLast30Days: 0,
      costCentsLast30Days: 0,
      marginCentsLast30Days: 0,
      marginPercentLast30Days: 0,
    });
  });
});

describe("admin/queries shape parity + privacy", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds AdminCustomer rows from workspace + scan aggregates", async () => {
    const workspaceId = "11111111-1111-1111-1111-111111111111";
    const client = buildMockClient({
      workspaces: {
        data: [
          {
            id: workspaceId,
            name: "Acme",
            slug: "acme",
            owner_user_id: "u1",
            created_at: "2026-01-01T00:00:00Z",
            payload: {
              name: "Acme Studio",
              ownerEmail: "founder@acme.co",
              billingPlan: "pro",
              entitlements: [],
            },
          },
        ],
        error: null,
      },
      scans: {
        data: [
          {
            workspace_id: workspaceId,
            provider_cost_cents: 10,
            revenue_cents: 100,
            started_at: "2026-04-10T00:00:00Z",
          },
          {
            workspace_id: workspaceId,
            provider_cost_cents: 12,
            revenue_cents: 100,
            started_at: "2026-04-15T00:00:00Z",
          },
        ],
        error: null,
      },
    });
    setClient(client);
    const customers = await getAdminCustomers();
    expect(customers).toHaveLength(1);
    const customer = customers[0]!;
    expect(customer.id).toBe(workspaceId);
    expect(customer.displayName).toBe("Acme Studio");
    expect(customer.email).toBe("founder@acme.co");
    expect(customer.plan).toBe("pro-50");
    expect(customer.scansUsed).toBe(2);
    expect(customer.lifetimeRevenueCents).toBe(200);
    expect(customer.lifetimeCostCents).toBe(22);
    expect(customer.lastScanAt).toBe("2026-04-15T00:00:00Z");
    expect(customer.isPrivacyProtected).toBe(false);
    expect(customer.scansIncluded).toBe(50);
  });

  it("redacts Privacy Pro customers", async () => {
    const workspaceId = "22222222-2222-2222-2222-222222222222";
    const client = buildMockClient({
      workspaces: {
        data: [
          {
            id: workspaceId,
            name: "Sensitive LLC",
            slug: "sensitive",
            owner_user_id: "u2",
            created_at: "2026-02-01T00:00:00Z",
            payload: {
              name: "Sensitive LLC",
              ownerEmail: "ops@sensitive.io",
              billingPlan: "pro",
              entitlements: ["privacy-pro"],
            },
          },
        ],
        error: null,
      },
      scans: {
        data: [],
        error: null,
      },
    });
    setClient(client);
    const [customer] = await getAdminCustomers();
    expect(customer).toBeTruthy();
    expect(customer!.isPrivacyProtected).toBe(true);
    expect(customer!.displayName).toBe("Private account");
    expect(customer!.email.startsWith("•••@")).toBe(true);
    expect(customer!.plan).toBe("privacy-pro");
  });

  it("returns a 30-day series with zero-filled empty buckets", async () => {
    const client = buildMockClient({
      scans: { data: [], error: null },
    });
    setClient(client);
    const series = await getAdminDailySeries(30);
    expect(series).toHaveLength(30);
    for (const point of series) {
      expect(point.scans).toBe(0);
      expect(point.revenueCents).toBe(0);
      expect(point.costCents).toBe(0);
      expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
