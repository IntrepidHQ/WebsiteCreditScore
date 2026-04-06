"use client";

import { useState } from "react";

import { ArrowRight, Loader2 } from "lucide-react";

import { ScanUrlFieldGroup } from "@/components/common/scan-url-field-group";
import { Button } from "@/components/ui/button";

/**
 * Workspace scan: POST `/api/app/create-lead` via `fetch` + `redirect: "manual"` then
 * `window.location.assign` so the browser applies `Set-Cookie` from the redirect response
 * before the next document load (more reliable than a plain form POST for some Supabase flows).
 */
export const CreateLeadScanForm = ({
  autoFocus,
  idleSubmitLabel,
  pendingSubmitLabel,
  placeholder,
}: {
  autoFocus?: boolean;
  idleSubmitLabel: string;
  pendingSubmitLabel: string;
  placeholder: string;
}) => {
  const [url, setUrl] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      return;
    }

    setPending(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("url", trimmed);

      const response = await fetch("/api/app/create-lead", {
        method: "POST",
        body: formData,
        credentials: "include",
        redirect: "manual",
      });

      const location = response.headers.get("Location");
      if (response.status >= 300 && response.status < 400 && location) {
        const target = location.startsWith("http")
          ? location
          : `${window.location.origin}${location}`;
        window.location.assign(target);
        return;
      }

      setError("Could not start the scan. Try again or sign in if your session expired.");
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <ScanUrlFieldGroup
          autoFocus={autoFocus}
          disabled={pending}
          onValueChange={setUrl}
          placeholder={placeholder}
          value={url}
        />
        <Button
          aria-busy={pending}
          className="h-12 min-w-[10.5rem] sm:min-w-[12rem]"
          disabled={pending || !url.trim()}
          size="lg"
          type="submit"
        >
          {pending ? (
            <>
              <Loader2 aria-hidden className="size-4 animate-spin" />
              {pendingSubmitLabel}
            </>
          ) : (
            <>
              {idleSubmitLabel}
              <ArrowRight aria-hidden className="size-4" />
            </>
          )}
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
};
