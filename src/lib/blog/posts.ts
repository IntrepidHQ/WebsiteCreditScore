export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  dimension: string;
  dimensionColor: string;
  readTime: string;
  body: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "business-legitimacy",
    title: "How We Score Business Legitimacy — And Why It's 18% of Your Grade",
    excerpt: "Legitimacy is the single most weighted dimension because everything else collapses without it. Here's what our AI actually looks for.",
    date: "April 26, 2026",
    dimension: "Business Legitimacy",
    dimensionColor: "#4ade80",
    readTime: "5 min read",
    body: `Business legitimacy is the foundation of every other trust signal. An outstanding review profile means nothing if we can't verify the company behind it is real. That's why it carries the heaviest weight — 18% of the overall grade.

## What "legitimacy" actually means

A legitimate business isn't just one that isn't a scam. It's a business with verifiable identity: a real name, a real address, real people, and verifiable registration in the jurisdictions where it operates.

Our AI looks for:

**Business registration records.** State and country-level registration databases are public. For US companies, we check Delaware, California, and other common incorporation states. For international businesses, we cross-reference Companies House (UK), ASIC (Australia), and equivalent authorities.

**BBB accreditation status.** The Better Business Bureau isn't perfect, but an A+ accreditation with zero unresolved complaints is a meaningful signal. An F rating or no profile at all tells a different story.

**Physical address verification.** We cross-reference the address shown on the website with Google Maps, government filings, and review platforms. Addresses that resolve to mailbox forwarding services, shared office suites with no staff, or residential homes (for businesses that shouldn't be home-based) all affect the score.

**Contact information consistency.** A legitimate business has the same phone number, address, and company name across Google Business Profile, their website, Yelp, and industry directories. Inconsistency is a red flag.

**Named, verifiable leadership.** Who runs this company? Can you find them on LinkedIn with a history that makes sense? Anonymous founders aren't automatically disqualifying, but they do lower the score.

## The most common legitimacy failures we see

1. **No business registration found.** Surprisingly common among solo operators who started a website before legally incorporating. This doesn't mean fraud — but it does mean the business is operating informally, which matters for B2B buyers.

2. **Address resolves to a UPS Store.** A mailbox address is fine for small businesses, but when it's presented as a corporate headquarters, it's misleading.

3. **Founders with no verifiable history.** If the "About" page shows names but LinkedIn profiles don't exist, or the LinkedIn shows a two-week tenure with no prior work history, that's a flag.

4. **No contact phone number.** In 2026, a business with no way to call them — only a contact form — is hiding something. It might just be a small team that prefers email, but it reduces the legitimacy score.

## What a perfect legitimacy score looks like

The businesses we've scored at 99/100 for legitimacy share a common profile: publicly traded or widely recognized, with decades of public filings, named executives with extensive press records, and multiple independent verification sources that all agree on who the company is.

For smaller businesses, a high legitimacy score means: registered LLC or corporation, consistent presence across all platforms, named owner or management team with real histories, and a verifiable physical location.

## What you can do right now

If your legitimacy score is low, the fastest fixes are:
- Incorporate your business legally if you haven't already
- Claim and complete your Google Business Profile
- Add a team page with real names and LinkedIn links
- Ensure your address, phone, and company name are identical across every platform
- Register with the BBB (free, and the profile alone is a signal)

Legitimacy improvements take time to propagate across the web, but they're permanent once established.`,
  },
  {
    slug: "online-reputation",
    title: "Reading Between the Lines: How to Interpret Online Reviews",
    excerpt: "Review volume and star rating are only the beginning. Here's how our AI reads the real signal in your review profile.",
    date: "April 25, 2026",
    dimension: "Online Reputation",
    dimensionColor: "#60a5fa",
    readTime: "6 min read",
    body: `Online reputation (15% of the overall grade) is one of the most nuanced dimensions to score. A raw star average is almost meaningless without context. Our AI goes deeper.

## What we actually read

We search across Google Reviews, Trustpilot, Yelp, BBB complaint history, Reddit, Glassdoor, and industry-specific platforms. The goal isn't to find the average star rating — it's to understand the *nature* of the complaints and the *pattern* of positive reviews.

**Sentiment composition matters more than stars.** A business with 4.2 stars where 90% of reviews are 5-star and 10% are 1-star (bimodal) is very different from one with 4.2 stars spread evenly across 3–5 stars. The bimodal pattern often means the business is polarizing — great for some customers, terrible for others. The why matters.

**Recency and volume trends.** A business with 500 reviews averaging 4.6 stars *five years ago* and 20 reviews in the past year averaging 3.1 is in a different position than one with consistent growth. Reputation decay is a real signal.

**Nature of complaints.** Scam complaints, fraud allegations, undelivered products, and data breaches are categorically different from "the service was slower than expected" or "pricing is too high." Our AI distinguishes severity.

**Owner response patterns.** Do they respond to negative reviews? Do they respond defensively or constructively? A business that replies thoughtfully to criticism gets credit; one that ignores or threatens reviewers does not.

**Reddit and forum mentions.** Reddit is the most honest review platform because it's harder to game. A search for "[brand] reddit" often surfaces experiences that would never appear on a managed review platform.

## The review manipulation problem

Our AI is specifically trained to flag suspicious review patterns:
- Large volumes of 5-star reviews with identical phrasing
- Review spikes after long gaps in activity
- Reviews from accounts with no other history
- Reviews that read as promotional copy rather than personal experience

A business with 300 reviews that appear organic scores better than one with 3,000 that pattern-match to a purchased review campaign.

## What a strong reputation score looks like

High-scoring businesses have: consistent review volume over time, a realistic distribution of stars (no business is 100% five-star), genuine negative reviews that are responded to well, active Reddit and forum presence without major controversy, and BBB accreditation with zero unresolved complaints.

## Improving your reputation score

The fastest way to improve reputation is to make it easier for happy customers to leave reviews. Most dissatisfied customers review without being asked; most satisfied ones don't.

A simple post-service email asking for a Google review — sent within 48 hours of service completion — can double review volume within six months. Genuine volume from real customers dilutes the impact of bad-faith negative reviews and creates a more accurate picture.`,
  },
  {
    slug: "visual-design",
    title: "Visual Design Is a Trust Signal, Not Just Aesthetics",
    excerpt: "Visitors decide whether to trust your site in 50 milliseconds. Visual design is how you spend those 50 milliseconds wisely.",
    date: "April 24, 2026",
    dimension: "Visual Design",
    dimensionColor: "#818cf8",
    readTime: "5 min read",
    body: `Visual design carries 14% of the WebsiteCreditScore — the third heaviest weight. This surprises people who think of design as subjective. It's not. Design quality is measurable, and it correlates strongly with conversion, trust, and retention.

## Why design is a credibility signal

The research is consistent: users form an opinion about a website's trustworthiness within 50 milliseconds — before they've read a single word. That first impression is entirely visual.

A well-designed site signals that a real business with real resources is behind it. It says: we care enough to invest in how we look. Conversely, a site with stock photos, mismatched fonts, low-contrast text, and broken layouts signals the opposite — even if the underlying business is excellent.

## What our AI evaluates

Our AI uses search data, review mentions, and observable site structure to assess:

**Visual hierarchy.** Does the page guide the eye? Is it clear what matters most? A page where everything competes for attention equally is a page where nothing converts.

**Brand consistency.** Colors, typography, imagery style, and voice should be consistent from the homepage to the checkout page. Inconsistency signals amateur construction or a site that's been patched together over time.

**Photography and imagery quality.** Stock photos that look like stock photos actively reduce trust. Original photography, even if imperfect, performs better. Product photography with plain backgrounds is almost always better than lifestyle shots that don't show the product clearly.

**Typography.** Font choices and sizing hierarchy are strong credibility indicators. Serif fonts communicate authority and tradition; sans-serif communicates modernity and clarity. Neither is wrong — but misuse is obvious.

**White space.** Design that's afraid of empty space looks cluttered and cheap. White space is expensive in the sense that it requires confidence — confidence that what's there is enough.

## The common visual failures we score against

1. **Hero images with text overlaid on busy backgrounds.** Unreadable headlines are a conversion killer.
2. **Too many competing CTAs above the fold.** One primary action per screen.
3. **Low-contrast text.** WCAG AA minimum (4.5:1 contrast ratio) is a floor, not a ceiling.
4. **Stock photos of handshaking businesspeople.** This is a trust killer in 2026.
5. **Inconsistent corner radii and shadow styles.** Small inconsistencies signal a site built by committee without a design system.

## What a high visual design score looks like

Apple.com (99/100) is the obvious example — every pixel intentional, zero visual noise, product photography that makes you want to touch the screen. But smaller businesses can score 90+ without Apple's budget by focusing on: one strong hero image, a clear visual hierarchy, consistent brand colors and typography, and enough white space to breathe.

The standard we're measuring against is "does this look like a business I would trust with my money?" — not "is this beautiful?"`,
  },
  {
    slug: "ux-conversion",
    title: "The Conversion-Killing UX Mistakes That Make Buyers Bounce",
    excerpt: "UX and conversion aren't about clever design tricks. They're about removing friction from the path between intent and action.",
    date: "April 23, 2026",
    dimension: "UX / Conversion",
    dimensionColor: "#f7b21b",
    readTime: "6 min read",
    body: `UX and conversion (12% weight) is the dimension that most directly connects to revenue. A site can look stunning and still convert terribly if the path from intent to action has unnecessary friction.

## What we evaluate

**Navigation clarity.** Can a first-time visitor find what they're looking for in three clicks? Navigation that requires familiarity with your internal company structure fails new visitors. Navigation should be organized around what users want, not how the company is organized.

**CTA placement and clarity.** Every page should have one clear primary action. "Get Started," "Book a Call," "Buy Now" — whatever it is, it should be obvious, above the fold where possible, and not competing with four other CTAs.

**Form friction.** Forms are where conversions die. Every unnecessary field reduces completion rate. "Name, email, phone, company, role, message, and how did you hear about us?" is seven fields too many for a first contact form. Name and email is almost always enough.

**Mobile experience.** In 2026, more than 60% of web traffic is mobile. A site that works on desktop but breaks on mobile has disqualified itself from the majority of potential customers. We evaluate mobile UX specifically.

**Load performance.** Google's PageSpeed Insights is one of our inputs. A site that takes 6 seconds to load on mobile loses most users before they see a word. Core Web Vitals (LCP, CLS, FID) are evaluated.

**Checkout flow.** If you sell anything, how many steps are between "I want this" and "I've paid"? Every step is a dropout opportunity. Apple Pay, PayPal, and similar one-click checkout options reduce friction dramatically.

## The UX mistakes that kill conversions

1. **No clear next step after reading.** Every page should answer "what do I do now?" with a visible CTA.
2. **Auto-playing video or audio.** This is still a conversion killer in 2026.
3. **Modal popups in the first three seconds.** "Sign up for our newsletter!" before the user has read anything destroys UX scores.
4. **Pricing hidden behind a contact form.** "Request a quote" when pricing could be published costs you every buyer who won't waste their time.
5. **Checkout that requires account creation.** Guest checkout is non-negotiable for first purchases.

## Mobile experience specifically

A mobile UX audit looks at:
- Does the page reflow correctly on a 390px viewport?
- Are tap targets at least 44px × 44px?
- Is text readable without zooming?
- Does the form work with mobile keyboards?
- Do CTAs remain visible and tappable?

## Improving your UX score

The highest-ROI UX improvements:
1. Add a persistent sticky CTA bar on mobile
2. Remove optional fields from contact and checkout forms
3. Run your site through PageSpeed Insights and fix the top three issues
4. Test your checkout flow on a real mobile device — not an emulator`,
  },
  {
    slug: "transparency",
    title: "The Transparency Gap: What Hidden Fees and Missing Policies Cost You",
    excerpt: "Buyers have more options than ever. The businesses that win are the ones that make it easy to understand exactly what they're buying.",
    date: "April 22, 2026",
    dimension: "Transparency & Disclosure",
    dimensionColor: "#34d399",
    readTime: "5 min read",
    body: `Transparency (10% weight) is increasingly a competitive differentiator. In a market where buyers can easily compare three options in the time it takes to read a single page, opacity is a conversion killer.

## What transparency actually means

Transparency isn't about publishing your internal financials or your team's salaries. It means giving potential buyers the information they need to make a confident decision — without having to ask.

**Pricing.** This is the single biggest transparency differentiator. "Contact us for pricing" in 2026 filters out every buyer who values their time. Even if your pricing is complex and situational, a starting price or "from $X" gives visitors a ballpark that respects them.

**Refund and cancellation policy.** Can I get my money back if this doesn't work? How long do I have? What's the process? This should be on the page before the buy button, not buried in the terms.

**Privacy policy.** A real privacy policy — not a boilerplate from a 2009 generator — explains what data you collect, why, and what you do with it. GDPR compliance is a floor; genuine clarity is the goal.

**Terms of service.** What are the rules of the relationship? What are you responsible for? What are they responsible for? Short, clear terms score higher than impenetrable legal documents.

**Ownership and team.** Who runs this company? "About" pages that list the founders with real names and backgrounds are consistently associated with higher conversion. Anonymous businesses ask for trust they haven't earned.

## What low transparency scores look like

We've scored businesses with beautiful websites and strong reputations who score in the 60s on transparency because:
- No published pricing anywhere on the site
- "Terms of service" link returns a 404
- Privacy policy was last updated in 2017
- No named founders or leadership anywhere
- Refund policy: "All sales final" in 8pt text at the bottom of the checkout page

## The transparency paradox

The businesses most afraid to be transparent are often the ones who would benefit most from it. If your pricing is higher than competitors, transparency lets you explain why — and that explanation often wins the sale. If your refund policy is generous, publishing it converts more buyers than hiding it would.

Hiding pricing doesn't protect you from price-sensitive buyers. It just ensures you only talk to the buyers most likely to waste your time.

## Improving your transparency score

- Publish pricing or at least "starting from" anchors
- Add a clearly named "Refund Policy" page
- Update your privacy policy to reflect current data practices
- Add a named leadership team to your About page
- Ensure all legal page links in the footer are live`,
  },
  {
    slug: "technical-health",
    title: "Why Your Website's Technical Health Is a Credibility Signal",
    excerpt: "HTTPS, load speed, and uptime aren't just IT concerns. They're signals that buyers read — even when they don't know they're reading them.",
    date: "April 21, 2026",
    dimension: "Technical Health",
    dimensionColor: "#fb923c",
    readTime: "4 min read",
    body: `Technical health (8% weight) is the most objective dimension we score. The signals are binary or numeric — A+ SSL grade or not, 2-second load time or 8-second, 99.9% uptime or 94%. There's no ambiguity.

## The technical signals we evaluate

**HTTPS and SSL certificate quality.** HTTPS is table stakes. But we go further — SSL Labs grades SSL configuration from A to F based on cipher suite strength, certificate validity, and protocol support. An A+ SSL rating indicates a site that has taken security seriously beyond the minimum requirement.

**HSTS (HTTP Strict Transport Security).** This tells browsers to never connect to the domain over unencrypted HTTP. Combined with HSTS preloading (where the domain is hardcoded into browsers as HTTPS-only), it's a strong signal of security investment.

**Load speed and Core Web Vitals.** We use PageSpeed Insights data where available. Google's Core Web Vitals — Largest Contentful Paint (LCP), Cumulative Layout Shift (CLS), and Interaction to Next Paint (INP) — are our primary metrics. LCP under 2.5 seconds is good; under 1.5 seconds is excellent.

**Uptime history.** A business that runs its own status page (like statuspage.io) and publishes uptime history is a business that understands and takes responsibility for reliability. We factor in publicly available uptime data and mentions of outages in reviews.

**Security headers.** Content-Security-Policy, X-Frame-Options, and X-Content-Type-Options headers indicate a site that has been configured with security in mind. Their absence indicates a default or minimal installation.

## Why technical health signals trust

Here's what buyers don't know they know: when a page takes 8 seconds to load on mobile, they don't think "slow server." They think "unprofessional." When a browser shows a security warning, they don't think "expired certificate." They think "this site might not be safe."

Technical failures create visceral distrust that rational arguments can't overcome. A well-designed, legitimate business that serves its site over HTTP in 2026 loses sales to competitors who haven't.

## The most common technical failures

1. **Mixed content warnings.** Images or resources served over HTTP on an otherwise HTTPS page.
2. **No SSL at all.** Still more common than you'd think, particularly for older small business sites.
3. **Unoptimized images.** A 4MB hero image loaded on mobile is a conversion killer.
4. **No CDN.** Serving a website from a single server in one region creates high latency for visitors elsewhere.
5. **Broken links.** 404s throughout the site signal neglect.

## Improving technical health

- Run your site through SSL Labs and fix any issues below an A rating
- Install Google Search Console and monitor Core Web Vitals
- Compress and lazy-load images (most CMSs have plugins that do this)
- Add a CDN if you're not using one (Cloudflare's free tier is excellent)
- Set up a status page or uptime monitor (UptimeRobot is free)`,
  },
  {
    slug: "content-quality",
    title: "Thin Content vs. Expert Writing: How Claude Tells the Difference",
    excerpt: "In an era of AI-generated everything, genuine expertise is more visible — and more valuable — than ever before.",
    date: "April 20, 2026",
    dimension: "Content Quality",
    dimensionColor: "#f472b6",
    readTime: "5 min read",
    body: `Content quality (8% weight) is harder to score than technical health but more consequential. Bad content signals a business that doesn't understand what it does — or doesn't care enough to explain it well.

## What makes content "thin"

Thin content is content that exists to occupy space without providing value. It's recognizable by:

- Generic claims ("we deliver excellence in everything we do")
- No specifics (no prices, no timelines, no process descriptions)
- No evidence (no case studies, no client names, no numbers)
- Vague calls to action ("learn more" with no destination)
- AI-generated paragraphs that flow smoothly but say nothing

In 2026, with every business able to generate unlimited content with AI, thin content has become the baseline. The differentiator is expertise — writing that could only come from someone who has actually done the thing.

## What we look for

**Specificity.** "Our plumbers have 10+ years of experience" is thin. "Our licensed master plumbers have installed over 2,400 water heaters in King County since 2014" is specific. Specificity is expertise.

**Evidence.** Claims should be backed by something. Case studies, testimonials with full names, before/after photos, numbered results. Anything that says "we're telling you this because we can prove it."

**Depth where depth matters.** Product pages for complex products should explain how the product works, what problem it solves, who it's for, and what differentiates it from alternatives. Surface-level descriptions of complex offerings signal that the author doesn't understand them.

**Voice consistency.** Does the blog sound like the same company as the homepage? Inconsistent voice is a common sign of either team turnover or outsourced content that hasn't been edited.

**Original research or methodology.** The highest-scoring content is proprietary — results from studies the company ran, methodologies they developed, data only they have. This content can't be replicated by a competitor and can't be generated by AI.

## The AI content problem

Our AI is specifically calibrated to assess content that was itself AI-generated. The patterns are recognizable: perfect paragraph structure, balanced considerations, a "however" or "that said" every few paragraphs, and a complete absence of first-person expertise or genuine opinions.

We don't automatically penalize AI-assisted content — AI-drafted, human-edited content at a high standard scores well. But content that reads as entirely machine-generated without editorial judgment typically scores in the 50-65 range for content quality.

## Improving your content score

1. Add one case study per quarter — real client, real problem, real result, real numbers
2. Rewrite your homepage hero to include one specific claim your competitors can't copy
3. Add a FAQ that answers the questions your sales team actually gets
4. Write one blog post per month from your own expertise, not from research
5. Put a named author on every blog post`,
  },
  {
    slug: "social-presence",
    title: "The Ghost Account Problem: Why Inactive Social Profiles Hurt Your Credibility",
    excerpt: "An abandoned LinkedIn page isn't just missed opportunity. It's an active trust signal — the wrong kind.",
    date: "April 19, 2026",
    dimension: "Social & Press Presence",
    dimensionColor: "#38bdf8",
    readTime: "4 min read",
    body: `Social presence (7% weight) is the dimension most businesses underestimate in both directions. Many treat social media as a marketing obligation to be minimally fulfilled; others over-index on vanity metrics that don't signal real presence.

## The ghost account problem

A LinkedIn company page with 43 followers and the last post from 2021 is not a neutral signal. It actively communicates: this business started building a presence and then stopped. Either the company is no longer growing, no longer cares about its public profile, or the principals are gone.

A business with no social presence at all is in a slightly better position than one with ghost accounts, because at least it's not actively contradicting its claims of being an active, growing operation.

## What we look for

**LinkedIn.** For B2B businesses, LinkedIn is the primary social credibility platform. A complete company page, employee count visible (even if small), recent posts (at least quarterly), and named leadership with real personal profiles all contribute to the score.

**X / Twitter.** Industry and audience dependent. For SaaS, fintech, and technology companies, active X presence is a meaningful signal. For local service businesses, it's less relevant.

**YouTube.** For service businesses, educational content on YouTube is increasingly a trust builder. Businesses with consistent YouTube presence — especially content that demonstrates expertise rather than sells — score higher.

**Google Business Profile.** Not traditionally considered "social," but for local businesses it's the most important public presence outside the website itself. A complete, claimed GBP with photos, hours, and active review responses is a significant signal.

**Press mentions.** Has this company been written about by anyone other than themselves? Trade publications, local news, national outlets — all of these contribute. PR isn't just for enterprise; a local business mentioned in a regional paper scores higher than one that has never appeared in any press.

## What strong social presence looks like

High-scoring businesses share a common pattern: they show up consistently in the same voice across all platforms, their leadership is visible and engaged, and third parties have written about them without being paid to do so.

They don't necessarily have millions of followers. A software company with 12,000 LinkedIn followers and active engagement scores better than one with 200,000 followers and no comments.

## Improving your social score

- Claim and fully complete your Google Business Profile today
- Post once per week on LinkedIn (company updates, not just blog shares)
- Get at least one media mention per quarter (press release, podcast interview, or industry association event)
- Follow up with journalists who cover your industry — introduce yourself before you need coverage`,
  },
  {
    slug: "longevity",
    title: "Why Domain Age Still Matters (And What New Sites Should Do)",
    excerpt: "A business that has been operating for ten years has proven something. Our AI knows how to read the digital history of any domain.",
    date: "April 18, 2026",
    dimension: "Domain & Company Longevity",
    dimensionColor: "#a78bfa",
    readTime: "4 min read",
    body: `Longevity (5% weight) is a background signal — less directly actionable than transparency or UX, but meaningful as a risk indicator. Time in operation is proof that a business survived long enough to keep operating.

## What we look at

**Domain registration date.** WHOIS records show when a domain was first registered. A domain registered in 2008 that is still active has 18 years of history. A domain registered last month has none.

**Wayback Machine history.** The Internet Archive's Wayback Machine crawls and stores website versions going back to 1996. A business that shows consistent website history — even if the design has changed dramatically — demonstrates continuous operation. Gaps in archive history (periods where the site was down or a parked page) are noted.

**Ownership changes.** WHOIS history can show if a domain has changed hands. A recently transferred domain in an otherwise old registration is a potential flag — new owners can buy established domains to inherit trust signals.

**Business founding date vs. domain registration.** We look for consistency. If a company says they were founded in 2005 but their domain was registered in 2019, we want to know why.

**Glassdoor and LinkedIn company age.** Independent signals of how long the company has been employing people.

## Why new businesses are higher risk

This is arithmetic, not prejudice. A business that started last month hasn't had time to accumulate the problems that would make it score low on reputation or legitimacy. That's not a credit to the business — it's an absence of evidence.

New businesses genuinely are higher risk for buyers. The WHOIS record being three months old doesn't mean the company is dishonest — but it does mean you're trusting a company that hasn't yet been tested by time, adversity, or growth.

## What new businesses should do

A new business can't buy longevity. But it can build compensating signals:
- **Make your founders maximally visible.** If the business is new, the founders' prior history is the longevity signal. A founder with 15 years of LinkedIn history in the industry is a different risk than an anonymous new company.
- **Show your incorporation date and founding story.** Transparency about being new is better than hiding it.
- **Accumulate reviews aggressively from day one.** Early real reviews establish a track record faster than almost anything else.
- **Publish a blog from the beginning.** A consistent content archive is an alternative longevity signal.

The longevity dimension penalizes new businesses slightly, but it's a 5% weight. Strong scores in legitimacy, reputation, transparency, and visual design can more than compensate.`,
  },
  {
    slug: "financial-signals",
    title: "Reading the Financial Signals Behind Any Business Website",
    excerpt: "You don't need access to a company's books to read their financial health. The signals are everywhere, if you know what to look for.",
    date: "April 17, 2026",
    dimension: "Financial Signals",
    dimensionColor: "#facc15",
    readTime: "5 min read",
    body: `Financial signals (3% weight) is the smallest dimension but potentially the most informative for certain buyer decisions. Before you sign a multi-year contract or make a large purchase, understanding the financial health of the business matters.

## What we look for

**Funding history.** For startups and growth companies, public funding rounds are strong signals. Crunchbase, TechCrunch, and similar publications document most meaningful investment rounds. A company that raised a $10M Series A 18 months ago is in a different position than a bootstrapped company of similar size.

**Revenue signals.** Private companies aren't required to publish revenue. But they often reveal it in press interviews ("we're tracking to $5M ARR"), case studies ("helped a $50M/year company"), and job postings ("experience with $10M+ revenue teams"). Our AI aggregates these signals.

**Financial press coverage.** Has this company been covered in financial context? Profiles in the WSJ or Bloomberg that mention revenue, valuation, or growth are strong signals.

**Hiring patterns.** A company that is consistently hiring across multiple departments is likely growing. A company with no job postings for 18 months may be in a holding pattern. LinkedIn can reveal this even for private companies.

**Financial distress signals.** We specifically look for layoff announcements, executive departures, debt restructuring mentions, vendor complaint patterns (suggesting unpaid bills), and real estate downsizing.

**Public company data.** For publicly traded companies, we have access to quarterly earnings, 10-K filings, and analyst coverage. These are the most reliable financial signals available and always push the score toward the top.

## Why this matters for buyers

If you're evaluating a vendor for a multi-year software contract, you need to know if they'll still be operating in three years. If you're considering a partnership, their financial stability affects yours.

Financial signals don't need to be perfect — most healthy private companies score in the 70-85 range simply because the information is limited. The red flags are specific: public layoff announcements, debt collections, executive team departures without explanation, and sudden reduction in digital presence (website not maintained, social accounts abandoned).

## The most actionable insight

For most buyers, financial signals is a "nothing weird here" check rather than a positive differentiator. A company that scores 70+ on financial signals passes the basic test. A company that scores below 50 has specific red flags that should be investigated before making a commitment.

For investment or high-stakes partnership decisions, supplement our score with a formal credit check or D&B profile.`,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
