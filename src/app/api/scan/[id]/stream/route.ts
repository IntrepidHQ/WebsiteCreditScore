import { NextRequest } from "next/server";
import {
  getScan,
  updateScanStatus,
  saveScanResult,
  saveScanError,
  getCachedResult,
} from "@/lib/db/scans";
import { WCSReportSchema, WCS_REPORT_JSON_SCHEMA, type WCSReport } from "@/lib/schema";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 300;

// ── System prompt ─────────────────────────────────────────────────────────
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
  8. "{domain} homepage design user experience mobile"
  9. "{company} social media" (LinkedIn, X presence)
  10. A peer/competitor comparison search

After each search, briefly update your internal assessment.
Do NOT call submit_credit_report until you have run at least 8 searches.
Cite every claim with the URL it came from in the evidence field of each dimension.

SCORING (apply rigorously):
Each of 10 dimensions gets a 0–100 score and a letter grade (A+ A A- B+ B B- C+ C C- D+ D D- F).
The OVERALL grade is a weighted blend. Be willing to give Fs for shady operators;
give A+s for objectively excellent sites. Never hedge to the middle.

DIMENSIONS (include all 10, in this exact order, with these exact keys):
  legitimacy | reputation | visual_design | ux_conversion | transparency | technical | content | social_presence | longevity | financial_signals

DIMENSION GUIDANCE:
- legitimacy (18%): Business registration, contact info, BBB, verifiable identity.
- reputation (15%): Reviews, complaints, Reddit sentiment, Trustpilot, Glassdoor.
- visual_design (14%): Homepage design quality, brand consistency, visual hierarchy, professional polish. Assess from what you can observe via search results, screenshots, and reviews mentioning the site's look.
- ux_conversion (12%): Navigation clarity, CTA placement, form friction, mobile responsiveness, load experience. Assess from PageSpeed insights, user experience reviews, and observable site structure.
- transparency (10%): Clear pricing, refund policy, terms of service, privacy policy, honest ownership.
- technical (8%): HTTPS, SSL rating, load speed, uptime, security headers.
- content (8%): Depth, accuracy, original research vs. thin/AI-spun filler.
- social_presence (7%): LinkedIn, X/Twitter, YouTube — real engagement vs. ghost accounts.
- longevity (5%): Domain age, business tenure, Wayback Machine history.
- financial_signals (3%): Funding, revenue signals, financial press coverage.

OUTPUT:
Call submit_credit_report exactly once with schema-compliant JSON. No prose.`;

// ── SSE helper ────────────────────────────────────────────────────────────
function send(controller: ReadableStreamDefaultController, data: object) {
  controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`));
}

// ── Heartbeat to prevent proxy timeouts ──────────────────────────────────
function startHeartbeat(controller: ReadableStreamDefaultController): ReturnType<typeof setInterval> {
  return setInterval(() => {
    try {
      controller.enqueue(new TextEncoder().encode(`: heartbeat\n\n`));
    } catch {
      // stream already closed
    }
  }, 15_000);
}

// ── Mock stream (MOCK=1 mode) ─────────────────────────────────────────────
async function streamMock(controller: ReadableStreamDefaultController, domain: string) {
  const queries = [
    `${domain} reviews`,
    `${domain} complaints scam`,
    `${domain} company news`,
    `${domain} BBB Trustpilot`,
    `${domain} founders about`,
    `${domain} site:reddit.com`,
    `${domain} funding revenue`,
    `${domain} security breach privacy`,
    `${domain} social media LinkedIn`,
    `${domain} competitors comparison`,
  ];

  for (let i = 0; i < queries.length; i++) {
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 400));
    send(controller, { type: "search", query: queries[i] });
    send(controller, { type: "result_count", count: (i + 1) * 4 + Math.floor(Math.random() * 4) });
  }

  await new Promise((r) => setTimeout(r, 1000));

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fixture = require("@/lib/fixtures/wcs-mock.json") as WCSReport;
  send(controller, {
    type: "done",
    report: { ...fixture, domain, scanned_at: new Date().toISOString() },
  });
}

// ── Real Anthropic agent ──────────────────────────────────────────────────
async function runAgent(
  controller: ReadableStreamDefaultController,
  scanId: string,
  domain: string
) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

  let searchCount = 0;
  let finalReport: WCSReport | null = null;

  // Track tool_use blocks across all turns (web_search is multi-turn server-side)
  let turnIndex = 0;
  const pendingBlocks = new Map<string, { name: string; inputAccum: string }>();

  const anthropicStream = client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 8000,
    system: [
      {
        type: "text",
        text: WCS_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" } as { type: "ephemeral" },
      },
    ],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [
      { type: "web_search_20250305", name: "web_search", max_uses: 10 } as any,
      {
        name: "submit_credit_report",
        description:
          "Submit the final WebsiteCreditScore report. Call this exactly once after completing all research.",
        input_schema: WCS_REPORT_JSON_SCHEMA,
      },
    ] as any,
    tool_choice: { type: "auto" },
    messages: [
      {
        role: "user",
        content: `Generate a WebsiteCreditScore report for: ${domain}\n\nResearch thoroughly. Use 8-10 diverse web searches before submitting. Be candid — don't hedge scores toward the middle.`,
      },
    ],
  });

  // ── Real-time event relay ───────────────────────────────────────────────
  // web_search triggers multi-turn responses server-side. We track blocks
  // across all turns using a composite key so indices don't collide.
  for await (const event of anthropicStream) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const e = event as any;

    switch (e.type) {
      case "message_start":
        turnIndex++;
        break;

      case "content_block_start":
        if (e.content_block?.type === "tool_use") {
          pendingBlocks.set(`${turnIndex}:${e.index}`, {
            name: e.content_block.name,
            inputAccum: "",
          });
        }
        break;

      case "content_block_delta":
        if (e.delta?.type === "input_json_delta") {
          const block = pendingBlocks.get(`${turnIndex}:${e.index}`);
          if (block) block.inputAccum += e.delta.partial_json;
        }
        break;

      case "content_block_stop": {
        const key = `${turnIndex}:${e.index}`;
        const block = pendingBlocks.get(key);
        if (!block) break;

        if (block.name === "web_search") {
          try {
            const input = JSON.parse(block.inputAccum) as { query?: string };
            if (input.query) {
              searchCount++;
              send(controller, { type: "search", query: input.query });
            }
          } catch {
            // JSON not yet complete — skip
          }
        } else if (block.name === "submit_credit_report") {
          try {
            const raw = JSON.parse(block.inputAccum);
            const parsed = WCSReportSchema.safeParse(raw);
            if (parsed.success) {
              finalReport = parsed.data;
              send(controller, { type: "result_count", count: finalReport.sources.length });
            } else {
              // Log validation errors for debugging; surface the raw report anyway
              console.error("[stream] Zod validation errors:", JSON.stringify(parsed.error.issues.slice(0, 5)));
              // Try to use the raw report if it has the minimum shape
              if (raw?.overall?.grade && Array.isArray(raw?.dimensions)) {
                finalReport = raw as WCSReport;
                send(controller, { type: "result_count", count: raw.sources?.length ?? 0 });
              }
            }
          } catch {
            // Incomplete JSON — will surface as error below
          }
        }

        pendingBlocks.delete(key);
        break;
      }
    }
  }

  // ── Finalise ────────────────────────────────────────────────────────────
  if (!finalReport) {
    throw new Error(
      "Claude did not call submit_credit_report — try increasing max_tokens or reducing search count"
    );
  }

  // Usage stats for cost logging
  const finalMessage = await anthropicStream.finalMessage();
  const usage = finalMessage.usage;
  const inputCostCents = (usage.input_tokens / 1_000_000) * 100;   // $1.00/MTok
  const outputCostCents = (usage.output_tokens / 1_000_000) * 500; // $5.00/MTok
  const searchCostCents = searchCount * 1;                          // $0.01/search
  const totalCostCents = inputCostCents + outputCostCents + searchCostCents;

  console.log(
    `[scan/${scanId}] domain=${domain} searches=${searchCount} ` +
    `in=${usage.input_tokens} out=${usage.output_tokens} ` +
    `cache_read=${(usage as any).cache_read_input_tokens ?? 0} ` +
    `cost=$${(totalCostCents / 100).toFixed(4)}`
  );

  await saveScanResult(scanId, finalReport, {
    sourceCount: finalReport.sources.length,
    costCents: Math.round(totalCostCents * 100) / 100, // keep 2 decimal places
  });

  send(controller, { type: "done", report: finalReport });
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const stream = new ReadableStream({
    async start(controller) {
      const heartbeat = startHeartbeat(controller);
      try {
        const scan = await getScan(id);
        if (!scan) {
          send(controller, { type: "error", error: "Scan not found" });
          return;
        }

        // ── MOCK mode ──────────────────────────────────────────────
        if (process.env.MOCK === "1") {
          await streamMock(controller, scan.domain);
          return;
        }

        // ── Guard: payment required ────────────────────────────────
        if (!scan.paid) {
          send(controller, { type: "error", error: "Payment required" });
          return;
        }

        // ── Already done: replay ───────────────────────────────────
        if (scan.status === "done" && scan.result) {
          send(controller, { type: "cached", report: scan.result });
          return;
        }

        // ── 7-day domain cache ─────────────────────────────────────
        const cached = await getCachedResult(scan.domain);
        if (cached) {
          send(controller, { type: "cached", report: cached });
          return;
        }

        // ── Run the agent ──────────────────────────────────────────
        await updateScanStatus(id, "streaming");
        await runAgent(controller, id, scan.domain);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Scan failed";
        console.error("[scan/stream] fatal:", err);
        await saveScanError(id, msg).catch(() => {});
        send(controller, { type: "error", error: msg });
      } finally {
        clearInterval(heartbeat);
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
