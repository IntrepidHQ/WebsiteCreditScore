import { afterEach, describe, expect, it, vi } from "vitest";
import { completeSponsorTicket, createSponsorStartTicket, verifySponsorCompletion } from "@/lib/sponsor-unlock";

describe("sponsor unlock tickets", () => {
  afterEach(() => vi.restoreAllMocks());

  it("requires thirty seconds and binds completion to the same domain and browser session", () => {
    process.env.WCS_SPONSOR_SECRET = "test-sponsor-secret";
    const now = new Date("2026-09-02T12:00:00Z").getTime();
    vi.spyOn(Date, "now").mockReturnValue(now);
    const started = createSponsorStartTicket("example.com");
    expect(completeSponsorTicket(started, "example.com")).toBeNull();

    vi.spyOn(Date, "now").mockReturnValue(now + 30_000);
    const completed = completeSponsorTicket(started, "example.com");
    expect(completed).not.toBeNull();
    expect(verifySponsorCompletion(completed!.ticket, "example.com", completed!.jti)).toBe(true);
    expect(verifySponsorCompletion(completed!.ticket, "other.example", completed!.jti)).toBe(false);
    expect(verifySponsorCompletion(completed!.ticket, "example.com", "another-session")).toBe(false);
  });
});
