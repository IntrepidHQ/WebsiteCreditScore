import { NextRequest } from "next/server";
import {
  getScan,
  saveScanResult,
  saveScanError,
  updateScanProgress,
} from "@/lib/db/scans";
import { WCSReportSchema, WCS_REPORT_JSON_SCHEMA, type WCSReport } from "@/lib/schema";
import fixture from "@/lib/fixtures/wcs-mock.json";
import Anthropic from "@anthropic-ai/sdk";
import type { MessageStreamEvent, Tool, ToolUnion } from "@anthropic-ai/sdk/resources/messages";
import { autoHandoffToSP } from "@/lib/sp-webhook";
import { crawlSite, crawlToPromptBlock } from "@/lib/site-crawl";
import { attachRemediations } from "@/lib/attach-remediations";
import { normalizeReportScores } from "@/lib/scoring";
import { attachReportProvenance } from "@/lib/report-provenance";
import { verifyReportSources } from "@/lib/source-verification";

export const runtime = "nodejs";
export const maxDuration = 300;

// ── System prompt ─────────────────────────────────────────────────────────
const WCS_SYSTEM_PROMPT = `You are the WebsiteCreditScore Research Agent. Your job is to produce a deep,
candid, evidence-backed credibility report for a single domain that a paying customer will see.

You have access to:
- web_search (max 10 uses) — use it aggressively across diverse angles.
- submit_credit_report — call this EXACTLY ONCE at the end with the full report.

You will also be given a FIRST-PARTY SITE CRAWL: the result of directly fetching
the live site (homepage links + the actual legal/pricing/contact pages). This is
AUTHORITATIVE ground truth — far more reliable than web_search for "does this
page exist?". web_search only sees what a search engine has indexed, so new or
lightly-indexed sites will look like they are missing pages that in fact exist
and are linked in the footer. NEVER claim a page listed as FOUND in the crawl is
missing. Only treat a transparency/pricing/contact page as absent if BOTH the
crawl did not find it AND web_search turns up nothing.

RESEARCH METHOD (mandatory order):
Read the FIRST-PARTY SITE CRAWL first and let it anchor the transparency,
legitimacy, and ux_conversion dimensions. Then perform 8–10 web searches:
Before submitting, perform 8–10 web searches covering, at minimum:
  1. "https://{domain}" — inspect the live homepage content first. Treat first-party homepage/about/pricing/docs content as authoritative evidence that the site exists, even if Google has not indexed it yet.
  2. "site:{domain} about OR company OR contact"
  3. "site:{domain} pricing OR refund OR terms OR privacy OR cookies"
  4. "{domain} reviews"
  5. "{domain} complaints" OR "{domain} scam"
  6. "{company} news" (extract company name from homepage or domain)
  7. "{company} BBB" OR Trustpilot OR Glassdoor
  8. "{company} founders" OR "{company} about"
  9. "{domain} site:reddit.com" OR "{company} social media LinkedIn X" — user and social sentiment
  10. "{company} funding revenue competitors" — financial signals and peer comparison

SOURCE QUALITY AND COVERAGE (mandatory):
  - Source quality matters more than source count. Target 15–18 DISTINCT URLs
    across at least five source types: first-party pages, official registries or
    filings, independent reporting, technical checks, review platforms, and
    relevant social/community evidence.
  - Include at least four first-party/official/registry/technical sources and at
    least two genuinely independent sources when they exist. Do not pad the list
    with mirrors, syndicated copies, search pages, or multiple URLs that repeat
    the same underlying claim.
  - Use no more than three review-platform URLs. A review platform is one
    self-selected sample, not thousands of independent sources.
  - Prefer the primary regulator, court filing, SEC filing, company filing, or
    original reporting over Wikipedia, press-release mirrors, SEO blogs, or
    summaries. Wikipedia may orient research but should not carry a consequential
    finding when a primary source is available.

REVIEW-PLATFORM RULES (mandatory):
  - Trustpilot, Yelp, BBB customer reviews, Glassdoor, Reddit, and similar sources
    measure the experiences of people who chose to post there. They are not a
    census of customers and are never a direct score of legitimacy, financial
    health, product quality, or the company as a whole.
  - Inspect and mention representativeness signals when visible: claimed versus
    unclaimed profile, invited versus unsolicited reviews, review count, recency,
    rating distribution, verified-interaction labels, response behavior, and
    whether the profile clearly matches the company/domain being scored.
  - A single review platform may identify a customer-support concern, but cannot
    by itself justify a severe reputation penalty. A reputation score below 60
    requires corroboration from at least two independent source categories or an
    authoritative regulatory/legal finding. Never transfer a review-site penalty
    into legitimacy, longevity, financial, technical, design, or transparency.
  - For globally established companies, distinguish broad brand reputation from
    platform-specific support complaints. For local businesses, Google/Yelp/BBB
    may be more decision-relevant, but still require domain/entity matching and
    cross-platform context.

CLAIM SAFETY (mandatory):
  - Allegations, complaints, lawsuits, short-seller reports, and user reports are
    claims, not findings of fact. Attribute them in the sentence and state the
    source's role. Regulatory orders and final judgments may be described as
    findings only within their exact scope.
  - Never infer fraud, scam activity, criminality, or illegitimacy from a low star
    rating, complaint volume, or an unverified article alone.

After each search, briefly update your internal assessment.
Do NOT call submit_credit_report until you have run at least 8 searches.
Cite every claim with the URL it came from in the evidence field of each dimension.
If the live homepage, pricing, privacy, terms, cookies, docs, or about pages are accessible, use them as first-party evidence.
Do not give visual_design, ux_conversion, or content a 0 merely because third-party screenshots or reviews are unavailable. A 0 means the site is unreachable, broken, or empty. If the live site is accessible, score those dimensions from the visible structure, copy, navigation, forms, mobile cues, and content depth.
For websitecreditscore.com specifically, include first-party pages, the public GitHub repository/README when found, and indexed blog/docs/cookies/privacy/terms pages as evidence. Low Google indexation should reduce social/longevity/reputation as appropriate, but it must not erase observable homepage UX, content depth, or technical/transparency work.

SCORING (apply rigorously and REPRODUCIBLY):
Each of 10 dimensions gets a 0–100 score. Anchor every score to these fixed bands
so the same evidence always yields the same score — do NOT let it drift between runs:
  90–100: exceptional — best-in-class, essentially no concerns
  75–89:  strong — solid with only minor gaps
  60–74:  adequate — functional but with meaningful gaps
  40–59:  weak — significant deficiencies a buyer would notice
  20–39:  poor — major red flags or near-absent signals
  0–19:   critical — broken, fraudulent, or nonexistent
Reproducibility rules:
  - Score each dimension on DURABLE evidence (the live site, registrations, policies,
    real profiles) — never on how many results a given search happened to return.
    Search-result volume is volatile; the site and its records are not.
  - Round to the nearest 5. Do not distinguish a 63 from a 64.
  - A dimension you cannot verify either way sits at 50 (unproven), not 20 — absence
    of a search hit is not evidence of a problem.
You do NOT assign letter grades or the overall score — the platform derives the
letter grade from each score and computes the overall as the fixed weighted average
of the 10 dimensions. Just fill in a numeric grade field per dimension (any valid
letter is fine; it will be recomputed) and put your best integer in overall.score.
Be willing to score shady operators very low and excellent sites very high. Never
hedge everything to the middle.

DIMENSIONS (include all 10, in this exact order, with these exact keys):
  legitimacy | reputation | visual_design | ux_conversion | transparency | technical | content | social_presence | longevity | financial_signals

DIMENSION GUIDANCE:
- legitimacy (18%): Business registration, contact info, BBB, verifiable identity.
- reputation (15%): Broad public reputation, customer-support sentiment, verified complaint patterns, independent coverage, and response behavior. Review platforms are scoped, self-selected samples and require corroboration for severe penalties.
- visual_design (14%): Homepage design quality, brand consistency, visual hierarchy, professional polish. Assess from what you can observe via search results, screenshots, and reviews mentioning the site's look.
- ux_conversion (12%): Navigation clarity, CTA placement, form friction, mobile responsiveness, load experience. Assess from PageSpeed insights, user experience reviews, and observable site structure.
- transparency (10%): Clear pricing, refund policy, terms of service, privacy policy, honest ownership.
- technical (8%): HTTPS, SSL rating, load speed, uptime, security headers.
- content (8%): Depth, accuracy, original research vs. thin/AI-spun filler.
- social_presence (7%): LinkedIn, X/Twitter, YouTube — real engagement vs. ghost accounts.
- longevity (5%): Domain age, business tenure, Wayback Machine history.
- financial_signals (3%): Funding, revenue signals, financial press coverage.

SUGGESTED FIXES (required for weak dimensions):
For every dimension you score below 80, populate its suggested_fixes array with
2–4 concrete, site-specific actions the owner could take to raise that score
(reference what you actually observed — the missing page, the ghost profile, the
slow check, the thin section). Order them most-impactful first via priority.
Strong dimensions (80+) need no fixes. Do not recommend products or vendors here
— just the fix itself; the platform maps fixes to solutions separately.

OUTPUT:
Call submit_credit_report exactly once with schema-compliant JSON. No prose. Do not put Markdown syntax in any customer-facing string; write labels as plain text, not **bold markers**.`;

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

type ContentBlockStart = Extract<MessageStreamEvent, { type: "content_block_start" }>["content_block"];
type StreamToolBlock = Extract<ContentBlockStart, { type: "tool_use" | "server_tool_use" }>;
type InputJsonDeltaEvent = Extract<MessageStreamEvent, { type: "content_block_delta" }> & {
  delta: { type: "input_json_delta"; partial_json: string };
};

function isStreamToolBlock(block: ContentBlockStart): block is StreamToolBlock {
  return block.type === "tool_use" || block.type === "server_tool_use";
}

function isInputJsonDeltaEvent(event: MessageStreamEvent): event is InputJsonDeltaEvent {
  return event.type === "content_block_delta" && event.delta.type === "input_json_delta";
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

  send(controller, {
    type: "done",
    report: { ...(fixture as WCSReport), domain, scanned_at: new Date().toISOString() },
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
  const tools: ToolUnion[] = [
    { type: "web_search_20250305", name: "web_search", max_uses: 10 },
    {
      name: "submit_credit_report",
      description:
        "Submit the final WebsiteCreditScore report. Call this exactly once after completing all research.",
      input_schema: WCS_REPORT_JSON_SCHEMA as unknown as Tool.InputSchema,
    },
  ];

  // Fetch the live site directly first — authoritative ground truth the agent
  // anchors on so footer-linked legal/pricing pages are never missed (search
  // indexes lag new sites). Best-effort; never blocks the scan.
  send(controller, { type: "search", query: `Reading ${domain} homepage + footer directly` });
  await updateScanProgress(scanId, { phase: "reading first-party site", searches: 0 });
  const crawl = await crawlSite(domain);
  const crawlBlock = crawlToPromptBlock(crawl);

  const anthropicStream = client.messages.stream({
    model: "claude-haiku-4-5",
    max_tokens: 32000,
    // Deterministic judgment: identical inputs → identical scores across re-scans.
    temperature: 0,
    system: [
      {
        type: "text",
        text: WCS_SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" } as { type: "ephemeral" },
      },
    ],
    tools,
    tool_choice: { type: "auto" },
    messages: [
      {
        role: "user",
        content: `Generate a WebsiteCreditScore report for: ${domain}\n\n${crawlBlock}\n\nResearch thoroughly. Use 8-10 diverse web searches before submitting. Be candid — don't hedge scores toward the middle.`,
      },
    ],
  });

  // ── Real-time event relay ───────────────────────────────────────────────
  // web_search triggers multi-turn responses server-side. We track blocks
  // across all turns using a composite key so indices don't collide.
  for await (const event of anthropicStream) {
    switch (event.type) {
      case "message_start":
        turnIndex++;
        break;

      case "content_block_start":
        if (isStreamToolBlock(event.content_block)) {
          pendingBlocks.set(`${turnIndex}:${event.index}`, {
            name: event.content_block.name,
            inputAccum: "",
          });
        }
        break;

      case "content_block_delta":
        if (isInputJsonDeltaEvent(event)) {
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
            const input = JSON.parse(block.inputAccum) as { query?: string };
            if (input.query) {
              searchCount++;
              send(controller, { type: "search", query: input.query });
              void updateScanProgress(scanId, {
                phase: "researching public sources",
                searches: searchCount,
                last_query: input.query,
              });
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
              // Never persist a partial report. A malformed tool call can make
              // a result page look complete while silently violating the rubric.
              console.error("[stream] Report validation errors:", JSON.stringify(parsed.error.issues.slice(0, 5)));
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
      "The research agent did not return a complete, verifiable report. Please run the scan again."
    );
  }

  // The scanner, not the model, owns report identity and observation time.
  // This prevents a date-only model value from implying false freshness.
  finalReport = {
    ...finalReport,
    domain,
    scanned_at: new Date().toISOString(),
  };

  // Make grades + overall the deterministic function of the dimension scores
  // (same scores → same grade/overall on every re-scan) BEFORE anything reads
  // them, so remediation thresholds and the SP handoff see canonical values.
  finalReport = normalizeReportScores(finalReport);
  finalReport = attachReportProvenance(finalReport);
  await updateScanProgress(scanId, { phase: "verifying cited sources", source_count: finalReport.sources.length });
  finalReport = await verifyReportSources(finalReport);

  // Attach the productized remediation (self-serve steps + Brainztem add-on)
  // to each weak dimension so it flows to the report UI and the SP pitch.
  finalReport = attachRemediations(finalReport);

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
    `cache_read=${usage.cache_read_input_tokens ?? 0} ` +
    `cost=$${(totalCostCents / 100).toFixed(4)}`
  );

  await saveScanResult(scanId, finalReport, {
    sourceCount: finalReport.sources.length,
    costCents: Math.round(totalCostCents * 100) / 100, // keep 2 decimal places
  });

  send(controller, { type: "done", report: finalReport });

  // Auto-build the Strategy Presentation from this scan. The report is already
  // delivered above, so awaiting here doesn't delay the UX — it just keeps the
  // serverless function alive long enough to complete the (bounded) POST.
  // Best-effort and idempotent by slug; never breaks the scan.
  try {
    const r = await autoHandoffToSP(finalReport, { source: "wcs" });
    console.log(
      `[scan/${scanId}] SP auto-handoff: ${r.ok ? `ok (${r.strategyId}, new=${r.isNew})` : `skipped: ${r.error}`}`,
    );
  } catch (e) {
    console.error(`[scan/${scanId}] SP auto-handoff threw:`, e);
  }
}

// ── Route handler ─────────────────────────────────────────────────────────
export async function GET(
  req: NextRequest,
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

        // Browser requests observe only. A POST /run dispatches an internal
        // worker request, which owns a persisted seven-minute lease.
        const workerRequest = req.headers.get("x-wcs-scan-worker") === "1";
        if (!workerRequest) {
          send(controller, { type: "waiting" });
          return;
        }

        // ── Run the leased agent ───────────────────────────────────
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
