import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getOptionalWorkspaceSessionFromRequest } from "@/lib/auth/session";
import {
  DATAROOM_ALLOWED_MIME,
  DATAROOM_MAX_FILE_BYTES,
} from "@/lib/dataroom/constants";
import { uploadDataroomObject } from "@/lib/dataroom/storage";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getProductRepository } from "@/lib/product/repository";

const safeBaseName = (name: string) => {
  const trimmed = name.trim().replace(/[^a-zA-Z0-9._-]+/g, "_");
  return trimmed.slice(0, 96) || "upload";
};

export async function POST(request: Request) {
  const session = await getOptionalWorkspaceSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!getSupabaseServiceClient()) {
    return NextResponse.json(
      { error: "Dataroom requires SUPABASE_SERVICE_ROLE_KEY.", code: "DATAROOM_UNAVAILABLE" },
      { status: 503 },
    );
  }

  const repository = getProductRepository(session);
  const workspace = await repository.ensureWorkspace(session, request);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data." }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Missing file field." }, { status: 400 });
  }

  if (file.size > DATAROOM_MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: `File too large (max ${Math.floor(DATAROOM_MAX_FILE_BYTES / (1024 * 1024))}MB).` },
      { status: 413 },
    );
  }

  const mime = (file.type || "application/octet-stream").toLowerCase();
  if (!DATAROOM_ALLOWED_MIME.has(mime)) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 415 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base = safeBaseName(file.name.replace(/\.[^.]+$/, "") || "image");
  const ext =
    mime === "image/png"
      ? "png"
      : mime === "image/webp"
        ? "webp"
        : mime === "image/gif"
          ? "gif"
          : mime === "image/svg+xml"
            ? "svg"
            : "jpg";
  const objectName = `${Date.now()}-${randomUUID().slice(0, 8)}-${base}.${ext}`;

  const uploaded = await uploadDataroomObject(workspace.id, objectName, buffer, mime);
  if (!uploaded) {
    return NextResponse.json(
      { error: "Upload failed. Ensure the `dataroom` bucket exists (see supabase/migrations)." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    path: uploaded.path,
    publicUrl: uploaded.publicUrl,
  });
}
