# Security Policy

## Reporting a vulnerability

Please email **security@websitecreditscore.com** with:

- A description of the issue and the impact you believe it has.
- Steps to reproduce (proof-of-concept is appreciated but not required).
- Any environment details that help us isolate the issue.

We acknowledge reports within **3 business days** and aim to provide a triage update within **7 business days**.

## Scope

In scope:

- The production site (`websitecreditscore.com`) and its API routes.
- Authentication and session handling.
- Billing and webhook endpoints.
- Any admin surface (`/admin`).
- Supabase storage buckets used by the application (`screenshots`, `dataroom`).

Out of scope (please do not test):

- Denial-of-service attacks.
- Social engineering of our team, customers, or third-party providers (Supabase, Stripe, Vercel, Anthropic, Firecrawl, Browserless).
- Physical attacks.
- Testing against other customers' workspaces without permission.
- Automated scanners that generate high request volumes.

## Disclosure

We follow a **90-day coordinated disclosure** policy. After a fix ships (or 90 days from initial report, whichever comes first), we may publish details of the issue and the fix. We'll coordinate timing with the reporter where possible.

## Safe harbor

We will not pursue legal action against researchers who:

- Make a good-faith effort to avoid privacy violations, service disruption, or data destruction.
- Do not access, modify, or exfiltrate data beyond what is necessary to demonstrate the issue.
- Report the issue to us promptly and give us reasonable time to respond before any public disclosure.

## Acknowledgments

We recognize reporters in a public hall of fame (opt-in) once a fix has shipped. We do not operate a monetary bounty program today; that may change as the business scales.

## Out-of-band recognition

If the reported issue is severe (e.g. data exposure, authentication bypass, remote code execution), we will consider a discretionary thank-you payment or swag. This is not a formal program — please don't report expecting payment.
