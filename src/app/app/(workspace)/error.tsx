"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function WorkspaceErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[workspace-segment-error]", error.message, error.digest ?? "");
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col justify-center gap-6 px-4 py-16 text-center">
      <h1 className="font-display text-3xl tracking-tight text-foreground">Something broke</h1>
      <p className="text-sm leading-7 text-muted">
        The workspace screen hit an unexpected error. Try again, or sign out and back in. If you are
        the site owner, check server logs for{" "}
        <span className="font-mono text-xs text-foreground">{error.digest ?? "no-digest"}</span>.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button
          className="rounded-[10px] border border-border/70 bg-panel/80 px-4 py-2 text-sm font-semibold text-foreground"
          onClick={() => reset()}
          type="button"
        >
          Try again
        </button>
        <Link
          className="rounded-[10px] bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          href="/app/login"
        >
          Back to sign in
        </Link>
        <Link className="rounded-[10px] px-4 py-2 text-sm text-muted underline" href="/auth/logout">
          Sign out
        </Link>
      </div>
    </div>
  );
}
