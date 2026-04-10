import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let _service: SupabaseClient | null | undefined;

/**
 * Service-role client for server-only tasks (e.g. Dataroom uploads). Returns null when not configured.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  if (_service === undefined) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    if (!url || !key) {
      _service = null;
    } else {
      _service = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
  }
  return _service;
}
