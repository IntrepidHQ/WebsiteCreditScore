#!/usr/bin/env node
/**
 * Phase 4 cost-validation script — runs the Claude agent directly.
 *
 * Usage:
 *   node scripts/test-scan.mjs <domain>
 *   node scripts/test-scan.mjs stripe.com
 *   node scripts/test-scan.mjs websitecreditscore.com
 *
 * Requires ANTHROPIC_API_KEY in environment (or .env.local via --env-file flag):
 *   node --env-file=.env.local scripts/test-scan.mjs stripe.com
 *
 * Outputs: full JSON report + token/cost breakdown to stdout.
 * Does NOT touch the database — for cost and quality validation only.
 */

import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync } from "fs";

const domain = process.argv[2];
if (!domain) {
  console.error("Usage: node scripts/test-scan.mjs <domain>");
  process.exit(1);
}

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ANTHROPIC_API_KEY is not set. Run with: node --env-file=.env.local scripts/test-scan.mjs <domain>");
  process.exit(1);
}

const WCS_SYSTEM_PROMPT = `You are the WebsiteCreditScore Research Agent. Your job is to produce a deep,
candid, evidence-backed credibility report for a single domain that a paying customer will see.

You have access to:
- web_search (max 10 uses) — use it aggressively across diverse angles.
- submit_credit_report — call this EXACTLY ONCE at the end with the full report.

RESEARCH METHOD (mandatory order):
Before submitting, perform 8–10 web searches covering, at minimum:
  1. "{domain} reviews"
  2. "{domain} complaints" OR "{domain} scam"
  3. "{company} news" (extract company name from homepage or domain)
  4. "{company} BBB" OR Trustpilot OR Glassdoor
  5. "{company} founders" OR "{company} about"
  6. "{domain} site:reddit.com" — real user sentiment
  7. "{company} funding" OR "{company} revenue"
  8. "{domain} security breach" OR "{domain} privacy"
  9. "{company} social media" (LinkedIn, X presence)
  10. A peer/competitor comparison search

After each search, briefly update your internal assessment.
Do NOT call submit_credit_report until you have run at least 8 searches.
Cite every claim with the URL it came from in the evidence field of each dimension.

SCORING (apply rigorously):
Each of 8 dimensions gets a 0–100 score and a letter grade (A+ A A- B+ B B- C+ C C- D+ D D- F).
Be willing to give Fs for shady operators; give A+s for objectively excellent sites.
Never hedge to the middle.

DIMENSIONS (include all 8, in this exact order, with these exact keys):
  legitimacy | reputation | longevity | transparency | technical | content | social_presence | financial_signals

OUTPUT: Call submit_credit_report exactly once with schema-compliant JSON. No prose.`;

const WCS_REPORT_JSON_SCHEMA = {
  type: "object",
  required: ["domain", "scanned_at", "overall", "dimensions", "red_flags", "green_flags", "sources", "summary"],
  properties: {
    domain: { type: "string" },
    company_name: { type: "string" },
    scanned_at: { type: "string", format: "date-time" },
    overall: {
      type: "object",
      required: ["score", "grade", "headline", "one_liner"],
      properties: {
        score: { type: "integer", minimum: 0, maximum: 100 },
        grade: { type: "string", enum: ["A+","A","A-","B+","B","B-","C+","C","C-","D+","D","D-","F"] },
        headline: { type: "string" },
        one_liner: { type: "string" },
      },
    },
    dimensions: {
      type: "array",
      minItems: 8,
      maxItems: 8,
      items: {
        type: "object",
        required: ["key", "label", "score", "grade", "weight", "verdict", "evidence"],
        properties: {
          key: { type: "string", enum: ["legitimacy","reputation","longevity","transparency","technical","content","social_presence","financial_signals"] },
          label: { type: "string" },
          score: { type: "integer", minimum: 0, maximum: 100 },
          grade: { type: "string" },
          weight: { type: "number" },
          verdict: { type: "string" },
          evidence: { type: "array", items: { type: "object", required: ["claim","url"], properties: { claim: { type: "string" }, url: { type: "string" }, title: { type: "string" } } } },
        },
      },
    },
    red_flags: { type: "array", items: { type: "object", required: ["title","detail","severity"], properties: { title: { type: "string" }, detail: { type: "string" }, severity: { type: "string", enum: ["low","medium","high","critical"] }, url: { type: "string" } } } },
    green_flags: { type: "array", items: { type: "object", required: ["title","detail"], properties: { title: { type: "string" }, detail: { type: "string" }, url: { type: "string" } } } },
    timeline: { type: "array", items: { type: "object", required: ["year","event"], properties: { year: { type: "integer" }, event: { type: "string" }, url: { type: "string" } } } },
    peers: { type: "array", items: { type: "object", properties: { domain: { type: "string" }, comparison: { type: "string" } } } },
    sources: { type: "array", minItems: 12, items: { type: "object", required: ["url","title"], properties: { url: { type: "string" }, title: { type: "string" }, domain: { type: "string" } } } },
    summary: { type: "string" },
  },
};

async function main() {
  const client = new Anthropic({ apiKey });
  const startTime = Date.now();

  console.log(`\n🔍  Scanning: ${domain}`);
  console.log(`    Model:  claude-haiku-4-5`);
  console.log(`    Max searches: 10`);
  console.log(`    Started: ${new Date().toISOString()}\n`);

  let searchCount = 0;
  let finalReport = null;
  let turnIndex = 0;
  const pendingBlocks = new Map();

  const stream = client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 8000,
    system: [
      {
        type: "text",
        text: WCS_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    tools: [
      { type: "web_search_20250305", name: "web_search", max_uses: 10 },
      {
        name: "submit_credit_report",
        description: "Submit the final WebsiteCreditScore report. Call this exactly once after completing all research.",
        input_schema: WCS_REPORT_JSON_SCHEMA,
      },
    ],
    tool_choice: { type: "auto" },
    messages: [
      {
        role: "user",
        content: `Generate a WebsiteCreditScore report for: ${domain}\n\nResearch thoroughly. Use 8-10 diverse web searches before submitting. Be candid — don't hedge scores toward the middle.`,
      },
    ],
  });

  for await (const event of stream) {
    switch (event.type) {
      case "message_start":
        turnIndex++;
        break;

      case "content_block_start":
        if (event.content_block?.type === "tool_use" || event.content_block?.type === "server_tool_use") {
          pendingBlocks.set(`${turnIndex}:${event.index}`, {
            name: event.content_block.name,
            inputAccum: "",
          });
        }
        break;

      case "content_block_delta":
        if (event.delta?.type === "input_json_delta") {
          const block = pendingBlocks.get(`${turnIndex}:${event.index}`);
          if (block) block.inputAccum += event.delta.partial_json;
        }
        break;

      case "content_block_stop": {
        const key = `${turnIndex}:${event.index}`;
        const block = pendingBlocks.get(key);
        if (!block) break;

        if (block.name === "web_search") {
          try {
            const input = JSON.parse(block.inputAccum);
            if (input.query) {
              searchCount++;
              console.log(`  [${searchCount.toString().padStart(2)}] 🔎  ${input.query}`);
            }
          } catch { /* partial */ }
        } else if (block.name === "submit_credit_report") {
          try {
            finalReport = JSON.parse(block.inputAccum);
            console.log(`\n  ✅  submit_credit_report received (${finalReport.sources?.length ?? 0} sources)\n`);
          } catch { /* partial */ }
        }

        pendingBlocks.delete(key);
        break;
      }
    }
  }

  const finalMessage = await stream.finalMessage();
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const usage = finalMessage.usage;

  // ── Cost breakdown ────────────────────────────────────────────────────
  const inputCostCents  = (usage.input_tokens  / 1_000_000) * 100;
  const outputCostCents = (usage.output_tokens / 1_000_000) * 500;
  const searchCostCents = searchCount * 1;
  const totalCostCents  = inputCostCents + outputCostCents + searchCostCents;
  const cacheReadTokens = usage.cache_read_input_tokens ?? 0;

  console.log("─".repeat(60));
  console.log("TOKEN & COST BREAKDOWN");
  console.log("─".repeat(60));
  console.log(`  Input tokens:      ${usage.input_tokens.toLocaleString()}`);
  console.log(`  Output tokens:     ${usage.output_tokens.toLocaleString()}`);
  console.log(`  Cache read tokens: ${cacheReadTokens.toLocaleString()} (saved $${(cacheReadTokens / 1_000_000 * 0.90).toFixed(4)})`);
  console.log(`  Web searches:      ${searchCount} × $0.01`);
  console.log(`  Input cost:        $${(inputCostCents  / 100).toFixed(4)}`);
  console.log(`  Output cost:       $${(outputCostCents / 100).toFixed(4)}`);
  console.log(`  Search cost:       $${(searchCostCents / 100).toFixed(4)}`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  TOTAL:             $${(totalCostCents  / 100).toFixed(4)}  (${totalCostCents.toFixed(1)}¢)`);
  console.log(`  Wall time:         ${elapsed}s`);
  console.log(`  Margin at $1.00:   ${(100 - totalCostCents).toFixed(1)}%`);
  console.log(`  Under $0.25 cap:   ${totalCostCents <= 25 ? "✅ YES" : "❌ NO — reduce max_uses"}`);

  if (!finalReport) {
    console.error("\n❌  No report generated — Claude did not call submit_credit_report");
    process.exit(1);
  }

  // ── Report summary ────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(60));
  console.log("REPORT SUMMARY");
  console.log("─".repeat(60));
  console.log(`  Domain:    ${finalReport.domain}`);
  console.log(`  Company:   ${finalReport.company_name ?? "(not extracted)"}`);
  console.log(`  Grade:     ${finalReport.overall?.grade}  (${finalReport.overall?.score}/100)`);
  console.log(`  Headline:  ${finalReport.overall?.headline}`);
  console.log(`  Dimensions:`);
  for (const d of finalReport.dimensions ?? []) {
    const bar = "█".repeat(Math.round(d.score / 10));
    console.log(`    ${d.key.padEnd(20)} ${d.grade.padStart(2)}  ${d.score.toString().padStart(3)}  ${bar}`);
  }
  console.log(`  Red flags: ${finalReport.red_flags?.length ?? 0}`);
  console.log(`  Green flags: ${finalReport.green_flags?.length ?? 0}`);
  console.log(`  Sources:   ${finalReport.sources?.length ?? 0}`);

  // ── Save output ───────────────────────────────────────────────────────
  const outFile = `scripts/scan-${domain.replace(/\./g, "-")}-${Date.now()}.json`;
  writeFileSync(outFile, JSON.stringify(finalReport, null, 2));
  console.log(`\n  Report saved → ${outFile}\n`);
}

main().catch((err) => {
  console.error("\n❌  Fatal error:", err.message ?? err);
  process.exit(1);
});
