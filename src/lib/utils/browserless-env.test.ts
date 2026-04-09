import { afterEach, describe, expect, it, vi } from "vitest";

import { getBrowserlessApiKey, getBrowserlessEndpointBases } from "@/lib/utils/browserless-env";

describe("getBrowserlessApiKey", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("prefers BROWSERLESS_API over aliases", () => {
    vi.stubEnv("BROWSERLESS_API", " primary ");
    vi.stubEnv("BROWSERLESS_TOKEN", "other");
    expect(getBrowserlessApiKey()).toBe("primary");
  });

  it("falls back to BROWSERLESS_TOKEN", () => {
    vi.stubEnv("BROWSERLESS_TOKEN", "tok");
    expect(getBrowserlessApiKey()).toBe("tok");
  });

  it("falls back to BROWSERLESS_KEY", () => {
    vi.stubEnv("BROWSERLESS_KEY", "key");
    expect(getBrowserlessApiKey()).toBe("key");
  });

  it("returns undefined when unset", () => {
    expect(getBrowserlessApiKey()).toBeUndefined();
  });
});

describe("getBrowserlessEndpointBases", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns defaults when BROWSERLESS_ENDPOINT is unset", () => {
    expect(getBrowserlessEndpointBases()).toEqual([
      "https://chrome.browserless.io",
      "https://production-sfo.browserless.io",
    ]);
  });

  it("puts custom endpoint first", () => {
    vi.stubEnv("BROWSERLESS_ENDPOINT", "https://custom.example/browserless");
    expect(getBrowserlessEndpointBases()[0]).toBe("https://custom.example/browserless");
  });
});
