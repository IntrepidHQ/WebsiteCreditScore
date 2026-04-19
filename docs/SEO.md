# SEO Strategy

This doc defines the keyword taxonomy, editorial calendar, and on-page rules the site uses to rank in traditional search **and** AI assistants (ChatGPT, Perplexity, Gemini). It is a working document; update it when new clusters are added or when rankings shift.

## Keyword clusters

Four clusters, 15 tracked terms. Each cluster has a pillar page; supporting articles link back to the pillar with descriptive anchor text.

### 1. Website credit score (head terms)

- website credit score
- website health score
- site quality score checker

**Pillar:** `/` (home) — the concept page.
**Intent:** awareness / definition.
**Notes:** highest-volume set. Branded home page + the trend article "What a Website Credit Score actually measures in 2026" are the primary ranking surfaces.

### 2. Website audit tools (long-tail)

- free website audit tool
- AI website audit
- website UX audit checklist
- small business website audit

**Pillar:** `/docs/trends/website-audit-checklist-2025`.
**Intent:** evaluation / comparison.
**Notes:** buyer-intent traffic. Supporting articles go deep on specific audit dimensions (mobile, trust, accessibility). Every supporting article closes with a CTA to run a live scan.

### 3. AI search readiness / GEO

- AI search readiness score
- LLM SEO optimization
- generative engine optimization checklist
- how to rank in ChatGPT

**Pillar:** `/docs/trends/ai-search-readiness-checklist-2026`.
**Intent:** education / implementation.
**Notes:** competitive set is still forming in 2026. First-mover advantage is meaningful. Publish original frameworks and primary data — models quote original sources more than summaries.

### 4. Agency workflows

- freelance web audit packet
- website audit report template for clients
- how agencies price website audits
- white-label website audit report
- website redesign sales pitch

**Pillar:** `/docs/trends/freelance-web-audit-pricing-top-1-percent`.
**Intent:** monetization / workflow.
**Notes:** agency readers have high LTV because they run scans on behalf of multiple clients. Supporting articles translate audit findings into sales conversations.

## 30-article editorial calendar

Eight articles per cluster over the first six months, plus two evergreen connectors that link across clusters. Cadence: two articles per week for weeks 1-15, one per week for weeks 16-30. Each article targets one primary keyword and two to three secondary keywords.

### Month 1 (weeks 1-4)

Focus: cluster 1 + cluster 2 pillars locked in.

1. What a Website Credit Score actually measures in 2026 *(published)*
2. The Complete Website Audit Checklist for Designers and Agencies *(published)*
3. The 12 Trust Signals That Separate 8-Score Sites from 5-Score Sites *(published)*
4. Website Score Benchmarks by Industry: What Does Good Actually Look Like? *(published)*

### Month 2 (weeks 5-8)

Focus: cluster 3 (GEO) launch, cluster 4 first pieces.

5. AI Search Readiness: The 12-Point Checklist for LLM-Visible Sites *(published)*
6. Generative Engine Optimization (GEO): Beyond Traditional SEO *(published)*
7. Freelance Web Audit Pricing: What the Top 1% of Agencies Charge *(published)*
8. From Score to Sale: Turning a Website Audit Into a Redesign Pitch *(published)*

### Month 3 (weeks 9-12)

9. Schema.org for SaaS: The FAQPage and Product markup that actually surfaces in AI
10. The Hidden Trust Cost of Cookie Banners (and what converts better)
11. Mobile-First Isn't Optional: How Small Screens Drive Conversion Losses *(published)*
12. Why Your First Screen Loses 70% of Visitors Before They Scroll *(published)*

### Month 4 (weeks 13-16)

13. The 9-Minute Website Audit That Beats 2-Hour Manual Reviews *(published)*
14. How to Write a Website Redesign Brief That Gets Sign-Off *(published)*
15. White-label audit reports: branding, pricing, and delivery
16. Proof beats polish: quantified testimonials that actually convert

### Month 5 (weeks 17-20)

17. GEO for service businesses: the five pages that get cited first
18. Core Web Vitals and AI retrieval: the overlap nobody talks about
19. The accessibility floor: what WCAG failures cost in 2026
20. Keyword-readiness vs traditional SEO: why both matter

### Month 6 (weeks 21-24)

21. Audit pricing tiers: $500 vs $2,500 vs $9,000 — what you actually deliver
22. Writing recommendations clients can act on (not just findings)
23. The compounding cost of third-party scripts
24. How to quantify redesign ROI without guessing

### Weeks 25-30 (one per week)

25-30: Evergreen connectors + seasonal content (end-of-year audits, Q1 budget planning, etc.).

## Pillar page map

| Cluster | Pillar URL | Supporting articles |
| --- | --- | --- |
| Website credit score | `/` | Articles 1, 4 |
| Website audit tools | `/docs/trends/website-audit-checklist-2025` | Articles 2, 3, 11, 12, 14 |
| AI search / GEO | `/docs/trends/ai-search-readiness-checklist-2026` | Articles 5, 6, 9, 17, 18 |
| Agency workflows | `/docs/trends/freelance-web-audit-pricing-top-1-percent` | Articles 7, 8, 13, 15, 16, 21, 22 |

## On-page checklist (every article)

- Title ≤ 60 characters, primary keyword in first 40.
- One H1, descriptive H2s, nested H3s where needed.
- Opening two sentences stand alone as a quotable answer.
- At least one definition, one quotable statistic, one list — the shapes LLMs prefer.
- Meta description ≤ 160 characters, benefit-focused, includes primary keyword.
- At least 3 internal links to other articles / the pillar, using descriptive anchor text.
- At least 1 external link to an authoritative primary source.
- Publication date + last-updated date visible on page.
- Author byline with credentials.
- Structured data: `Article` + `BreadcrumbList`. `FAQPage` when the article has a Q&A section.
- Open Graph image verified (default from `src/app/opengraph-image.tsx` is sufficient).

## Backlink tactics

1. **HARO / Qwoted / SourceBottle** — three pitches per week on audit/SEO/agency topics. Target publications with DR 40+.
2. **SaaS roundup outreach** — pitch inclusion in "best website audit tools 2026" style roundups. Offer free scans of the roundup author's site as a hook.
3. **Partner agencies** — cross-link with agency blogs whose audience is our ICP. Exchange guest posts; avoid obvious link trades (search engines and LLMs both penalize these).
4. **Primary research publications** — commission or produce one primary research study per quarter (e.g., "What we found scanning 10,000 small-business websites"). Primary data compounds citations faster than any other tactic.
5. **Podcast guesting** — targeted outreach to agency-owner and freelancer podcasts. Each appearance yields 1-3 backlinks and direct audience exposure.

## KPIs

Tracked weekly. Targets are 12-month trajectories.

| Metric | Source | 12-month target |
| --- | --- | --- |
| Google Search Console impressions | GSC | 250k+ monthly |
| GSC CTR (avg) | GSC | 3.5%+ |
| Top-10 ranking keyword count | GSC / Ahrefs | 120+ |
| Referring domains | Ahrefs | 300+ |
| AI assistant citations (manual sample) | Manual | 8+ citations in monthly top-25 query sample |
| AI referral sessions | Analytics | 2,000+ monthly |

## Review cadence

- **Weekly:** GSC impressions + CTR review, new article published.
- **Monthly:** Manual AI citation sample (top 25 queries × 3 assistants), backlink audit, keyword rank movement.
- **Quarterly:** Cluster rebalance — shift cadence toward clusters that are compounding; deprecate articles that haven't moved.
