import { getSupabaseEnv } from "@/lib/supabase/config";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

import { DATAROOM_BUCKET } from "@/lib/dataroom/constants";

export type DataroomObjectRow = {
  path: string;
  name: string;
  size: number | null;
  createdAt: string | null;
  publicUrl: string;
};

const getPublicObjectUrl = (path: string) => {
  const { url } = getSupabaseEnv();
  const base = url.replace(/\/$/, "");
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  return `${base}/storage/v1/object/public/${DATAROOM_BUCKET}/${encodedPath}`;
};

export async function listDataroomForWorkspace(workspaceId: string): Promise<DataroomObjectRow[]> {
  const service = getSupabaseServiceClient();
  if (!service) {
    return [];
  }

  const { data, error } = await service.storage.from(DATAROOM_BUCKET).list(workspaceId, {
    limit: 100,
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error || !data) {
    console.warn("[dataroom/list]", error?.message ?? "empty");
    return [];
  }

  return data
    .filter((item) => Boolean(item?.name) && Boolean(item?.id))
    .map((item) => {
      const path = `${workspaceId}/${item.name}`;
      return {
        path,
        name: item.name,
        size: item.metadata?.size ?? null,
        createdAt: item.created_at ?? null,
        publicUrl: getPublicObjectUrl(path),
      };
    });
}

export async function uploadDataroomObject(
  workspaceId: string,
  objectName: string,
  bytes: Buffer,
  contentType: string,
): Promise<{ path: string; publicUrl: string } | null> {
  const service = getSupabaseServiceClient();
  if (!service) {
    return null;
  }

  const path = `${workspaceId}/${objectName}`;
  const { error } = await service.storage.from(DATAROOM_BUCKET).upload(path, bytes, {
    contentType,
    upsert: false,
  });

  if (error) {
    console.warn("[dataroom/upload]", error.message);
    return null;
  }

  return { path, publicUrl: getPublicObjectUrl(path) };
}

export async function deleteDataroomObject(path: string): Promise<boolean> {
  const service = getSupabaseServiceClient();
  if (!service) {
    return false;
  }

  const { error } = await service.storage.from(DATAROOM_BUCKET).remove([path]);
  if (error) {
    console.warn("[dataroom/delete]", error.message);
    return false;
  }
  return true;
}
