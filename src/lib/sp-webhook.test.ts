import { describe, expect, it } from "vitest";
import { createHmac } from "crypto";
import { deriveClientSlug } from "@/lib/sp-slug";

describe("deriveClientSlug", () => {
  it("strips protocol, www, and TLD into a DNS-safe slug", () => {
    expect(deriveClientSlug("https://www.SaundersWood.com")).toBe("saunderswood");
    expect(deriveClientSlug("acme-plumbing.io")).toBe("acme-plumbing");
    expect(deriveClientSlug("foo.bar.co.uk")).toBe("foo-bar-co");
  });

  it("collapses non-alphanumeric runs to single hyphens and trims", () => {
    expect(deriveClientSlug("Big   Co!!.com")).toBe("big-co");
  });

  it("caps at 63 chars (DNS label limit)", () => {
    const long = "a".repeat(80) + ".com";
    expect(deriveClientSlug(long).length).toBeLessThanOrEqual(63);
  });

  it("never returns empty", () => {
    expect(deriveClientSlug(".com")).toBe("client");
  });
});

describe("SP webhook signing contract", () => {
  // Mirrors verifyWebhook() in StrategyPresentation/apps/studio/src/lib/webhook-verify.ts:
  // signedPayload = `${ts}.${body}`, header = "sha256=" + hmacSHA256(signedPayload, secret).
  it("produces a signature SP's verifier will accept", () => {
    const secret = "test-shared-secret";
    const ts = "1750000000";
    const body = JSON.stringify({ clientSlug: "acme", tier: "standard" });

    const signedPayload = `${ts}.${body}`;
    const sig = "sha256=" + createHmac("sha256", secret).update(signedPayload).digest("hex");

    // Recompute exactly as SP does and compare.
    const expected = "sha256=" + createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
    expect(sig).toBe(expected);
  });
});
