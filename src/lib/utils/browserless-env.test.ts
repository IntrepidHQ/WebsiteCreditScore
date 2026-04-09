import { afterEach, describe, expect, it, vi } from "vitest";

import { getBrowserlessApiKey } from "@/lib/utils/browserless-env";

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
