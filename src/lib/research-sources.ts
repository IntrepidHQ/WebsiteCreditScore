/** Sources we cite in scans — external home + optional methodology article */
export type ResearchSourceCard = {
  name: string;
  domain: string;
  /** Primary outbound link */
  href: string;
  /** How we weight / read this signal in reports */
  blogSlug?: string;
};

export const RESEARCH_SOURCES_PER_SCAN: ResearchSourceCard[] = [
  { name: "Google Reviews", domain: "google.com", href: "https://www.google.com/maps", blogSlug: "online-reputation" },
  { name: "Trustpilot", domain: "trustpilot.com", href: "https://www.trustpilot.com", blogSlug: "online-reputation" },
  { name: "BBB", domain: "bbb.org", href: "https://www.bbb.org", blogSlug: "business-legitimacy" },
  { name: "Reddit", domain: "reddit.com", href: "https://www.reddit.com", blogSlug: "online-reputation" },
  { name: "LinkedIn", domain: "linkedin.com", href: "https://www.linkedin.com", blogSlug: "social-presence" },
  { name: "X / Twitter", domain: "x.com", href: "https://x.com", blogSlug: "social-presence" },
  { name: "Crunchbase", domain: "crunchbase.com", href: "https://www.crunchbase.com", blogSlug: "financial-signals" },
  { name: "SSL Labs", domain: "ssllabs.com", href: "https://www.ssllabs.com/ssltest/", blogSlug: "technical-health" },
  { name: "PageSpeed", domain: "pagespeed.web.dev", href: "https://pagespeed.web.dev", blogSlug: "ux-conversion" },
  { name: "Wayback Machine", domain: "archive.org", href: "https://web.archive.org", blogSlug: "longevity" },
  { name: "BuiltWith", domain: "builtwith.com", href: "https://builtwith.com", blogSlug: "technical-health" },
  { name: "Glassdoor", domain: "glassdoor.com", href: "https://www.glassdoor.com", blogSlug: "online-reputation" },
];
