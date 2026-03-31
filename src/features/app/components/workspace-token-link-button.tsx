"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowUpRight, MailPlus } from "lucide-react";

import type { TokenActionId } from "@/lib/billing/catalog";
import {
  consumeWorkspaceTokenAction,
  WorkspaceTokenActionError,
} from "@/lib/billing/client";
import { Button } from "@/components/ui/button";

export function WorkspaceTokenLinkButton({
  actionId,
  actionKey,
  children,
  href,
  iconName,
  label,
  newTab = false,
  variant = "default",
}: {
  actionId: TokenActionId;
  actionKey: string;
  children: React.ReactNode;
  href: string;
  iconName?: "mail-plus" | "arrow-up-right";
  label: string;
  newTab?: boolean;
  variant?: "default" | "secondary" | "outline" | "ghost";
}) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const Icon =
    iconName === "mail-plus"
      ? MailPlus
      : iconName === "arrow-up-right"
        ? ArrowUpRight
        : null;

  function navigate() {
    if (href.startsWith("mailto:")) {
      window.location.href = href;
      return;
    }

    if (newTab) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    router.push(href);
  }

  function handleClick() {
    startTransition(async () => {
      setErrorMessage(null);

      try {
        await consumeWorkspaceTokenAction({
          actionId,
          actionKey,
          label,
        });
        navigate();
      } catch (error) {
        if (
          error instanceof WorkspaceTokenActionError &&
          error.redirectTo
        ) {
          router.push(error.redirectTo);
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "This action could not be completed.",
        );
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        disabled={isPending}
        onClick={handleClick}
        variant={variant}
      >
        {Icon ? <Icon className="size-4" /> : null}
        {isPending ? "Unlocking…" : children}
      </Button>
      {errorMessage ? (
        <p className="text-xs leading-5 text-danger">{errorMessage}</p>
      ) : null}
    </div>
  );
}
