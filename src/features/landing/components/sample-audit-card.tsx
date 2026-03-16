/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Building2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SampleAuditCard as SampleAuditCardType } from "@/lib/types/audit";
import { createWebsiteScreenshotUrl } from "@/lib/utils/url";

export function SampleAuditCard({ audit }: { audit: SampleAuditCardType }) {
  const liveScreenshot = createWebsiteScreenshotUrl(audit.previewUrl ?? audit.url);
  const [imageSrc, setImageSrc] = useState(liveScreenshot);

  useEffect(() => {
    setImageSrc(liveScreenshot);
  }, [liveScreenshot]);

  return (
    <Link href={`/audit/${audit.id}`} className="block h-full">
      <Card className="group h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-accent/30">
        <div className="relative aspect-[16/10] overflow-hidden bg-background-alt">
          <img
            alt={`${audit.title} preview`}
            className="h-full w-full object-cover object-top transition duration-500 group-hover:scale-[1.02]"
            onError={() => {
              if (imageSrc !== audit.previewImage) {
                setImageSrc(audit.previewImage);
              }
            }}
            src={imageSrc}
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-background/35 via-transparent to-transparent" />
        </div>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <Badge variant="accent">{audit.profile.replace("-", " ")}</Badge>
            <ArrowUpRight className="size-4 text-muted transition group-hover:text-accent" />
          </div>
          <CardTitle className="text-2xl">{audit.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="line-clamp-3 text-sm leading-6 text-muted">{audit.summary}</p>
          {audit.highlights?.length ? (
            <div className="space-y-2">
              {audit.highlights.slice(0, 2).map((highlight) => (
                <p
                  className="rounded-[8px] border border-border/70 bg-background-alt/70 px-3 py-3 text-sm leading-6 text-foreground"
                  key={highlight}
                >
                  {highlight}
                </p>
              ))}
            </div>
          ) : null}
          <div className="inline-flex items-center gap-2 text-sm text-foreground">
            <Building2 className="size-4 text-accent" />
            {audit.url}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
