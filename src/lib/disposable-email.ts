/**
 * Disposable / throwaway email domains used to farm free Aerial scans.
 *
 * A free scan still costs us real Anthropic credits, so the email-per-claim
 * uniqueness guard is only meaningful if the email is hard to mint at scale.
 * This blocklist rejects the most common disposable-mailbox providers at the
 * OTP-request step. It is intentionally a curated, high-signal list (not an
 * exhaustive one) — extend it as abuse patterns appear in the logs.
 *
 * Matching is suffix-based so subdomains (e.g. "foo.mailinator.com") are caught.
 */
const DISPOSABLE_EMAIL_DOMAINS = new Set<string>([
  "mailinator.com",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.net",
  "guerrillamail.org",
  "sharklasers.com",
  "grr.la",
  "10minutemail.com",
  "10minutemail.net",
  "tempmail.com",
  "temp-mail.org",
  "tempmailo.com",
  "throwawaymail.com",
  "yopmail.com",
  "yopmail.net",
  "getnada.com",
  "nada.email",
  "dispostable.com",
  "trashmail.com",
  "trashmail.de",
  "mailnesia.com",
  "maildrop.cc",
  "fakeinbox.com",
  "mohmal.com",
  "emailondeck.com",
  "moakt.com",
  "tmpmail.org",
  "tmpmail.net",
  "spam4.me",
  "mailcatch.com",
  "inboxkitten.com",
  "tempr.email",
  "discard.email",
  "maildrop.cc",
  "burnermail.io",
  "33mail.com",
  "anonaddy.com",
  "anonaddy.me",
  "mailsac.com",
  "harakirimail.com",
  "fakemailgenerator.com",
  "emltmp.com",
  "luxusmail.org",
  "byom.de",
]);

/**
 * Returns true if the email's domain is a known disposable-mailbox provider.
 * Accepts a full email address (anything before the last "@" is ignored).
 */
export function isDisposableEmail(email: string): boolean {
  const at = email.lastIndexOf("@");
  if (at === -1) return false;
  const domain = email.slice(at + 1).trim().toLowerCase();
  if (!domain) return false;

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return true;

  // Suffix match so subdomains of a blocked provider are also rejected.
  for (const blocked of DISPOSABLE_EMAIL_DOMAINS) {
    if (domain.endsWith(`.${blocked}`)) return true;
  }
  return false;
}
