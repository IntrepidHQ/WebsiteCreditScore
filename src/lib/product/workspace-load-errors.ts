import { redirect } from "next/navigation";

const messageFromUnknown = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === "object" && err !== null && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
};

/**
 * Maps Supabase/Postgres/product errors to a safe redirect instead of a generic 500.
 * Call from catch blocks after repository reads (dashboard, lead detail, etc.).
 */
export const redirectOnRecoverableProductError = (err: unknown): void => {
  const msg = messageFromUnknown(err);
  const code =
    typeof err === "object" && err !== null && "code" in err
      ? String((err as { code?: string }).code ?? "")
      : "";
  const details =
    typeof err === "object" && err !== null && "details" in err
      ? String((err as { details?: string }).details ?? "")
      : "";

  const haystack = `${msg} ${details}`.slice(0, 2000);

  console.error("[workspace-load-error]", {
    message: msg.slice(0, 500),
    details: details.slice(0, 300),
    code,
    name: err instanceof Error ? err.name : typeof err,
  });

  // Require Postgres-style missing relation (avoid "X does not exist" from other subsystems).
  const isMissingTable =
    haystack.includes("42P01") ||
    /undefined_table/i.test(haystack) ||
    (/relation/i.test(haystack) && /does not exist/i.test(haystack));

  const isDuplicateKey =
    code === "23505" || haystack.includes("23505") || haystack.includes("duplicate key");

  const isRlsOrPermission =
    code === "42501" ||
    haystack.includes("42501") ||
    code === "PGRST301" ||
    /row-level security|violates row-level security|RLS|permission denied/i.test(haystack);

  // Match Supabase/GoTrue style messages only — a bare "JWT" substring is too easy to false-positive.
  const isAuthDrift =
    /auth session missing|session missing|jwt expired|expired jwt|invalid jwt|invalid refresh token|refresh token not found|invalid claim|token (?:has )?expired/i.test(
      haystack,
    );

  const isNetworkOrUpstream =
    /fetch failed|ECONNRESET|ETIMEDOUT|502|503|504|Bad Gateway|Gateway Timeout/i.test(haystack);

  if (isMissingTable) {
    redirect("/app/login?error=db-not-ready");
  }

  if (isAuthDrift) {
    redirect("/app/login?error=workspace-unavailable");
  }

  if (isDuplicateKey || isRlsOrPermission) {
    redirect("/app/workspace-unavailable");
  }

  // Transient network / upstream issues: do not send users to login (session is usually still valid).
  if (isNetworkOrUpstream) {
    return;
  }

  // Remaining PGRST + Postgres codes (except common "no row" shape): still avoid login for PGRST116.
  if (
    (code.startsWith("PGRST") && code !== "PGRST116") ||
    (/^\d{5}$/.test(code) && !["23505", "42P01"].includes(code))
  ) {
    redirect("/app/login?error=workspace-unavailable");
  }
};
