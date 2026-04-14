import { NextResponse } from "next/server";

import { getOptionalWorkspaceSessionFromRequest } from "@/lib/auth/session";
import { listDataroomForWorkspace } from "@/lib/dataroom/storage";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { getProductRepository } from "@/lib/product/repository";

export async function GET(request: Request) {
  const session = await getOptionalWorkspaceSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  if (!getSupabaseServiceClient()) {
    return NextResponse.json(
      {
        error: "Dataroom requires SUPABASE_SERVICE_ROLE_KEY and a cloud workspace.",
        code: "DATAROOM_UNAVAILABLE",
        items: [],
      },
      { status: 503 },
    );
  }

  const repository = getProductRepository(session);
  const workspace = await repository.ensureWorkspace(session, request);
  const items = await listDataroomForWorkspace(workspace.id);

  return NextResponse.json({ items });
}
