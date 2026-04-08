import { hasSupabaseEnv } from "@/lib/supabase/config";

/**
 * Local dev without `.env.local` should still show the login layout; auth actions stay disabled until env is set.
 */
export const LoginSupabaseEnvBanner = () => {
  if (hasSupabaseEnv()) {
    return null;
  }

  return (
    <div
      className="mb-6 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-foreground"
      role="status"
    >
      <p className="font-medium text-foreground">Auth is not configured in this environment.</p>
      <p className="mt-2 text-muted">
        The page below is the real UI. To sign in locally, add{" "}
        <code className="text-foreground">NEXT_PUBLIC_SUPABASE_URL</code> and a public anon key as{" "}
        <code className="text-foreground">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>,{" "}
        <code className="text-foreground">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code>, or{" "}
        <code className="text-foreground">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code> to{" "}
        <code className="text-foreground">.env.local</code> (see README), then restart{" "}
        <code className="text-foreground">pnpm dev</code>. On Vercel, set the same variables for Production and redeploy.
      </p>
    </div>
  );
};
