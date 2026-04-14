import { NextResponse } from "next/server";

import { getOptionalWorkspaceSessionFromRequest } from "@/lib/auth/session";
import { deleteDataroomObject } from "@/lib/dataroom/storage";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getProductRepository } from "@/lib/product/repository";

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

  let body: { path?: string };
  try {
    body = (await request.json()) as { path?: string };
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const path = String(body.path ?? "").trim();
  if (!path || path.includes("..")) {
    return NextResponse.json({ error: "Invalid path." }, { status: 400 });
  }

  const repository = getProductRepository(session);
  const workspace = await repository.ensureWorkspace(session, request);

  if (!path.startsWith(`${workspace.id}/`)) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const ok = await deleteDataroomObject(path);
  if (!ok) {
    return NextResponse.json({ error: "Delete failed." }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
