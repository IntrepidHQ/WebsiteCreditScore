export type TrendArticle = {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  readMinutes: number;
  tags: string[];
  sections: Array<{
    heading: string;
    body: string; // 2–4 paragraphs per section
  }>;
};

export const TREND_ARTICLES: TrendArticle[] = [
  {
    slug: "above-the-fold-conversion",
    title: "Why Your First Screen Loses 70% of Visitors Before They Scroll",
    excerpt:
      "Most websites waste their most valuable real estate. The first screen — the viewport before a single pixel scrolls — determines whether a visitor stays or leaves. Here's why it fails and how to fix it.",
    publishedAt: "2025-01-15T00:00:00Z",
    readMinutes: 8,
    tags: ["conversion", "ux", "above-the-fold"],
    sections: [
      {
        heading: "The cognitive load problem above the fold",
        body: `When a visitor lands on your site, their brain makes a trust decision in roughly 50 milliseconds. Not a conversion decision — a trust decision. "Is this the right place?" That micro-assessment happens before they've read a word, before they've processed your value proposition, before they've noticed the CTA button you spent three meetings arguing about. It happens in the gap between the page loading and the first conscious thought.

The problem is that most first screens are designed to impress rather than to orient. They're filled with visual complexity, vague aspirational language, and motion that signals effort rather than clarity. The result is cognitive overload — a state where the visitor's working memory is consumed by parsing the interface rather than evaluating the offer. When cognitive load is high, bounce rates spike. This isn't a heuristic. Eye-tracking studies consistently show that visitors who experience high cognitive load above the fold leave within 8 seconds at rates that dwarf those who immediately understand the value.

The underlying mechanism is the same one that makes good signage work: reduce the number of decisions the user has to make to determine whether this page is worth their time. A strong first screen answers three questions instantly — what is this, who is it for, and what do I do next. If any one of those answers requires scrolling, you've already lost a significant portion of your audience.`,
      },
      {
        heading: "What a strong first screen actually needs",
        body: `There are three structural components that every high-converting first screen shares: a clear value proposition, a visible primary CTA, and at least one trust anchor. These aren't suggestions — they're prerequisites. Remove any one of them and conversion rates drop measurably.

The value proposition needs to be specific and benefit-oriented. "Powerful software for growing businesses" is not a value proposition — it's a placeholder. A real value proposition tells the visitor exactly what outcome they'll achieve and, ideally, how quickly or how easily. "Get a scored website audit in 60 seconds" is specific, time-bounded, and outcome-focused. It answers the "what is this" question without requiring the visitor to interpret anything.

The primary CTA must be visible without scrolling, contain an action verb, and be visually distinct from every other element on the page. One CTA. Not two, not three. The moment you add a second CTA of equal visual weight, you've created a decision that adds cognitive load and reduces the likelihood of any action. A trust anchor — a recognizable logo, a specific metric, a client count — gives the skeptical visitor a reason to stay long enough to read the value proposition properly. Trust anchors aren't about vanity; they're about reducing the activation energy required to continue engaging.`,
      },
      {
        heading: "The failure patterns that appear most often",
        body: `Hero sliders are the most persistent mistake in web design. Despite overwhelming evidence that they destroy conversion rates — click-through rates on slides after the first drop by over 90% — they persist because they feel like a solution to competing stakeholder priorities. Everyone's content gets "featured." Nobody wins. Visitors see a rotating carousel as visual noise and scroll past it or leave.

Vague headlines are the second failure pattern. If your headline contains any of these words — solutions, innovative, leading, comprehensive, seamless, best-in-class — you've written a headline that says nothing. These words exist in the vocabulary of every competitor you have. They communicate no differentiation and no specific value. Rewrite every vague headline by forcing yourself to complete this sentence: "After using us, customers can _____ in _____." The answer to that sentence is your headline.

Missing or buried CTAs represent the third pattern. The button is there, but it's below the fold, or it's the same weight as three other elements, or it says "Learn More" instead of directing a specific action. "Learn More" is a hedge — it signals to the visitor that you're not confident enough in your offer to tell them what the next step actually is. Replace "Learn More" with the specific action: "Get my audit," "See pricing," "Book a call." Specificity converts.`,
      },
      {
        heading: "How to audit your own first screen",
        body: `The fastest way to audit your above-the-fold experience is to load the page on a fresh browser instance — private browsing, no cookies — and set a 5-second timer. When the timer expires, close the tab. Then try to answer these questions from memory: What does the company do? Who is it for? What was I supposed to do next? If you can't answer all three immediately, the first screen has failed.

The second test is the squint test. Load the page and physically squint until you can no longer read text — only see shapes and visual weight. Ask: is the CTA the most visually prominent interactive element? Is there a clear hierarchy from headline to subhead to CTA, or does everything have equal weight? Visual hierarchy collapses under the squint test in a way that's immediately obvious and almost always actionable.

For a more structured analysis, run the page through a heatmap tool and look specifically at where attention lands in the first 5 seconds. If attention is fragmenting across multiple elements rather than channeling toward the primary CTA, the layout needs restructuring. The goal isn't to force attention — it's to design a path that feels natural and answers the three orientation questions as quickly as possible.`,
      },
      {
        heading: "What the data says about scroll depth and conversion",
        body: `The relationship between scroll depth and conversion is not linear — it's front-loaded. Research from multiple analytics platforms consistently shows that the heaviest conversion activity happens at the shallowest scroll depths. The highest-converting CTAs are those that appear at or above the fold, followed by CTAs that appear immediately after the hero section. CTAs buried in the middle of long scrolling pages convert at a fraction of the rate.

This doesn't mean long pages are bad. It means the first CTA has a disproportionate impact on whether any CTA on the page ever gets clicked. If the visitor bounces from the hero, no amount of compelling content below the fold matters. The implication is straightforward: before you invest in content strategy, testimonials, or case studies — which are all valuable — make sure the first screen is earning the right to be scrolled past.

The scroll depth data also reveals an interesting secondary insight: visitors who scroll past 50% of a page are significantly more likely to convert than those who don't, but they're a minority of total traffic. Designing for that minority while neglecting the majority who never scroll past the hero is a common mistake with measurable conversion costs. Optimize the first screen first. Everything else is secondary.`,
      },
    ],
  },
  {
    slug: "trust-signals-web-design-2025",
    title: "The 12 Trust Signals That Separate 8-Score Sites from 5-Score Sites",
    excerpt:
      "Trust is not a feeling — it's a design system. High-scoring sites share a specific set of credibility signals that low-scoring sites consistently miss. Here's the complete list and how to implement them.",
    publishedAt: "2025-02-03T00:00:00Z",
    readMinutes: 9,
    tags: ["trust", "credibility", "web design"],
    sections: [
      {
        heading: "What trust actually is in a web context",
        body: `Trust in a web context is the visitor's willingness to accept risk. Every time someone fills out a form, enters an email address, or clicks "Buy Now," they're accepting some degree of risk — that their data is safe, that the business is legitimate, that the product will deliver what was promised. The job of the design system is to reduce the perceived risk to a level where the visitor is willing to accept it.

This is why trust signals aren't decorations. They're functional design elements that directly affect conversion rates. When visitors encounter a site that lacks adequate trust signals, their brain interprets the absence as evidence of risk — not neutral evidence, but negative evidence. A missing SSL indicator, a stock photo testimonial with no last name, a generic contact form with no phone number: each of these is a small negative trust signal that compounds with others.

High-scoring sites in our audit system consistently outperform low-scoring ones on what we call the "trust layer" — the collection of signals that together create an impression of legitimacy, competence, and accountability. The gap between an 8-score site and a 5-score site is rarely the quality of the core product or service. It's almost always the strength of the trust layer.`,
      },
      {
        heading: "The 12 signals in detail",
        body: `Logo quality is the first signal visitors process, and it works below the level of conscious attention. A pixelated, misaligned, or visually dated logo communicates brand neglect. It triggers a heuristic: if they didn't care about the logo, what else didn't they care about? Professional logo design is table stakes.

Social proof needs to be specific and voluminous. "Happy customers" is not social proof. "4.9 stars from 847 reviews" is. The specificity of the number matters — it signals that the number wasn't invented. Review counts with visible platforms (Google, Trustpilot, G2) are significantly more credible than stars without attribution. Process transparency — showing how you work, what clients can expect, what the onboarding looks like — reduces the uncertainty that makes visitors hesitant to take the first step.

Pricing clarity is a trust signal that many service businesses misunderstand. "Contact us for pricing" communicates either that prices are embarrassingly high or that the business doesn't respect the visitor's time. Even a starting-from price point, or a clear explanation of what determines price, is more trustworthy than opacity. Team visibility — actual photos of actual people, with real names and titles — is another signal that many sites underweight. Visitors are buying from humans, not companies. Showing the humans reduces perceived risk.

Security indicators (HTTPS, recognized payment badges, privacy policy links), recency signals (blog posts with dates, "last updated" footers, recent testimonials), and authority badges (certifications, media mentions, professional associations) round out the middle tier. Testimonial specificity deserves special attention: "Great service!" is not a testimonial. "We increased booked appointments by 34% in the first month after the redesign" is. The more specific the outcome, the higher the trust signal value.

Contact accessibility — a real phone number in the header, a physical address in the footer — signals accountability. Professional photography of the team, the work, or the product creates visual evidence of investment. Consistent brand voice across every page signals a coherent, professional operation rather than a patchwork of freelancer contributions.`,
      },
      {
        heading: "How to score your own trust layer",
        body: `Run through the 12 signals as a checklist, but don't just check boxes — evaluate quality, not presence. A testimonial exists: check. But is it specific enough to be credible? A phone number exists: check. But is it in the header, or buried in the footer of the contact page three clicks deep? The nuance between presence and quality is where most trust audits fall short.

Assign each signal a score from 1 to 3: absent (1), present but generic (2), present and specific/high-quality (3). A site with all 12 signals present at quality level 2 will still feel generically trustworthy. A site with 8 signals at quality level 3 and 4 absent will often feel more credible, because the present signals are genuinely persuasive rather than perfunctory.

The trust audit is most useful when you do it as a cold visit — open the site in private browsing and give yourself 30 seconds on each page before scoring. The cold-visit experience maps more closely to how an actual prospect encounters the site than the experience of someone who has been staring at the design for weeks. What you notice as a fresh visitor, and what you don't notice, is exactly what your prospects are experiencing.`,
      },
    ],
  },
  {
    slug: "website-audit-checklist-2025",
    title: "The Complete Website Audit Checklist for Designers and Agencies",
    excerpt:
      "A structured audit beats a gut-feel review every time. Here's the 7-dimension framework we use to score every site, including the specific checkpoints and how to weight findings by business impact.",
    publishedAt: "2025-02-20T00:00:00Z",
    readMinutes: 10,
    tags: ["audit", "checklist", "agency tools"],
    sections: [
      {
        heading: "Why a structured checklist outperforms gut-feel reviews",
        body: `The gut-feel website review is the industry standard, and it's the reason so many redesign projects start without clear direction. A designer looks at a site, identifies three things that look bad, and those three things become the scope of the project. The problem is that the three things that look bad are not necessarily the three things that matter most to conversion, trust, or business outcomes. They're the three things that the designer is trained to notice.

A structured checklist forces comprehensive coverage across dimensions that gut-feel misses. It ensures that a visually polished site doesn't receive a free pass on accessibility failures, or that a site with a compelling value proposition isn't overlooked despite terrible mobile performance. More importantly, it creates a document — a record of the audit that can be shared with clients, used to prioritize work, and referenced at project completion to measure what actually changed.

The discipline of the checklist also calibrates client conversations. When you can point to a scored audit with specific evidence ("your mobile tap targets are undersized, your testimonials lack specificity, your CTA is invisible above the fold"), the conversation shifts from aesthetic preference to business performance. That shift is what makes redesign projects easier to scope, easier to sell, and easier to evaluate.`,
      },
      {
        heading: "The 7 audit dimensions with key checkpoints",
        body: `Visual design covers brand consistency, typography hierarchy, color contrast, image quality, and whitespace usage. Checkpoints: Does the logo exist in SVG format? Is the type scale consistent across pages? Do body copy and background colors pass WCAG AA contrast? Are hero images original photography or obviously stock? Is there sufficient whitespace to allow visual rest?

UX and conversion covers value proposition clarity, CTA placement and copy, form friction, navigation efficiency, and page load readiness. Checkpoints: Can the value proposition be understood in 5 seconds? Is the primary CTA visible above the fold? Does every form field have a clear label? Is the navigation under 7 items? Does the page feel complete without horizontal scrolling?

Mobile experience covers tap target size, font size readability, layout reflow, CTA accessibility on small screens, and scroll performance. Checkpoints: Are all interactive elements at least 44x44px? Is body copy at least 16px on mobile? Does the layout maintain a single readable column at 375px? Is the primary CTA reachable with one thumb? Does the page scroll smoothly on a mid-range Android device?

SEO covers title tags, meta descriptions, heading hierarchy, image alt text, and page speed. Checkpoints: Does every page have a unique, keyword-relevant title tag? Are meta descriptions under 160 characters and benefit-focused? Is there exactly one H1 per page? Do all meaningful images have descriptive alt text? Does the page pass Core Web Vitals?

Accessibility covers keyboard navigation, screen reader compatibility, color dependence, and error messaging. Checkpoints: Can all interactive elements be reached and activated by keyboard? Do form errors identify which field failed? Is color used as the sole differentiator for any meaningful information? Are all interactive elements labeled?

Trust signals covers social proof, team visibility, security indicators, contact accessibility, and testimonial specificity. Checkpoints: Is there quantified social proof (review count, star rating)? Are team photos real people or stock? Is HTTPS active? Is a phone number or email visible in the header? Do testimonials mention specific outcomes?

Security posture covers HTTPS, cookie consent, privacy policy, and third-party script load. Checkpoints: Does the site redirect HTTP to HTTPS? Is there a cookie consent mechanism? Is the privacy policy linked from the footer? Are there rogue third-party scripts loading without clear business justification?`,
      },
      {
        heading: "How to weight findings by business impact",
        body: `Not all audit findings are equal. A missing alt attribute on a decorative image is a different class of problem than a CTA that doesn't work on mobile. The weighting framework we use assigns each finding to one of three priority tiers based on its likely impact on conversion, trust, or accessibility compliance.

Priority 1 findings are those that actively prevent conversion or expose legal risk: broken CTAs, forms that don't submit, accessibility failures that block screen reader users, missing HTTPS, and privacy policy gaps. These get fixed before anything else, regardless of the budget. Priority 2 findings are those that reduce conversion without blocking it: vague value propositions, weak social proof, mobile layout issues, slow page load times, and generic photography. These are the scope of most redesign projects. Priority 3 findings are refinements that raise quality but won't move the primary metrics meaningfully in isolation: typography micro-details, animation polish, color palette optimization.

The business impact weighting also depends on context. A Priority 2 finding on a landing page that receives 10,000 monthly visits is a different order of magnitude from the same finding on a page that receives 200 visits. Build the audit with traffic data in mind — either from the client's analytics or from third-party traffic estimation tools — and weight findings accordingly.`,
      },
      {
        heading: "How to present the audit to clients",
        body: `The audit presentation is where most agencies lose the thread. They deliver a spreadsheet or a slide deck of problems, and the client experiences it as a list of criticisms rather than a business analysis. The framing matters more than the thoroughness.

Lead with the overall score and the business interpretation of that score: "Your site scores a 5.8 out of 10. That puts it below the benchmark for your industry, which means you're likely losing prospective clients who visit but don't contact you. Here's what's costing you the most." This framing connects the audit to business outcomes rather than design preferences, and it positions the redesign as a revenue decision rather than an aesthetic one.

Then move through findings in priority order, not dimension order. Clients don't think in dimensions. They think in problems. Show the Priority 1 issues first with clear evidence (screenshots, test results), then Priority 2 issues with estimated impact. For each finding, include a recommendation — not a complete solution, but a clear direction. "Replace the hero slider with a static headline and single CTA" is more useful than "The hero section needs improvement."

Close with a quantified benchmark: what does a high-scoring site in this industry look like, and what are the specific gaps between where this site is and where it needs to be? This sets up the redesign scope naturally and gives the client a clear picture of what success looks like before a single pixel changes.`,
      },
    ],
  },
  {
    slug: "website-redesign-brief-template",
    title: "How to Write a Website Redesign Brief That Gets Sign-Off",
    excerpt:
      "Most redesign briefs fail before the first wireframe is drawn. They're too vague to scope, too narrow to guide design decisions, and too soft to manage scope creep. Here's how to write one that works.",
    publishedAt: "2025-03-10T00:00:00Z",
    readMinutes: 9,
    tags: ["brief", "project management", "client work"],
    sections: [
      {
        heading: "Why most briefs fail",
        body: `The typical website redesign brief says something like: "We need a modern, professional website that represents our brand and drives leads." That sentence contains no actionable information. "Modern" means different things to the designer and the client. "Professional" is a minimum bar, not a direction. "Represents our brand" is meaningless without a documented brand. "Drives leads" is a goal without a metric.

The brief fails because it was written backward: starting with what the client wants the website to look like, rather than what the business needs the website to do. A brief written from aesthetics produces a project scoped around aesthetics. When the design misses the mark — and without clear direction, it inevitably will — the conversation has no anchor. Everyone is right, and no one can prove it.

The deeper problem is that most briefs lack business context, audience specificity, and success criteria. Without business context, designers can't make decisions about information hierarchy. Without audience specificity, they can't make decisions about tone, vocabulary, or content depth. Without success criteria, there's no way to know when the project is done, and scope creep fills the vacuum. These three absences are the root cause of most redesign projects that go over budget, over timeline, or over everyone's patience.`,
      },
      {
        heading: "The anatomy of a sign-off-ready brief",
        body: `A brief that gets sign-off and holds through the project has seven components. Business goals: what specific outcomes does this website need to drive, and how will they be measured? Not "more leads" — "increase inbound consultation requests from 8/month to 20/month by Q3." Audience: who are the three most important visitor types, what do they already know about the problem, and what do they need to know before they'll act? The clearer the audience definition, the faster the design process.

Competitors: name five sites the client considers direct competitors, and three sites (outside the industry) they consider reference-quality for design or user experience. This sets the aesthetic bar and reveals the competitive context without requiring a lengthy strategy session. Tone: three words that describe how the site should feel, and three words that describe how it should not feel. Simple, memorable, and easy to reference throughout the project. Scope: what pages are included in this engagement, what functional elements are in scope, and what is explicitly out of scope. The out-of-scope list is as important as the scope — it's what you'll need when the client asks for the members-only portal six weeks in.

Timeline: milestones with dates, not just a delivery date. Discovery complete by X, wireframes by Y, first design review by Z. Without milestone dates, delays compound silently until the delivery date becomes fiction. Success metric: one primary metric that will be measured 90 days after launch. One. If the project succeeds, what number will have moved? This is the anchor that holds the whole brief together and makes the project evaluable.`,
      },
      {
        heading: "How to run a discovery session in 45 minutes",
        body: `The discovery session is where the brief comes to life. Done right, 45 minutes produces enough material to write a complete brief without any follow-up. Done wrong, it produces a list of the client's aesthetic preferences and nothing useful about the business.

The session structure: 10 minutes on business context (what does the company do, who are the best customers, what's the most common reason prospects don't convert), 10 minutes on the current site (what's working, what's failing, what do you hear from customers about the website), 10 minutes on competitors and references (name sites you admire and sites you don't — both categories reveal preference), 10 minutes on constraints (timeline, budget range, technical limitations, stakeholder decision-making structure), and 5 minutes on success (if this project is a complete success, what's different in your business a year from now?).

Record the session with permission and take structured notes against those five categories in real time. The brief writes itself from those notes. The discipline of the 45-minute structure prevents the discovery session from becoming a free-association conversation that covers everything and produces nothing actionable.`,
      },
      {
        heading: "How to use the brief to manage scope creep",
        body: `The brief is a scope management document as much as it's a creative direction document. Every time a new request surfaces mid-project — a new page, a new feature, a different approach to a section that was already approved — the brief is the anchor you return to. "Is this in the scope we agreed on? Does this serve the audience we defined? Does this help hit the success metric we committed to?"

This only works if the brief was signed. Literal sign-off — email confirmation, or a signature on the document — creates a shared record that both parties agreed to the scope. Without sign-off, the brief is just a document that represents your best understanding of what the client wanted at a particular moment. With sign-off, it's a contract reference point.

When scope creep requests arrive (and they will), the response is not "no" — it's "yes, and here's how that changes the scope, timeline, and budget." Frame additional requests as change orders, not problems. The brief made the original scope clear. The change order makes the new scope clear. Every change order that gets signed is another moment of alignment that reduces the risk of final delivery disputes. The brief, the sign-off, and the change order process together create the paper trail that makes large projects survivable.`,
      },
    ],
  },
  {
    slug: "mobile-first-conversion-design",
    title: "Mobile-First Isn't Optional: How Small Screens Drive Conversion Losses",
    excerpt:
      "Mobile traffic dominates most websites, but mobile conversion rates consistently trail desktop by a significant margin. The gap isn't about screen size — it's about four specific design failures that are straightforward to fix.",
    publishedAt: "2025-03-28T00:00:00Z",
    readMinutes: 8,
    tags: ["mobile", "conversion", "responsive design"],
    sections: [
      {
        heading: "The data on mobile abandonment by industry",
        body: `Across most industries, mobile devices account for between 55% and 70% of website traffic. Across those same industries, mobile conversion rates are typically 40-60% lower than desktop conversion rates. That gap is not primarily a device preference issue — most consumers are perfectly comfortable making purchases, booking appointments, and submitting contact forms on mobile devices. The gap is a design quality issue.

The abandonment data is consistent: mobile visitors leave faster, complete fewer actions, and return less often than desktop visitors on the same sites. In e-commerce, mobile cart abandonment rates are significantly higher than desktop. In local services (healthcare, legal, home services), mobile contact form completion rates are materially lower than desktop despite mobile accounting for the majority of search-driven traffic in these categories. The users are there. The design is failing them.

What makes this particularly costly is that mobile traffic skews toward high-intent visitors in many service categories. Someone searching for "emergency plumber near me" on their phone at 9pm is not browsing — they're about to hire someone. If your mobile site fails them at that moment, you lose the lead to a competitor whose site works better on a phone. The mobile conversion gap is not a theoretical problem. It has a direct dollar cost that compounds with traffic volume.`,
      },
      {
        heading: "The four most common mobile UX failures",
        body: `Tap targets too small is the most pervasive mobile UX failure. Apple's HIG and Google's Material Design both specify a minimum tap target size of 44x44 pixels. Most desktop-designed sites, when rendered on mobile, present interactive elements that are 24-32px in their effective touch area. The result is mis-taps, frustration, and abandonment. The fix is unglamorous but effective: audit every button, link, and interactive element on mobile and ensure the touch area meets the 44px minimum.

Font size too small is the second failure. Body copy that renders at 12-14px on desktop becomes genuinely difficult to read without pinching to zoom on a 375px screen. The minimum readable font size for body text on mobile is 16px. This is not a style preference — it's a usability threshold. Sites that require the visitor to zoom to read primary content create friction that disproportionately affects older audiences and anyone reading in a low-attention context.

CTAs below the fold on mobile represent the third failure. A button that appears comfortably in the hero on a 1440px desktop may require three scrolls to reach on a 667px phone. If the primary CTA isn't visible in the first viewport on mobile, the conversion rate on that page will be materially lower than it needs to be. Redesigning CTA placement for mobile first — then adapting for desktop — consistently outperforms the reverse.

Forms with too many fields are the fourth failure. Every additional form field reduces mobile completion rates. The friction of switching between keyboard types, auto-correct interference, and the visual density of a long form on a small screen compound to make multi-field forms genuinely punishing on mobile. Audit every form for fields that aren't strictly necessary to complete the business action. A contact form that asks for name, email, phone, company, message, and how-you-heard requires the visitor to make six data entry decisions. A form that asks for name, email, and message requires three. The shorter form converts at a higher rate.`,
      },
      {
        heading: "How to audit mobile experience without a device farm",
        body: `You don't need 40 physical devices to audit mobile experience effectively. The browser DevTools mobile emulator, combined with testing on two or three real devices, covers the majority of what you need to know. The critical insight is that emulators are good for layout and visual audits, but poor for performance and touch interaction testing. For layout: emulator first. For feel: real device.

Set up your DevTools mobile audit with three viewport sizes: 375px (iPhone SE, the smallest common viewport), 390px (iPhone 14), and 430px (iPhone 14 Plus). Run the full page through each viewport and check for horizontal scrolling, element overflow, font sizes that require zooming, and CTA visibility in the first viewport. These three sizes catch the majority of layout failures.

For real-device testing, a mid-range Android (Samsung Galaxy A series) and a current iPhone cover the two major ecosystems at performance levels that are more representative of actual users than the flagship devices most designers use. Performance issues that are invisible on a new iPhone 15 Pro are often obvious on a two-year-old Samsung. Test on the median device, not the premium one.`,
      },
      {
        heading: "Designing CTA placement for thumb zones and one-column layouts",
        body: `The thumb zone model — the ergonomic analysis of where a right-handed user can comfortably reach on a smartphone screen — has direct implications for CTA placement. The most reachable area for right-handed users is the lower-right quadrant of the screen. The hardest to reach is the upper-left. Most mobile sites place primary CTAs at the top of the page, which is the area that requires the most wrist rotation and is the most likely to cause mis-taps.

The ideal mobile CTA placement strategy uses two CTAs: one in the hero (top of page, high visibility) and one sticky at the bottom of the viewport (easy thumb reach, persistent visibility). The sticky CTA should be dismissed once the user has scrolled past the primary conversion point or clicked the hero CTA. This pattern captures both the visitors who scroll and those who don't, without doubling the cognitive load of choosing between two equal options.

The one-column rule for mobile conversions is simpler than it sounds: on screens under 768px, default to a single column for all content and resist the temptation to use two-column layouts that compress content below usable widths. Two-column layouts on mobile typically result in text that's too small to read without zooming, images that are too narrow to communicate effectively, and navigation elements that require precision tapping. One column, generous padding, and clear visual hierarchy consistently outperform cleverly compressed multi-column layouts on mobile.`,
      },
    ],
  },
  {
    slug: "website-score-benchmarks-by-industry",
    title: "Website Score Benchmarks by Industry: What Does Good Actually Look Like?",
    excerpt:
      "A 6.5 means something different for a local plumber than for a SaaS startup. Industry context determines what counts as competitive, what's a meaningful gap, and what score targets are realistic for a redesign project.",
    publishedAt: "2025-04-08T00:00:00Z",
    readMinutes: 9,
    tags: ["benchmarks", "scoring", "industry standards"],
    sections: [
      {
        heading: "Why industry context matters for website scores",
        body: `Absolute scores without industry context are nearly meaningless for setting redesign targets. A professional services firm that scores a 6.3 is performing at the industry average — there's room for improvement, but the site isn't costing them leads at a rate that's unusual for their peers. A SaaS company that scores a 6.3 is materially underperforming its competitive set, where the baseline expectation is higher and the gap to category leaders is more consequential.

The reason industry averages diverge is that different verticals have different investment histories in digital experience, different conversion mechanics, and different buyer behaviors. Healthcare providers have been slower to invest in digital experience than SaaS companies, so the floor and ceiling are both lower. E-commerce sites have been optimizing conversion for decades, so the floor is higher — even mid-tier e-commerce sites have reasonably functional checkout flows, which alone lifts average scores.

Setting a realistic redesign target requires knowing where the site sits relative to its actual competitive set, not relative to an absolute standard. A local HVAC company that moves from a 5.2 to a 6.8 has made a meaningful competitive improvement even though 6.8 would be below average for a fintech company. Industry-adjusted benchmarks make the improvement legible and the success criteria achievable.`,
      },
      {
        heading: "Average scores by vertical",
        body: `Healthcare (private practice and specialist clinics) averages a 6.8 in our scoring system. The category performs reasonably well on trust signals and professional photography — years of emphasis on patient trust have raised the floor. Where it underperforms is mobile optimization and CTA clarity. Healthcare sites tend to be conservative in their conversion design, which produces sites that feel credible but don't direct visitors to book appointments effectively.

SaaS averages a 7.2, the highest of any category we track. The combination of in-house design resources, user research culture, and conversion optimization investment produces consistently higher scores on UX fundamentals. The weakest dimension for SaaS is typically accessibility — the fast iteration pace of product teams often means WCAG compliance is treated as a secondary concern.

Local services (plumbers, HVAC, electricians, roofers) average a 5.9. These sites are often built on low-cost templates with minimal customization, which produces adequate functionality but weak visual design and poor trust signal implementation. The gap between a 5.9 average site and a well-executed local services site is substantial, which means there's meaningful competitive advantage available to local service businesses willing to invest in a proper redesign.

E-commerce averages a 6.5. The category has strong conversion mechanics but often struggles with brand differentiation — product pages and checkout flows are well-optimized, but the brand layer that creates preference and repeat purchase intent is frequently underdeveloped. Professional services (accounting, consulting, legal) average a 6.3, with strong trust signals but weak mobile optimization and conversion design.`,
      },
      {
        heading: "The three dimensions that vary most by industry",
        body: `Trust signals vary more by industry than any other scoring dimension. Healthcare and legal sites score highest on trust signals because the regulatory and professional context demands visible credibility — licenses, credentials, privacy notices, and professional affiliations are present by necessity. E-commerce and SaaS sites score lowest on trust signals relative to their overall scores because the investment in conversion mechanics hasn't always been matched by investment in the credibility layer.

Mobile optimization shows the largest variance between industries. SaaS companies, whose users are accustomed to mobile-first product experiences, invest more heavily in mobile web experience than local service companies whose customers have historically called rather than submitted web forms. The gap is narrowing as mobile search drives more local service discovery, but it remains the most underinvested dimension in traditionally offline industries.

Conversion mechanics — CTA placement, form design, value proposition clarity — vary significantly between industries with long conversion cycles (professional services, healthcare) and those with short ones (e-commerce, SaaS free trials). Long-cycle industries often underinvest in conversion design because their sales process involves multiple touchpoints regardless of website quality. The evidence suggests this is a mistake: even in long-cycle industries, the website's job is to generate the first contact, and conversion design directly affects how many first contacts the site produces.`,
      },
      {
        heading: "How to set realistic score targets for a redesign project",
        body: `The most useful score target for a redesign project is the industry 75th percentile — the score at which the site is clearly better than most competitors, without requiring a level of investment that's disproportionate to the business scale. For healthcare, that's approximately 7.5. For local services, it's approximately 7.0. For SaaS, it's approximately 8.0. For professional services, it's approximately 7.2.

The 75th percentile target is useful because it's specific enough to scope the project meaningfully, achievable in a single redesign cycle, and competitive enough to produce measurable business outcomes. Sites that reach the 75th percentile in their industry consistently report stronger inbound lead quality, lower bounce rates, and higher client-reported confidence in the brand.

To set the target effectively, audit the current site for an overall score and then score five direct competitors using the same rubric. Plot those scores to understand the competitive distribution. If the current site scores below the median, the first redesign target should be the median. If it's already above the median, targeting the 75th percentile is appropriate. Setting targets relative to the actual competitive set — rather than to an absolute ideal — keeps the redesign scope realistic and the success criteria achievable.`,
      },
      {
        heading: "Why a 7.5+ score correlates with stronger lead quality",
        body: `The correlation between site score and lead quality is one of the less obvious findings in our benchmark data. Sites that score above 7.5 consistently report not just more leads, but better leads — prospects who have already built a stronger mental model of the business before they make contact, who are less likely to request unnecessary scope changes, and who are more likely to convert from inquiry to paying client.

The mechanism is straightforward: a high-scoring site does more of the persuasion work before the first conversation. Strong trust signals pre-qualify the business in the prospect's mind. Clear value proposition language attracts people who understand what they're buying. Specific testimonials set expectations that attract clients whose situations match what the business is actually good at. When the site does this work well, the first sales conversation starts from a much stronger position.

This has a practical implication for how agencies should pitch website redesigns to clients who are skeptical of the ROI. The conversation shouldn't just be about more leads — it should include the quality improvement. A client who currently gets 15 low-quality leads per month and closes 2 of them is in a different position from a client who gets 10 higher-quality leads and closes 4 of them. The higher-scoring site often produces the second scenario, and the business outcome is better despite lower raw lead volume. Score the site, benchmark it against the industry, and frame the redesign in terms of both quantity and quality of the contacts the improved site will generate.`,
      },
    ],
  },
];
