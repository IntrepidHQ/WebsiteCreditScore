import { createHash } from "node:crypto";

import { createClient } from "@supabase/supabase-js";

const TABLE = "public_ai_response_cache";
const DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    return null;
  }
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}

function hashKey(material: string) {
  return createHash("sha256").update(material).digest("hex").slice(0, 48);
}

export function buildAiCacheKey(kind: string, material: string) {
  return `${kind}:${hashKey(material)}`;
}

export async function readAiCache<T>(cacheKey: string): Promise<T | null> {
  const supabase = getServiceClient();
  if (!supabase) {
    return null;
  }

  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from(TABLE)
    .select("payload, expires_at")
    .eq("cache_key", cacheKey)
    .gt("expires_at", nowIso)
    .maybeSingle();

  if (error) {
    console.warn("[ai-response-cache] read failed:", error.message);
    return null;
  }

  if (!data?.payload) {
    return null;
  }

  return data.payload as T;
}

export async function writeAiCache(
  cacheKey: string,
  kind: string,
  payload: unknown,
  ttlMs: number = DEFAULT_TTL_MS,
): Promise<void> {
  const supabase = getServiceClient();
  if (!supabase) {
    return;
  }

  const expiresAt = new Date(Date.now() + ttlMs).toISOString();
  const { error } = await supabase.from(TABLE).upsert(
    {
      cache_key: cacheKey,
      kind,
      payload,
      expires_at: expiresAt,
    },
    { onConflict: "cache_key" },
  );

  if (error) {
    console.warn("[ai-response-cache] write failed:", error.message);
  }
}

export async function pruneExpiredAiCache(): Promise<void> {
  const supabase = getServiceClient();
  if (!supabase) {
    return;
  }

  const nowIso = new Date().toISOString();
  const { error } = await supabase.from(TABLE).delete().lte("expires_at", nowIso);
  if (error) {
    console.warn("[ai-response-cache] prune failed:", error.message);
  }
}
