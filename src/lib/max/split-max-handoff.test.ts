import { describe, expect, it } from "vitest";

import { composeTaggedMaxHandoff, splitMaxHandoff } from "@/lib/max/split-max-handoff";

describe("splitMaxHandoff", () => {
  it("splits tagged handoffs", () => {
    const raw = composeTaggedMaxHandoff("## Design\nHello", "Build the hero.");
    const { handoffMarkdown, codingAgentPrompt } = splitMaxHandoff(raw);
    expect(handoffMarkdown).toContain("## Design");
    expect(codingAgentPrompt).toBe("Build the hero.");
  });

  it("falls back when delimiter missing", () => {
    const raw = "Only markdown\n```\nplain block\n```";
    const { handoffMarkdown, codingAgentPrompt } = splitMaxHandoff(raw);
    expect(handoffMarkdown).toBe(raw.trim());
    expect(codingAgentPrompt).toBe("plain block");
  });
});
