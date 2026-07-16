import type { BlogPost } from "./types";

/**
 * Launch posts — long-form, search-intent articles published July 2026.
 * These sit ahead of the dimension explainers on the blog index.
 */
export const LAUNCH_POSTS: BlogPost[] = [
  {
    slug: "from-credibility-score-to-sales-pitch",
    title: "From Credibility Score to Sales Pitch: What to Do the Day After Your Audit",
    excerpt: "An audit report you don't act on is just a grade. Here's the day-after playbook: triage the findings, ship the quick wins, and turn the evidence into a pitch.",
    date: "July 15, 2026",
    dimension: "Growth Playbook",
    dimensionColor: "#38bdf8",
    readTime: "8 min read",
    author: "Hans Turner",
    related: ["website-trust-scores-explained", "how-to-improve-website-trust-score", "why-your-website-looks-untrustworthy"],
    faq: [
      {
        question: "What should I fix first after a website credibility audit?",
        answer: "Fix the failures a stranger can see in the first ten seconds: security warnings, broken links, missing policy pages, and anonymous ownership. These are cheap to fix and carry outsized weight. Structural work like reputation building and content depth comes second, because it takes weeks to compound.",
      },
      {
        question: "How long does it take for a website trust score to improve after fixes?",
        answer: "On-site fixes — policies, contact details, design cleanup — can change your score on the very next scan, because the scan reads your live site. Off-site signals like reviews, press mentions, and search indexation take longer, since third-party platforms and search engines need time to recrawl and reflect the changes.",
      },
      {
        question: "How do I present audit results to a client or my own team?",
        answer: "Lead with the overall grade, then show the two or three weakest dimensions with the evidence behind them, then the plan. A scored report with cited sources does the persuading for you — you're not sharing an opinion, you're sharing a diagnosis with receipts. Tools like StrategyPresentation can turn a scan directly into a presentation deck.",
      },
    ],
    body: `The day after your credibility audit, do three things in order: triage the findings by weight and effort, ship every same-day fix on your own site, and turn the report's evidence into a story you can pitch — to your team, your client, or your next customer. An audit that stays a PDF is just a grade. An audit that becomes a to-do list and a narrative is a growth plan.

This is the playbook we recommend to everyone who finishes a [WebsiteCreditScore scan](/), whether you scored an A- or a D.

## First, read the report the way it was written

A credibility report is structured like a credit report on purpose. There's an overall score, ten dimension grades, and — this is the part people skip — cited evidence for every judgment. Before you fix anything, read the evidence.

The evidence tells you why a dimension scored the way it did. "Transparency: C+" is not actionable. "No refund policy found; privacy policy links to a 404; no named leadership on the About page" is a work order. Every claim in the report links to the source it came from, so you can verify each finding yourself before you spend a minute fixing it.

While you read, sort every finding into one of three buckets:

- **Same-day fixes.** On-site problems you control completely: missing pages, broken links, unclear CTAs, contact inconsistencies.
- **This-month projects.** Work that needs real effort but no third parties: content rewrites, design cleanup, checkout friction, performance work.
- **Compounding campaigns.** Off-site signals that need time and other people: reviews, press mentions, social presence, search indexation.

The buckets matter because they fail differently. Same-day fixes fail from neglect. Compounding campaigns fail from impatience — people quit them in week two because nothing moved yet.

## Day one: ship the same-day fixes

These are the fixes that show up in almost every report and take less than a day combined:

1. **Restore every broken link.** A 404 on your own footer — especially on a legal page — signals neglect to both buyers and crawlers. Click every link in your navigation and footer.

2. **Publish the missing policy pages.** Privacy, terms, refunds, contact. If money changes hands on your site, the refund policy is the one buyers actually look for before paying.

3. **Put a real person on the site.** Name, role, photo or LinkedIn link. Anonymous operations score poorly on legitimacy — the heaviest dimension at 18% of the grade — and buyers feel the same thing the scan measures.

4. **Unify your contact details.** Same business name, email, phone, and address on your site, your Google Business Profile, and your top directories. Inconsistency reads as either sloppiness or evasion.

5. **Cut the competing CTAs.** One primary action per page. If your homepage asks visitors to book a call, subscribe, download a guide, and follow you on three platforms, it's asking for nothing.

None of this is glamorous. All of it moves the score, because these are exactly the checks the scan runs — and exactly the checks a skeptical buyer runs, consciously or not.

## Week one: start the compounding campaigns

The same day you ship the quick fixes, start the slow signals — because their clock only starts when you do.

**Reviews.** Email your last ten happy customers and ask for a Google review. Most satisfied customers never review without being asked; most unhappy ones don't wait to be asked. Volume of genuine reviews is the single best defense against the occasional unfair one.

**Search presence.** Submit your sitemap in Google Search Console and request indexing for your key pages. If your site is new or recently restructured, this is often the difference between "no evidence found" and a real footprint. We wrote a full checklist in [Why Google Is Not Indexing Your Website](/blog/why-google-is-not-indexing-your-website).

**Press and profiles.** Claim your Google Business Profile if you haven't. Update your LinkedIn company page. One genuine mention — a podcast, a local paper, an industry newsletter — does more for your social presence dimension than a month of self-posted content.

## Turn the report into a pitch

Here's the move most people miss: an audit report is also a sales document. It works in three directions.

**Pitching your own team or boss.** "Our website looks untrustworthy" is an opinion that starts arguments. "We scored 61 — a D — and here are the cited findings" is a diagnosis that ends them. The report gives you a neutral third-party framing, dimension-by-dimension evidence, and a natural budget conversation: here's what a C-to-B jump requires.

**Pitching a client.** If you're an agency, consultant, or freelancer, a scan of a prospect's site is the strongest cold-outreach artifact there is. You're not saying "hire me, I'm great." You're saying "here are seven specific, verifiable problems with your site, here's the evidence, and here's what fixing them looks like." The audit does the prospecting; you do the closing.

**Pitching with your improvement.** After you've fixed the findings and rescanned, the before-and-after is the case study. "We took our credibility score from D+ to B in six weeks" is a concrete, checkable claim — the kind of specific evidence that separates expert content from thin content.

For the pitch itself, this is exactly what our sister product [StrategyPresentation](https://strategypresentation.com) was built for: it takes a completed scan and turns the findings, evidence, and improvement plan into a client-ready presentation deck, so the report becomes slides instead of staying a screenshot in your email.

## The rescan discipline

Set a rescan date before you close the report — we suggest four to six weeks out. Two reasons.

First, accountability. A scheduled rescan turns "we should fix the website" into a deadline. The same psychology that makes a credit score motivating applies here: a number you expect to be re-measured on is a number you work on.

Second, honest measurement. Some fixes show up immediately because your live site changed. Others — reviews, indexation, press — lag by weeks. Rescanning too early makes you think the slow work isn't working; a four-to-six-week window catches most of both.

When the new report comes back, repeat the loop: triage, ship, campaign, pitch. Credibility isn't a project you finish. It's a score you maintain — and the businesses that treat it that way pull further ahead every quarter, because most of their competitors ran one audit, fixed nothing, and forgot about it.

## The one-page version

- Read the evidence, not just the grades
- Same day: fix links, policies, identity, contact consistency, CTA clutter
- Same week: start reviews, indexing, and profile claims — the slow clock starts when you do
- Turn the report into a pitch: for your team, for clients, or as a before-and-after case study
- Book the rescan now, four to six weeks out

If you haven't run the audit yet, [start with a scan](/) — everything above assumes you know your grades and have the evidence in hand.`,
  },
  {
    slug: "red-flags-customers-notice-in-5-seconds",
    title: "Red Flags Customers Notice in 5 Seconds — and How to Remove Every One",
    excerpt: "Visitors judge your site before they read a word of it. These are the instant red flags that end visits early, and the specific fix for each one.",
    date: "July 13, 2026",
    dimension: "First Impressions",
    dimensionColor: "#fb923c",
    readTime: "7 min read",
    author: "Hans Turner",
    related: ["why-your-website-looks-untrustworthy", "visual-design", "ux-conversion"],
    faq: [
      {
        question: "What makes a website look untrustworthy at first glance?",
        answer: "The fastest trust-killers are a browser security warning, a slow or broken first paint, an instant popup, generic stock imagery, a headline that doesn't say what the business does, and no visible way to see pricing or contact a human. Visitors process these before reading any of your copy.",
      },
      {
        question: "Do popups really hurt conversions?",
        answer: "A popup that appears before the visitor has read anything asks for commitment before delivering any value, and most visitors close it reflexively or leave. Exit-intent and post-engagement prompts perform the same job with far less trust damage. If you keep one, delay it until the visitor has actually engaged with the page.",
      },
      {
        question: "How can I test my own website's first impression?",
        answer: "Open your site in an incognito window on your phone, on cellular rather than wifi, and give yourself five seconds. Can you say what the business does, whether it looks current, and what you'd click next? Then ask someone who has never seen the site to do the same. An automated audit like WebsiteCreditScore formalizes this into scored dimensions with evidence.",
      },
    ],
    body: `In the first few seconds on your site, a visitor decides one thing: stay or leave. That decision is made almost entirely from instant signals — the security state of the page, how fast it paints, what the hero looks like, and whether anything feels off — not from your carefully written copy, which they haven't read yet. The good news: nearly every instant red flag has a concrete, checkable fix.

Here are the ones that matter most, in roughly the order a visitor encounters them. Each of these maps to something a [WebsiteCreditScore scan](/) checks explicitly.

## 1. The browser warns them before you can say a word

If the address bar says "Not Secure," the visit is over for a large share of visitors — before your page has said anything. Certificate errors and mixed-content warnings (an HTTPS page loading images or scripts over HTTP) trigger the same reflex: the browser, a source visitors trust more than you, just called your site unsafe.

**Remove it:** Serve everything over HTTPS. Renew certificates automatically so they can't silently expire. Audit templates and old content for hardcoded http:// asset URLs — mixed content usually hides in legacy pages and email-imported images.

## 2. The page is still loading

A slow first paint doesn't read as "slow server." It reads as abandoned. Visitors on mobile connections are the majority for most consumer businesses, and a hero image exported at full resolution can add seconds of blank screen on cellular.

**Remove it:** Compress and resize images to what the layout actually displays. Lazy-load everything below the fold. Use a CDN. Then test on a real phone on cellular data — not your office wifi, and not an emulator.

## 3. A popup asks before the page gives

Newsletter modal, discount wheel, cookie wall stacked on a chat bubble — before the visitor has read a single sentence. The message a popup-first page sends is: our goals come before your question. Visitors close it on reflex, and some close the tab instead.

**Remove it:** Delay any prompt until the visitor has meaningfully engaged — scrolled, dwelled, or reached the end of something. Keep cookie consent to a single compact banner. If your first impression needs a discount wheel to survive, the first impression is the problem.

## 4. The hero could belong to any company

A stock photo of smiling people at a laptop, a headline like "Solutions for a Changing World," and three buzzwords. The visitor's brain files it instantly: template site, interchangeable business. Generic visuals don't just fail to help — they actively signal that no real, specific operation is behind the page.

**Remove it:** Replace the stock hero with something only you could show — your product, your storefront, your actual work, your actual team. Rewrite the headline to say what you do and for whom, in words a stranger would use. Specificity is the cheapest trust signal there is.

## 5. There's no price and no path to one

When a visitor wants a price and finds only "Contact us," they don't think premium. They think expensive, complicated, or about to hand me to a salesperson. Hidden pricing is one of the most common findings in our transparency dimension, and it's one buyers punish quietly — they just leave for the competitor who publishes numbers.

**Remove it:** Publish pricing, a starting price, or a "from $X" anchor. If pricing genuinely depends on scope, publish the process instead: what happens after they ask, and how fast. The rule is that the visitor should never feel information is being withheld to gain leverage over them.

## 6. No human is anywhere on the page

No names, no faces, no phone number, no physical location — just a contact form and a logo. Anonymity is the single strongest pattern shared by actual scam sites, and visitors have learned the association. A legitimate business that hides its people inherits the suspicion earned by fraudulent ones.

**Remove it:** Footer with a real business name and location. An About page with named people and a LinkedIn link or two. A support email that isn't a black hole. This overlaps heavily with business legitimacy — the heaviest-weighted dimension in our scoring at 18% — and it's covered in depth in our [legitimacy guide](/blog/business-legitimacy).

## 7. Something is visibly broken

An unstyled button, a layout that overflows on mobile, a typo in the headline, a copyright line that ends three years ago. Small breakage does disproportionate damage because visitors generalize: if they didn't notice this, what else didn't they notice — like the checkout, or my card details?

**Remove it:** Once a quarter, click through your own site on a phone like a stranger would: homepage, top pages, form, checkout. Fix the copyright year in the footer today — it's a two-minute fix and one of the most-noticed staleness signals on the web.

## Why five-second signals deserve deliberate work

It feels unfair that a decade of honest operation can be undermined by a stock photo and an expired certificate. But look at it from the visitor's side: they have no history with you, dozens of alternatives one tap away, and a constant background risk of being scammed. Instant signals are how humans manage that risk cheaply. You don't get to opt out of being judged this way — you only get to choose what the judgment finds.

That's also why we built scoring around it. Several WebsiteCreditScore dimensions — visual design, UX and conversion, technical health, transparency — are, in large part, formalized five-second signals with evidence attached. [Run a scan](/) and you'll get the stranger's-eye view of your own site, graded and cited, without having to find a stranger.

One more thing: removing these red flags isn't a one-time project. Certificates expire, links rot, copyright years go stale, and every redesign introduces new breakage. Teams that stay clean treat it as recurring operations, not a launch task — it's exactly the kind of standing checklist that an AI operations setup like [Brainztem](https://brainztem.com) exists to keep running so nobody has to remember it.

Five seconds isn't enough time to earn trust. It's only enough time to lose it. Clear the red flags, and your copy, your product, and your reviews finally get their chance to do the earning.`,
  },
  {
    slug: "online-reputation-audit",
    title: "Online Reputation Audit: How to See Your Business the Way Strangers Do",
    excerpt: "You can't fix a first impression you've never seen. A step-by-step method for auditing what the internet says about your business when you're not in the room.",
    date: "July 10, 2026",
    dimension: "Online Reputation",
    dimensionColor: "#60a5fa",
    readTime: "8 min read",
    author: "Hans Turner",
    related: ["online-reputation", "how-to-check-if-a-website-is-legit", "social-presence"],
    faq: [
      {
        question: "How do I audit my business's online reputation for free?",
        answer: "Search your business name in an incognito window and read the entire first page, including the map pack and 'People also ask'. Then check your Google reviews, Trustpilot or Yelp, BBB, and Reddit mentions, and note the gap between what you claim and what strangers would conclude. The audit costs nothing but honesty; the findings usually cost a weekend.",
      },
      {
        question: "What should I do about a bad review that shows up prominently?",
        answer: "Respond publicly, calmly, and specifically — the response is read by hundreds of future customers, not just the reviewer. Then work on volume: a steady stream of genuine reviews from real customers dilutes any single bad one. Never buy reviews or retaliate; both patterns are detectable and do more damage than the original complaint.",
      },
      {
        question: "How often should I audit my online reputation?",
        answer: "Do a deep audit quarterly and a light check monthly — search results and review platforms move slowly enough that this catches most changes. Set up alerts for your brand name so surprises reach you before they reach your customers. An automated scan gives you a scored baseline so you can measure drift instead of guessing.",
      },
    ],
    body: `To audit your online reputation, search your business the way a stranger would — logged out, in a private window, with the words a customer would actually type — and document everything they'd find in the first ten minutes: search results, reviews, maps, social profiles, and forum mentions. Then compare that picture to what your website claims. The gap between the two is your reputation problem, and most businesses have never once looked at it systematically.

Here's the full method. Budget a quiet afternoon.

## Why you can't see your own reputation

Two reasons, one technical and one human.

The technical one: your search results are personalized. You visit your own site constantly, so search engines rank it — and content about it — differently for you than for a stranger. Your view of "what comes up when you google us" is quietly wrong.

The human one: you know too much. You know the one-star review was an unreasonable customer; a stranger just sees one star. You know the founder is on the About page under her maiden name; a stranger sees no leadership at all. Auditing reputation means deliberately un-knowing everything and reading only what's actually on the screen.

## Step 1: The incognito search

Open a private browsing window. Search your exact business name. Read the entire first page slowly, then repeat with the searches a real customer makes before buying:

- "[business name] reviews"
- "[business name] complaints"
- "[business name] legit"
- "[business name] reddit"

Screenshot everything. Note especially: what occupies positions two through five under your own site (this is what skeptical buyers read), what appears in "People also ask," and whether anything negative, stale, or simply missing shows up. A business with no search footprint beyond its own site has a reputation problem of a quieter kind: no corroboration.

## Step 2: Read your reviews like a stranger

Go to your Google Business Profile, then whichever platforms matter in your industry — Trustpilot, Yelp, BBB, G2, TripAdvisor. Don't read as the owner. Read as a buyer with a specific worry, and answer their questions:

**What's the most recent review?** If it's eighteen months old, the business looks dormant regardless of your star average. Recency reads as aliveness.

**What do the negative reviews allege?** "Slow shipping" and "they took my money and vanished" are different universes. Severity matters far more than the star count. Sort by lowest rating and read every one-star review as if you were about to spend money.

**Did the owner respond — and how?** A calm, specific reply to an angry review is one of the strongest trust signals on the page, because it's evidence of how you behave under stress. Silence reads as indifference; defensiveness reads worse.

**Does the pattern look organic?** A wall of five-star reviews posted the same week, in similar phrasing, from accounts with no history, is a pattern buyers have learned to spot — and it discredits your genuine reviews along with the purchased ones.

## Step 3: Check the corroboration layer

Now audit whether the wider web agrees your business is what it says it is:

- **Google Business Profile:** claimed, correct hours, real photos, current address?
- **LinkedIn:** does the company page exist, and do actual employees list you as their employer?
- **Directories and industry platforms:** same name, phone, and address as your website?
- **Press and mentions:** has anyone independent ever written about you — local paper, trade publication, podcast?
- **Wayback Machine:** does your domain's history match your founding story?

Inconsistency here is corrosive out of proportion to its cause. A different phone number on Yelp is almost always an innocent oversight — but a stranger can't distinguish innocent oversight from a business covering its tracks, so it gets priced as risk.

## Step 4: Read the forums

Search Reddit and any industry forums for your brand. Forum mentions are unmanaged reputation — nobody's marketing team wrote them, which is exactly why buyers weight them heavily. You're looking for three things: whether you're mentioned at all, the verdict when you are, and whether anyone has asked "is [your business] legit?" and gotten silence for an answer. Silence means the most motivated skeptics found nothing to reassure them.

Don't respond to old threads defensively, and never astroturf. If you find genuine confusion, the fix is almost always on your website: the questions people ask forums are the questions your site failed to answer.

## Step 5: Score the gap

Put your website's claims in one column and the stranger's findings in the other. "Trusted by hundreds of clients" next to eleven reviews. "Award-winning team" next to an empty LinkedIn page. Every mismatch is a to-do: either substantiate the claim with visible evidence, or soften the claim to what the evidence supports. Unsubstantiated superlatives cost more trust than modest, verifiable statements earn.

## Automating the stranger's eye

Everything above is what a [WebsiteCreditScore scan](/) does systematically: it searches your business's public record the way a diligent stranger would, reads the reviews, checks the corroboration layer, and grades what it finds across ten weighted dimensions — online reputation alone is 15% of the score — with a citation for every claim. The manual audit is worth doing once, because nothing else teaches you the stranger's perspective as viscerally. The scan is how you make it repeatable, comparable quarter over quarter, and impossible to grade on a curve of self-knowledge.

Either way, write the findings down and date them. A reputation audit you can't compare to last quarter's is a snapshot, not a system.

And when the audit needs to persuade someone other than you — a partner, a boss, a client whose site you audited — the findings deserve better packaging than a spreadsheet of screenshots. That's the handoff our sister product [StrategyPresentation](https://strategypresentation.com) handles: it turns a completed scan into a structured, evidence-backed presentation, so the stranger's-eye view becomes something you can put in front of a room.

The internet is already telling a story about your business to everyone who checks. The only question is whether you've read it.`,
  },
  {
    slug: "why-your-website-looks-untrustworthy",
    title: "Why Your Website Looks Untrustworthy (and the 7 Fastest Fixes)",
    excerpt: "It's almost never one big thing — it's an accumulation of small signals. The seven highest-leverage fixes, ordered by speed, most of them shippable this week.",
    date: "July 8, 2026",
    dimension: "Design & Trust",
    dimensionColor: "#818cf8",
    readTime: "7 min read",
    author: "Hans Turner",
    related: ["red-flags-customers-notice-in-5-seconds", "visual-design", "transparency"],
    faq: [
      {
        question: "Why does my website look untrustworthy even though my business is legitimate?",
        answer: "Trust signals and business quality are separate things. Visitors can't see your track record, your ethics, or your happy customers — they can only see what's on the screen. Anonymous ownership, missing policies, stock imagery, stale content, and small breakage all read as risk, no matter how good the underlying business is.",
      },
      {
        question: "What is the fastest way to make a website look more trustworthy?",
        answer: "Put real people on it. A footer with a real business name and location, an About page with named humans, and a working support email are the fastest high-impact changes — most take under a day. After identity, publish your policy pages and fix every broken link.",
      },
      {
        question: "Do trust badges and security seals actually work?",
        answer: "Badges the visitor recognizes and can verify (a real payment provider's mark shown at checkout) help modestly at the moment of payment. Generic 'trusted site' seals that link nowhere do little, and a page wallpapered with them can read as compensating. Structural signals — identity, policies, reviews, working HTTPS — outperform decoration.",
      },
    ],
    body: `Your website looks untrustworthy for an unglamorous reason: it's accumulating small risk signals — an anonymous footer, a missing refund policy, a stock hero image, a dead link — and visitors sum them up unconsciously and leave. It's rarely one big thing, and it has nothing to do with whether your business is actually good. Below are the seven fixes with the best ratio of trust gained to effort spent, ordered by speed. Most are shippable this week.

This list isn't guesswork — it's the pattern in low-scoring [WebsiteCreditScore reports](/). When sites score poorly, these seven findings are what the evidence sections keep saying.

## Fix 1: Put your identity on the site (half a day)

The most common trust failure on the web is anonymity. No names, no faces, no address, no phone — just a brand name and a contact form. Visitors read anonymity as risk because actual scam sites are anonymous, and they can't tell the difference between "hiding" and "just never got around to an About page."

**Ship this:** a footer with your legal business name and location; an About page with the real people behind the business, linked to their LinkedIn profiles; a support email on a named domain. If you're a solo operator, say so — "run by one person, here's who" out-trusts a fictional "our team."

This maps to business legitimacy, the heaviest dimension in our scoring at 18% — the full detail is in [how we score legitimacy](/blog/business-legitimacy).

## Fix 2: Publish the boring pages (half a day)

Privacy policy, terms of service, refund policy, shipping or cancellation terms, a contact page with more than a form. Nobody reads them for pleasure — but buyers check for them before paying, and their absence is conclusive in a way their presence is not. A missing refund policy, in a buyer's mind, means "no refunds, and they didn't want to say so."

**Ship this:** all four pages, linked from the footer, written in plain language. State the refund terms honestly even if they're strict — a clear "no refunds on custom work, here's why" beats silence, because it shows you say uncomfortable things out loud.

## Fix 3: Fix everything that's broken (one day)

Dead links, 404ing legal pages, images that don't load, forms that error, layouts that overflow on a phone, a copyright line from three years ago. Individually trivial; together, they tell the visitor that nobody is maintaining the site — and if nobody's maintaining the site, who's maintaining the product, the security, the customer service?

**Ship this:** click every link in your nav and footer. Submit your own forms. Load every key page on a real phone. Update the copyright year. Then put a quarterly reminder in your calendar, because entropy doesn't stop — this is precisely the sort of recurring upkeep an AI operations instance like [Brainztem](https://brainztem.com) can own so it actually happens.

## Fix 4: Replace the generic with the specific (two days)

Stock photography, template headlines, and vague copy make a real business look like a placeholder. "Innovative solutions for modern challenges" describes nothing and therefore no one; a visitor can't trust what they can't pin down.

**Ship this:** replace your hero image with something only your business could show — the product, the workspace, the work itself. Rewrite the headline to pass the stranger test: could someone who's never heard of you say what you do, for whom, after one sentence? Add one concrete, verifiable claim (years operating, real client names with permission, a checkable result) and delete every superlative you can't back.

Thin, generic copy is also what our content quality dimension scores against — more in [thin content vs. expert writing](/blog/content-quality).

## Fix 5: Make the money part transparent (two days)

Hidden pricing, surprise fees at checkout, and buried terms make buyers feel maneuvered — and a buyer who feels maneuvered leaves. Transparency failures are especially expensive because they hit at the exact moment of highest intent: the person was ready to pay.

**Ship this:** publish pricing or at least a starting anchor. Show shipping, taxes, and fees before the final step. Put the refund summary next to the buy button, not just in the terms. If your pricing is genuinely custom, publish the process — what happens after "get a quote," and how fast.

## Fix 6: Kill the friction theater (one day)

Instant popups, autoplay video, chat widgets that bounce, notification permission requests, a cookie banner stacked on a discount modal. Each interruption says: our goals outrank your errand. Visitors don't file this consciously — they just feel the site is pushy and trust it less.

**Ship this:** no interruptions until the visitor has engaged. One compact cookie banner. Chat available but silent. If a prompt must exist, earn it — end of article, exit intent, second visit.

## Fix 7: Get corroborated (ongoing, start today)

Everything above happens on your site. But trust is triangulated: buyers check whether anyone else vouches for you. Reviews, a claimed Google Business Profile, a live LinkedIn page, a mention anywhere you don't control. A perfect website with zero external footprint still reads as unverifiable.

**Ship this:** claim your Google Business Profile today. Ask your ten happiest customers for a review this week. Keep your LinkedIn page minimally alive. The full method is in our [online reputation audit guide](/blog/online-reputation-audit).

## The order matters

Do the fixes in this sequence — identity, policies, breakage, specificity, transparency, friction, corroboration — because it's ordered by trust-per-hour. The first three are cheap, fast, and remove disqualifiers. The last four convert a site that's merely acceptable into one that actively reassures.

Then measure it. [Run a scan](/) before you start and again a month after you ship, and you'll see the changes reflected dimension by dimension — transparency, visual design, content quality, legitimacy — with evidence citations instead of vibes. Untrustworthy-looking is a fixable condition, and unlike most marketing work, this kind compounds: every signal you fix keeps working every day, for every visitor, for as long as the site stands.`,
  },
  {
    slug: "website-trust-scores-explained",
    title: "Website Trust Scores Explained: How Ours Is Scored and What the Grades Mean",
    excerpt: "What's actually inside a website trust score: the ten weighted dimensions, the exact grade bands from A+ to F, and how to read a report like an analyst.",
    date: "July 5, 2026",
    dimension: "Score Methodology",
    dimensionColor: "#f7b21b",
    readTime: "8 min read",
    author: "Hans Turner",
    related: ["how-to-check-if-a-website-is-legit", "how-to-improve-website-trust-score", "business-legitimacy"],
    faq: [
      {
        question: "What is a good website trust score?",
        answer: "On our 0-100 scale, 80 and above (B- or better) means a site a stranger can verify and transact with confidently. 90+ (A-) is excellent and typically requires strong external corroboration, not just a good website. Scores between 60 and 79 usually indicate fixable gaps — missing policies, weak reputation footprint, thin content — rather than anything sinister.",
      },
      {
        question: "How is a website trust score calculated?",
        answer: "WebsiteCreditScore grades ten dimensions of a site's public record — business legitimacy, online reputation, visual design, UX, transparency, technical health, content quality, social presence, longevity, and financial signals — each 0-100, then combines them using fixed weights (legitimacy is heaviest at 18%, financial signals lightest at 3%). Every dimension's verdict cites the sources it was based on.",
      },
      {
        question: "Can a legitimate business have a low trust score?",
        answer: "Yes, and it happens constantly. The score measures verifiable public evidence, not inner virtue — a great business that's anonymous online, has no reviews, and hides its pricing scores low because a stranger has no way to confirm it's great. That's precisely the gap the report is designed to expose, and most of it is fixable.",
      },
    ],
    body: `A website trust score is a single number that summarizes how much verifiable, public evidence supports trusting a website — the same way a credit score summarizes repayment risk. Ours runs 0-100, maps to letter grades from A+ to F, and is built from ten weighted dimensions, each graded separately with cited evidence. This post opens the hood completely: the dimensions, the exact weights, the grade bands, and how to read a report.

If you want to follow along with your own numbers, [run a scan](/) first — the report will make twice as much sense with your grades in front of you.

## The credit score analogy, taken seriously

Credit scores work because they compress something complicated — a life of financial behavior — into a number that strangers can act on. No lender reads your whole history; they read the score, then the report behind it when they need detail.

Websites have the same problem in the other direction. Every buyer, partner, and donor has to answer "can I trust this site?" with limited time and no standard instrument. So they improvise: a glance at design, a skim of reviews, a gut call. A trust score formalizes that improvisation — same evidence a diligent stranger would check, but checked systematically, weighted explicitly, and cited.

The scale runs 0-100 and converts to grades the way you'd expect from school: 97+ is an A+, 93+ an A, 90+ an A-, 87+ a B+, 83+ a B, 80+ a B-, and so on down through the C and D bands to F below 60. In plain terms: A-grade sites are excellent, B-grade sites are strong, C-grade sites are average with visible gaps, and D-and-below sites have serious, specific problems the report will name.

## The ten dimensions and their weights

The overall score is a weighted average of ten dimension scores. The weights are fixed, public, and sum to 100%:

- **Business legitimacy — 18%.** Is there a verifiable real business behind the site? Registration records, consistent contact details, named and findable people, a physical footprint that checks out.
- **Online reputation — 15%.** What do independent sources say? Review volume, recency, severity of complaints, owner responses, forum sentiment, and whether the pattern looks organic or manufactured.
- **Visual design — 14%.** Does the site look like something a real, resourced operation maintains? Hierarchy, consistency, imagery quality, polish.
- **UX / conversion — 12%.** Can a visitor actually accomplish things? Navigation clarity, mobile experience, form and checkout friction, load behavior.
- **Transparency & disclosure — 10%.** Pricing visibility, refund and privacy policies, terms, named ownership — whether the site volunteers what buyers need or makes them dig.
- **Technical health — 8%.** HTTPS and certificate quality, security headers, performance, broken links — the objective, measurable layer.
- **Content quality — 8%.** Specific, evidenced, expert writing versus thin generic filler.
- **Social & press presence — 7%.** Live profiles, third-party mentions, signs the operation exists beyond its own domain.
- **Domain & company longevity — 5%.** Domain age, archive history, consistency between the founding story and the paper trail.
- **Financial signals — 3%.** Funding, hiring, distress signals — mostly a "nothing weird here" check.

The ordering encodes a philosophy: who you are (legitimacy) and what others say (reputation) outweigh how you look (design, UX), which outweighs technical hygiene. A gorgeous site run by no one verifiable scores worse than a plain site with a real business and real reviews behind it — deliberately.

Each dimension gets its own 0-100 score and letter grade, so the report shows you not just where you stand but where the points are leaking. A site can carry an A in technical health and a D in transparency; the overall grade tells you less than the spread does.

## Where the evidence comes from

Every scan researches the site's public record: the site itself, business registries, review platforms, search results, social profiles, archive history, and press. The critical design decision is that **every dimension verdict cites its sources**. If the report says your reputation grade suffered from unresolved complaints, it links to the complaints. If legitimacy dinged you for inconsistent contact details, it shows both versions.

This matters for two reasons. First, you can audit the audit — check any claim yourself rather than trusting a black box. Second, it makes the report actionable: a cited finding is a work order, while an uncited score is just a mood.

## What the grades mean in practice

**A range (90-100):** the public record strongly corroborates the site. Typically established organizations with clean legitimacy, healthy review profiles, and no significant flags. A+ is rare by design.

**B range (80-89):** trustworthy with minor leaks — a thin social presence, a policy gap, middling performance. Most well-run small businesses land here, and the report will name exactly which dimensions are holding back the A.

**C range (70-79):** average, which on the modern web means "real but unconvincing." Usually multiple fixable gaps: sparse reviews, anonymous About page, hidden pricing, stale content. C-grade sites lose winnable customers daily without knowing it.

**D range (60-69):** serious credibility problems — the kind a cautious buyer walks away from. Often a compounding mix: no verifiable business identity and no reviews and technical neglect.

**F (below 60):** the public record contradicts trust or barely exists. Not necessarily fraud — brand-new sites with zero footprint can land here — but a stranger has no rational basis for confidence, and the report will say precisely why.

Two honest caveats. A high score isn't a guarantee of virtue — it means the public evidence supports trust, and evidence can lag reality. And a low score isn't an accusation — new and offline-successful businesses often score poorly simply because the web can't corroborate them yet. The score measures verifiability, and verifiability is fixable: our guide on [improving your trust score](/blog/how-to-improve-website-trust-score) covers the standard path.

## Reading a report like an analyst

Read the overall grade last, not first. Start with the dimension spread and find your two heaviest-weighted weak dimensions — that's where the same effort buys the most points. Read the cited evidence for those two. Then sort the findings into what you can fix on-site this week versus what needs an off-site campaign (reviews, press, indexing) over a quarter.

And if the report needs to convince someone besides you — a client, a boss, a board — the grades and evidence are already structured for it. Our sister product [StrategyPresentation](https://strategypresentation.com) turns a completed scan into a presentation deck for exactly that meeting: dimension grades as the diagnosis, cited findings as the proof, and the fix list as the plan.

A trust score doesn't create your credibility. It measures what strangers can already see — and gives you the itemized list of what they're seeing. The number is the summary; the report is the strategy.`,
  },
  {
    slug: "how-to-check-if-a-website-is-legit",
    title: "How to Check if a Website Is Legit: A 10-Point Credibility Framework",
    excerpt: "A practical framework for verifying any website before you pay, sign up, or share data — the same ten checks our automated audits run, in manual form.",
    date: "July 3, 2026",
    dimension: "Buyer Trust",
    dimensionColor: "#4ade80",
    readTime: "8 min read",
    author: "Hans Turner",
    related: ["website-trust-scores-explained", "red-flags-customers-notice-in-5-seconds", "website-credibility-checklist"],
    faq: [
      {
        question: "How can I quickly tell if a website is legitimate?",
        answer: "Run the fast trio: search the business name plus 'reviews' and 'scam' in a private window, check that the site names real, findable people and a real address, and look for working policy pages (privacy, terms, refunds). Most fraudulent sites fail at least two of these three within five minutes.",
      },
      {
        question: "Does HTTPS mean a website is safe?",
        answer: "No — HTTPS means the connection is encrypted, not that the operator is honest. Fraudulent sites routinely have valid certificates because they're cheap and automatic. Treat missing HTTPS as disqualifying, but treat present HTTPS as merely the price of entry, not proof of legitimacy.",
      },
      {
        question: "What are the biggest red flags that a website is a scam?",
        answer: "The heavy hitters: no verifiable business identity (no names, address, or registration), prices dramatically below every competitor, a domain registered weeks ago presenting as an established brand, no external footprint (no reviews, no mentions, no social history), payment only by irreversible methods, and manufactured urgency on every page.",
      },
    ],
    body: `To check if a website is legit, verify it against ten dimensions of evidence: the business behind it, what independent sources say about it, how it's built, what it discloses, and how long it has actually existed. No single check is decisive — legitimate sites sometimes fail one, and scam sites often pass a few — but almost no fraudulent site survives all ten. This is the same framework our automated audits use, laid out so you can run it by hand.

For a typical purchase decision, the manual version takes fifteen to thirty minutes. Here's each check, in the order of how much it should sway you.

## 1. Can you identify the real business? (the heaviest signal)

Look for a legal business name, a physical address, and named people — then verify they exist outside the site. Search the address; does it resolve to something plausible or a mail-forwarding storefront? Search the founders; do they have histories that predate the website? Check the national or state business registry if the stakes justify it.

This is the heaviest-weighted check in our framework (18% of a [WebsiteCreditScore](/) grade) because it's the one fraud can least afford. Scammers can buy a nice template in an afternoon; they cannot easily manufacture a verifiable legal identity with named humans attached.

## 2. What do independent sources say?

In a private browsing window, search: the brand name alone, plus "reviews," plus "scam," plus "reddit." You're reading for three things: whether an independent footprint exists at all, what the complaints actually allege (slow shipping is normal; "never delivered, blocked me" is not), and whether the positive reviews look organic — spread over time, varied in phrasing, from accounts with history.

Weight forum and Reddit mentions highly; they're the hardest channel to fake. And treat total silence as a finding: a business claiming years of happy customers, with zero trace anywhere it doesn't control, is claiming something the internet doesn't corroborate.

## 3. Does the site look maintained and invested?

Design isn't decoration here — it's evidence of investment. A real, resourced operation tends to produce consistent typography, working layouts on mobile, and original imagery. A disposable operation produces template sprawl: stock photos, mismatched styles, placeholder text nobody proofread. You're not judging taste; you're judging whether anyone with a stake in the long term maintains this thing.

## 4. Does anything work the way it should?

Click around like a buyer. Do the links work? Does search work? Does the cart update correctly? Broken basics on the path to payment are telling, because that's the one path a fraudulent site polishes — if even checkout is glitchy, nobody competent is home; if checkout is pristine while everything else 404s, ask why the effort went only where the money is.

## 5. What does the site disclose without being asked?

Legit operations volunteer the awkward stuff: full pricing, refund terms, shipping times, a privacy policy that describes actual practices, contact routes that reach humans. Check that the policy pages exist, load, and say something specific. A refund policy that exists but commits to nothing ("refunds at our sole discretion") is itself an answer.

## 6. Is the technical layer sound?

Check for HTTPS and no browser warnings — and understand what that does and doesn't mean. Encryption is table stakes, not endorsement; plenty of scams have valid certificates. The technical check is mostly disqualifying: certificate errors, "Not Secure" labels, or a payment form on an unencrypted page each end the conversation on their own.

## 7. Is the content written by someone who knows the field?

Read one product page or article closely. Expert operations write with specifics — numbers, trade-offs, process detail — because they have them. Fronts write in generalities, because generalities are all a copywriter without a real business can produce. In an era when anyone can generate unlimited plausible text, specificity you can check is the differentiator.

## 8. Does the business exist beyond this domain?

Look for a claimed Google Business Profile, a LinkedIn page with actual employees, social accounts with history (not three posts from last month), and any press or directory mentions. None of these are individually hard to fake — but faking all of them, with age and consistency, is expensive. Fraud economizes; the corroboration layer is usually where it shows.

## 9. How old is it really?

Check the domain age (any WHOIS lookup tool) and the site's history in the Internet Archive's Wayback Machine. Then compare against the story the site tells. "Serving customers since 2009" on a domain registered in March is a serious contradiction. Newness isn't guilt — every business starts somewhere — but concealed newness is deliberate deception, and it's one of the most reliable scam tells there is.

## 10. Do the money signals make sense?

Prices dramatically below every competitor are the oldest lure in commerce — "too good to be true" survives as a heuristic because it keeps being true. Also check payment methods: reputable processors and cards (which give you chargeback rights) versus pressure toward wire transfers, gift cards, or crypto (which don't). A site that only accepts irreversible payment has told you its plan.

## Scoring what you found

Don't tally pass/fail — weight it. Identity (1) and reputation (2) matter most; if both are strong, isolated wobbles elsewhere are usually just imperfection. If either is weak, treat every other yellow flag as amber-going-red. Manufactured urgency — countdown timers, "3 left!", discounts that expire the moment you arrive — should multiply your suspicion across every other check, because urgency is how bad actors stop you from doing exactly the diligence you're doing.

If it's your website you just checked — and you found it fails checks a stranger would run — that's fixable, and the fixes are mostly mechanical: our guide to [why websites look untrustworthy](/blog/why-your-website-looks-untrustworthy) is the companion piece. Keeping all ten dimensions healthy over time is an operations habit rather than a one-off audit; it's the kind of standing responsibility teams increasingly hand to an AI operations instance like [Brainztem](https://brainztem.com) so it doesn't decay between redesigns.

And when you'd rather have the whole framework run for you — every check above, executed against the public record, graded across ten weighted dimensions, with a citation behind every claim — that's literally what a [WebsiteCreditScore scan](/) is. Thirty minutes of diligence, systematized into a report you can act on or hand to someone else.

Trust, online, is just evidence you haven't checked yet. Check it.`,
  },
];
