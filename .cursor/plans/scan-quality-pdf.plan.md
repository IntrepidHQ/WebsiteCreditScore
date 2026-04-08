---
name: Scan quality and PDF excellence
overview: Treat the client packet PDF as a first-class print medium (not a shrunken web page). Fix typography, contrast, and browser-print artifacts; harden live screenshots; make AI impact visible. Email attachment is manual—the deliverable is a PDF worth attaching.
todos:
  - id: pdf-print-medium
    content: "PDF as print medium: token reset, print-specific type scale, tame eyebrow letter-spacing, explicit dark text on white"
  - id: pdf-chrome
    content: "Document or eliminate browser print headers/footers; optional server-side PDF path for zero-chrome exports"
  - id: browserless-hardening
    content: "Tune Browserless (waitUntil, delays, retries) + sample fallbacks for fragile hosts"
  - id: ai-provenance
    content: "Validate Anthropic model ID; surface when AI copy is applied"
  - id: verify-pdf
    content: "Manual export checklist on packet route; spot-check Claude.com-style report"
---

# Scan quality and PDF excellence

## Product goal

The **packet PDF** is the artifact prospects receive (you attach it yourself). It must read as a **deliberate print document**: clear hierarchy, high contrast, comfortable line length, and **no reliance on dark-mode or web-only styling**. This is not “the website, but printed.”

## Evidence from sample PDF (Claude.com packet)

Text extraction from the exported PDF showed:

- **Eyebrow labels** render as extreme spaced caps (e.g. `W E B S I T E R E V I E W`) — web `letter-spacing` / tracking is too aggressive for print; looks unprofessional in PDF.
- **Browser print chrome** appears in the file (date/time, page URL, page x of y) — comes from the **browser print dialog** (headers/footers), not from the app. The plan should either document “disable headers and footers when saving to PDF” and/or add a **server-generated PDF** path so exports never include that noise.
- Layout still feels like **web density** squeezed onto paper rather than a tuned print grid.

## Design direction (print-specific)

- **Typography**: Fixed print scale (e.g. 10–12pt body, clear H1/H2 steps); reduce or remove wide tracking on print for eyebrow labels (`print:tracking-normal`, tighter uppercase).
- **Color**: Explicit near-black body text (`slate-900` / `#0f172a`) and muted secondary text on white; do not depend on `--foreground` from theme in print.
- **Structure**: Page 1 = identity + screenshot + scores + executive summary; following pages = findings and scope; use `break-inside: avoid` on cards already partially there — extend where needed.
- **Margins**: Keep `@page` margins; ensure `html`/`body`/main backgrounds are white in print (already partly in `globals.css`) and **reset theme CSS variables** in `@media print` so no light-on-white titles.

## Technical work (aligned with prior plan)

| Priority | Item |
|----------|------|
| P0 | Global **`@media print` CSS variable overrides** to light document tokens + patch [`packet-document.tsx`](src/features/audit/components/packet-document.tsx) headings/body that still use `text-foreground` without `print:` overrides. |
| P0 | **Eyebrow / label typography** for print: less letter-spacing; optional slightly smaller caps for PDF. |
| P1 | **Browserless** in [`site-screenshot.ts`](src/lib/utils/site-screenshot.ts): relax `networkidle0`, add delays/retries per [Browserless screenshot API](https://docs.browserless.io). |
| P1 | Sample **fallback images** for fragile URLs (e.g. Mark Deford) in [`sample-audits.ts`](src/lib/mock/sample-audits.ts). |
| P2 | **Anthropic**: verify model id in [`site-analysis.ts`](src/lib/ai/site-analysis.ts); optional provenance flag when AI copy is applied. |
| P2 | **Clean PDF export**: optional future route using Browserless **`/pdf`** (or similar) to generate PDF **without** browser header/footer — only if browser-only print remains unacceptable after CSS fixes. |

## Out of scope

- Automating email send or attachment — **not required**; attachment is manual.

## Verification

- Export packet with print preview: **no** light gray titles on white; eyebrows readable; **uncheck** headers/footers once to confirm remaining issues are app-side vs browser.
- Optional: add a short **“Export tips”** line in [`PacketToolbar`](src/features/audit/components/packet-toolbar.tsx) (one sentence: turn off headers/footers in the print dialog) until server PDF exists.
