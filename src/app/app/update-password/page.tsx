import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BrandWordmarkLinkThemed } from "@/components/common/brand-wordmark-link-themed";
import { getOptionalWorkspaceSession } from "@/lib/auth/session";

import { LoginLatticeBackdrop } from "@/app/app/login/login-lattice-backdrop";

export default async function UpdatePasswordPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getOptionalWorkspaceSession();

  if (!session) {
    redirect("/app/login?error=session-required");
  }

  const resolvedSearchParams = (await searchParams) ?? {};
  const authError =
    typeof resolvedSearchParams.error === "string" ? resolvedSearchParams.error : null;

  const errorMessage = (code: string | null): string | null => {
    switch (code) {
      case "password-too-short":
        return "Password must be at least 8 characters.";
      case "passwords-do-not-match":
        return "Passwords do not match. Please try again.";
      case "update-failed":
        return "Could not update your password. The reset link may have expired — request a new one.";
      default:
        return code ? "Something went wrong. Please try again." : null;
    }
  };

  const error = errorMessage(authError);

  return (
    <div
      className="relative isolate min-h-screen overflow-hidden bg-background max-md:flex max-md:flex-col max-md:gap-6 max-md:px-5 max-md:py-6 sm:max-md:px-6 md:grid md:h-[100dvh] md:min-h-0 md:grid-cols-1 md:grid-rows-[auto_minmax(0,1fr)] md:gap-0 md:overflow-hidden md:px-0 md:py-0 lg:grid-cols-[minmax(0,1fr)_minmax(15.5rem,21vw)] lg:grid-rows-[auto_minmax(0,1fr)]"
      id="update-password-root"
    >
      <LoginLatticeBackdrop />

      {/* Top bar */}
      <div className="order-1 flex shrink-0 items-center border-b border-border/50 pb-5 sm:pb-6 md:col-span-1 md:row-start-1 md:border-border/55 md:px-8 md:pb-5 md:pt-6 lg:col-span-2 lg:px-10">
        <BrandWordmarkLinkThemed className="shrink-0" />
      </div>

      {/* Form column */}
      <div className="order-2 flex min-h-0 flex-1 flex-col items-center justify-center gap-0 md:col-span-1 md:row-start-2 lg:col-start-2 lg:row-start-2 lg:border-l lg:border-border/55 lg:px-6 lg:py-10 xl:px-8">
        <div className="mx-auto w-full min-w-0 max-w-md lg:max-w-[17.5rem]">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">Set a new password</h2>
              <p className="mt-1.5 text-sm text-muted">
                Choose a password with at least 8 characters.
              </p>
            </div>

            <form action="/auth/update-password" className="space-y-4" method="post">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="new-password">
                  New password
                </label>
                <Input
                  autoComplete="new-password"
                  autoFocus
                  id="new-password"
                  minLength={8}
                  name="password"
                  placeholder="At least 8 characters"
                  required
                  type="password"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground" htmlFor="confirm-password">
                  Confirm password
                </label>
                <Input
                  autoComplete="new-password"
                  id="confirm-password"
                  minLength={8}
                  name="confirm"
                  placeholder="Repeat password"
                  required
                  type="password"
                />
              </div>
              <Button className="w-full" type="submit">
                Update password
              </Button>
            </form>

            {error ? (
              <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
