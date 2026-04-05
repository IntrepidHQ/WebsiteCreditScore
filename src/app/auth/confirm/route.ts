import { handleSupabaseAuthCallback } from "@/lib/supabase/auth-callback-handler";

/** Supabase email templates often default to `{{ .SiteURL }}/auth/confirm` — same logic as `/auth/callback`. */
export const GET = handleSupabaseAuthCallback;
