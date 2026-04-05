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
 * Maps Supabase/Postgres/product errors to a login redirect instead of a generic 500.
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

  // #region agent log
  fetch("http://127.0.0.1:7460/ingest/f3e69962-c2ab-4d8a-81a8-8fb4ae2a364a", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Debug-Session-Id": "8c27eb" },
    body: JSON.stringify({
      sessionId: "8c27eb",
      hypothesisId: "A-db-classify",
      location: "workspace-load-errors.ts:classify",
      message: "recoverable error classification",
      data: {
        isMissingTable,
        code,
        msgSnippet: msg.slice(0, 200),
        detailsSnippet: details.slice(0, 200),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  console.error("[debug-8c27eb] workspace-load classify", {
    isMissingTable,
    code,
    msgSnippet: msg.slice(0, 200),
  });
  // #endregion

  const isDuplicateKey =
    code === "23505" || haystack.includes("23505") || haystack.includes("duplicate key");

  const isRlsOrPermission =
    code === "42501" ||
    haystack.includes("42501") ||
    code === "PGRST301" ||
    /row-level security|violates row-level security|RLS|permission denied/i.test(haystack);

  const isAuthDrift =
    /JWT|jwt expired|refresh token|Auth session missing|session missing|invalid claim/i.test(
      haystack,
    );

  const isNetworkOrUpstream =
    /fetch failed|ECONNRESET|ETIMEDOUT|502|503|504|Bad Gateway|Gateway Timeout/i.test(haystack);

  if (isMissingTable) {
    redirect("/app/login?error=db-not-ready");
  }

  if (isDuplicateKey || isRlsOrPermission || isAuthDrift || isNetworkOrUpstream) {
    redirect("/app/login?error=workspace-unavailable");
  }

  // Any other PostgREST / Postgres error code from Supabase (avoids opaque 500 digests in prod).
  if (code.startsWith("PGRST") || /^\d{5}$/.test(code)) {
    redirect("/app/login?error=workspace-unavailable");
  }
};
