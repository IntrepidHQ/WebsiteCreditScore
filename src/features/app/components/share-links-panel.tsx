import Link from "next/link";
import { ExternalLink, FileText, LayoutPanelLeft, Mail } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyLinkButton } from "@/features/app/components/copy-link-button";
import type { ShareLinkRecord } from "@/lib/types/product";

const surfaceMeta = {
  audit: {
    label: "Audit share",
    icon: LayoutPanelLeft,
  },
  packet: {
    label: "Packet share",
    icon: FileText,
  },
  brief: {
    label: "Brief share",
    icon: Mail,
  },
} as const;

export function ShareLinksPanel({
  baseUrl,
  leadId,
  shareLinks,
}: {
  baseUrl: string;
  leadId: string;
  shareLinks: ShareLinkRecord[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[clamp(2.8rem,2.1rem+0.9vw,4rem)] leading-[0.9]">
          Public share links
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {shareLinks.map((shareLink) => {
          const url = `${baseUrl}/${shareLink.surface}/${leadId}?share=${shareLink.token}`;
          const meta = surfaceMeta[shareLink.surface];

          return (
            <div
              className="rounded-[10px] border border-border/70 bg-background-alt/70 p-4"
              key={shareLink.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <meta.icon className="size-4 text-accent" />
                    <p className="font-semibold text-foreground">{meta.label}</p>
                  </div>
                  <p className="mt-2 text-sm text-muted">
                    {shareLink.views} view{shareLink.views === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <CopyLinkButton label="Copy" value={url} />
                  <Link
                    className="inline-flex items-center gap-2 rounded-[8px] border border-border/70 bg-panel/60 px-3 py-2 text-sm font-medium text-foreground transition hover:border-accent/30"
                    href={url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <ExternalLink className="size-4" />
                    Open
                  </Link>
                </div>
              </div>
              <p className="mt-3 truncate text-xs text-muted">{url}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
