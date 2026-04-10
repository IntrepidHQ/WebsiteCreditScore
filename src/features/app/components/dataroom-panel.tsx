"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Copy, Loader2, Trash2, UploadCloud } from "lucide-react";

import { SectionHeading } from "@/components/common/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DATAROOM_MAX_FILE_BYTES } from "@/lib/dataroom/constants";

type DataroomItem = {
  path: string;
  name: string;
  size: number | null;
  createdAt: string | null;
  publicUrl: string;
};

export const DataroomPanel = () => {
  const titleId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<DataroomItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/app/dataroom/list", { credentials: "same-origin" });
      const data = (await res.json()) as { items?: DataroomItem[]; error?: string; code?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not load Dataroom.");
        setItems([]);
        return;
      }
      setItems(data.items ?? []);
    } catch {
      setError("Network error loading Dataroom.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpload = useCallback(
    async (fileList: FileList | null) => {
      const file = fileList?.[0];
      if (!file || uploading) {
        return;
      }
      if (file.size > DATAROOM_MAX_FILE_BYTES) {
        setError(`Each file must be under ${Math.floor(DATAROOM_MAX_FILE_BYTES / (1024 * 1024))}MB.`);
        return;
      }

      setUploading(true);
      setError(null);
      setStatus(null);

      try {
        const form = new FormData();
        form.set("file", file);
        const res = await fetch("/api/app/dataroom/upload", {
          method: "POST",
          credentials: "same-origin",
          body: form,
        });
        const data = (await res.json()) as { publicUrl?: string; error?: string };
        if (!res.ok) {
          setError(data.error ?? "Upload failed.");
          return;
        }
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        setStatus("Uploaded. URL is ready for MAX handoffs.");
        await load();
      } catch {
        setError("Upload failed — check your connection.");
      } finally {
        setUploading(false);
      }
    },
    [load, uploading],
  );

  const handleDelete = useCallback(
    async (path: string) => {
      setError(null);
      try {
        const res = await fetch("/api/app/dataroom/delete", {
          method: "POST",
          credentials: "same-origin",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path }),
        });
        const data = (await res.json()) as { error?: string };
        if (!res.ok) {
          setError(data.error ?? "Delete failed.");
          return;
        }
        await load();
      } catch {
        setError("Delete failed.");
      }
    },
    [load],
  );

  const handleCopyUrl = useCallback(async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setStatus("URL copied to clipboard.");
    } catch {
      setError("Could not copy to clipboard.");
    }
  }, []);

  return (
    <section aria-labelledby={titleId} className="space-y-4">
      <SectionHeading
        description="Upload client-ready images (logos, photography, UI). Public URLs are embedded automatically in MAX handoffs. Requires Supabase Storage + service role (see migration)."
        eyebrow="Assets"
        title="Dataroom"
      />
      <Card className="border-border/70">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl" id={titleId}>
            Image library
          </CardTitle>
          <p className="text-sm text-muted">
            Max {Math.floor(DATAROOM_MAX_FILE_BYTES / (1024 * 1024))}MB per file · JPEG, PNG, WebP, GIF, SVG
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              aria-label="Upload image to Dataroom"
              className="sr-only"
              disabled={uploading}
              onChange={(e) => void handleUpload(e.target.files)}
              type="file"
            />
            <Button
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              type="button"
              variant="secondary"
            >
              {uploading ? (
                <Loader2 aria-hidden className="size-4 animate-spin" />
              ) : (
                <UploadCloud aria-hidden className="size-4" />
              )}
              Upload image
            </Button>
            <Button disabled={loading} onClick={() => void load()} type="button" variant="outline">
              Refresh
            </Button>
          </div>
          {error ? (
            <p className="text-sm text-danger" role="alert">
              {error}
            </p>
          ) : null}
          {status ? (
            <p className="text-sm text-muted" role="status">
              {status}
            </p>
          ) : null}
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted">
              <Loader2 aria-hidden className="size-4 animate-spin" />
              Loading…
            </div>
          ) : items.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border/60 bg-background-alt/40 px-4 py-8 text-center text-sm text-muted">
              No uploads yet. Add images here, then regenerate a MAX handoff to pull URLs into the builder prompt.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  className="flex flex-col gap-3 rounded-xl border border-border/60 bg-panel/50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  key={item.path}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{item.name}</p>
                    <p className="truncate text-xs text-muted">{item.publicUrl}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      aria-label={`Copy URL for ${item.name}`}
                      onClick={() => void handleCopyUrl(item.publicUrl)}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <Copy className="size-4" />
                      Copy URL
                    </Button>
                    <Button
                      aria-label={`Delete ${item.name}`}
                      onClick={() => void handleDelete(item.path)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
