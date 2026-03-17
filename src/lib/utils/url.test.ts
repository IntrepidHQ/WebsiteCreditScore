import { describe, expect, it } from "vitest";

import {
  createWebsiteScreenshotUrl,
  formatDomainTitle,
  inferProfileType,
  normalizeUrl,
  slugFromUrl,
} from "@/lib/utils/url";

describe("url utilities", () => {
  it("normalizes a URL and adds https", () => {
    expect(normalizeUrl("Example.com/")).toBe("https://example.com");
  });

  it("formats the domain into a presentation title", () => {
    expect(formatDomainTitle("https://northshore-roofing.com")).toBe(
      "Northshore Roofing",
    );
  });

  it("creates a stable slug", () => {
    expect(slugFromUrl("https://northshore-roofing.com")).toBe(
      "northshore-roofing-com",
    );
  });

  it("infers healthcare from domain keywords", () => {
    expect(inferProfileType("https://rivercareclinic.com")).toBe("healthcare");
  });

  it("treats short single-word brand domains as polished product sites by default", () => {
    expect(inferProfileType("https://apple.com")).toBe("saas");
  });

  it("creates device-specific preview routes", () => {
    expect(createWebsiteScreenshotUrl("https://apple.com")).toContain("device=desktop");
    expect(createWebsiteScreenshotUrl("https://apple.com", "mobile")).toContain("device=mobile");
  });

  it("rejects localhost and private network targets", () => {
    expect(() => normalizeUrl("http://localhost:3000")).toThrow(
      "Use a public website URL, not a local or private address.",
    );
    expect(() => normalizeUrl("http://192.168.1.10")).toThrow(
      "Use a public website URL, not a local or private address.",
    );
  });
});
