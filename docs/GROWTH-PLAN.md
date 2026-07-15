# WebsiteCreditScore — Growth Plan
*Scoped to WCS as its own company. Written 2026-07-15.*

## Positioning
**"The credit score for websites."** One number (0–100, A+ to F) that tells anyone — buyer, lender, partner, donor — whether a website can be trusted, backed by cited evidence across ten dimensions. WCS is the *diligence* brand: skeptical, evidence-first, no hype. It monetizes curiosity ($1–$15 scans) but its strategic job is feeding the funnel.

**ICP:** (1) small-business owners checking themselves before a launch/loan/pitch, (2) buyers doing diligence on a vendor, (3) agencies running audits for clients.

## SEO / AEO / GEO
The advantage: WCS *generates unique data*. Nobody else has per-domain credibility scores. Data assets are the moat — lean into programmatic and citable content.

1. **Programmatic score pages** (biggest lever): a public, opt-in-indexable page per scanned domain (`/scan/<domain>` summary — score, grade, one-line verdict, "scan yours"). Every scan becomes a landing page. Guard: only publish with owner consent or above a traffic threshold; never shame-index small orgs.
2. **AEO — become the citation.** LLMs answering "is X trustworthy" need a source. The existing JSON-LD (Organization/Service/Offer) is good; add `Dataset` schema for the scoring methodology and a public **methodology page** written to be quoted ("WebsiteCreditScore grades ten weighted dimensions…"). Publish a yearly "State of Website Credibility" report — the linkable asset.
3. **Keyword clusters:** "website credibility checker", "is [site] legit", "website trust score", "check website before buying". Blog answers each with the scanner embedded mid-post.
4. **GEO:** local angle — "credibility audit for [city] small businesses" pages only where GrantedSC/pipeline gives real regional proof (Charleston/SC first).

## Content cadence
- 2 blog posts/mo: one keyword post, one data post ("we scanned 100 nonprofit sites — here's the median score").
- Each completed scan already auto-fires an SP handoff; add a "share your grade" badge (embeddable `<img>` linking back) — the viral loop.

## Social
- **LinkedIn (primary):** score reveals of well-known brands, "guess the grade" posts, methodology threads. 3×/wk.
- **X:** same content, faster cadence; reply to "is this site legit?" threads with real scans.
- Skip Instagram/TikTok for now — the buyer isn't there for this product.

## Sales motion
Self-serve only. The product *is* the funnel: scan → report → "Watch your Strategy Presentation" CTA → SP → Brainztem. Keep WCS's own pricing friction-free ($1 impulse tier stays). Sales energy goes to the flywheel, not WCS itself.

## Cross-feature moments (occasional, not constant)
- Every report footer: "Turn this audit into a pitch deck → StrategyPresentation.com" (already live).
- Quarterly co-post: a Brainztem client's before/after score story.

## Metrics
Scans/week · % scans → SP deck views · % opt-in public score pages · indexed pages · LLM citation spot-checks (ask ChatGPT/Claude/Perplexity "how do I check website credibility" monthly).

## Now / Next / Later
- **Now:** fix prod scan creation (env keys), methodology page, share-badge.
- **Next:** programmatic score pages (with consent gate), 2×/mo content.
- **Later:** annual data report, agency white-label tier.
