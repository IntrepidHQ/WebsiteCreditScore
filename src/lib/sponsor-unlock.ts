import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

type SponsorTicket = {
  domain: string;
  jti: string;
  kind: "start" | "complete";
  nbf: number;
  exp: number;
};

const START_DELAY_SECONDS = 30;
const START_TTL_SECONDS = 5 * 60;
const COMPLETE_TTL_SECONDS = 5 * 60;

function secret(): string | null {
  // Reuses the existing operator secret until WCS_SPONSOR_SECRET is added in
  // Vercel. This keeps the feature deployable without exposing either value.
  return process.env.WCS_SPONSOR_SECRET ?? process.env.WCS_COMP_CODE ?? null;
}

function encode(ticket: SponsorTicket): string {
  const key = secret();
  if (!key) throw new Error("Sponsor unlock is not configured");
  const payload = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  const signature = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function decode(raw: string, expectedKind: SponsorTicket["kind"]): SponsorTicket | null {
  const key = secret();
  const [payload, signature] = raw.split(".");
  if (!key || !payload || !signature) return null;
  const expected = createHmac("sha256", key).update(payload).digest("base64url");
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) return null;
  try {
    const ticket = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SponsorTicket;
    if (ticket.kind !== expectedKind || ticket.exp < Math.floor(Date.now() / 1000)) return null;
    return ticket;
  } catch {
    return null;
  }
}

export function sponsorUnlockEnabled(): boolean {
  return Boolean(secret());
}

export function createSponsorStartTicket(domain: string): string {
  const now = Math.floor(Date.now() / 1000);
  return encode({ domain, jti: randomUUID(), kind: "start", nbf: now + START_DELAY_SECONDS, exp: now + START_TTL_SECONDS });
}

export function completeSponsorTicket(raw: string, domain: string): { ticket: string; jti: string } | null {
  const start = decode(raw, "start");
  const now = Math.floor(Date.now() / 1000);
  if (!start || start.domain !== domain || now < start.nbf) return null;
  const complete: SponsorTicket = { domain, jti: start.jti, kind: "complete", nbf: now, exp: now + COMPLETE_TTL_SECONDS };
  return { ticket: encode(complete), jti: complete.jti };
}

export function verifySponsorCompletion(raw: string, domain: string, jti: string | undefined): boolean {
  const ticket = decode(raw, "complete");
  return Boolean(ticket && ticket.domain === domain && ticket.jti === jti && Date.now() / 1000 >= ticket.nbf);
}

export const sponsorCookieName = "wcs_sponsor_session";
export const sponsorRedeemedCookieName = "wcs_sponsor_redeemed";
