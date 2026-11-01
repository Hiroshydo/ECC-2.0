import { NextResponse } from "next/server";

import {
  getUnitDetail,
  UnitAuthorizationError,
  type UnitReadScope,
} from "@/modules/core/canaa/services/units.service";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readScope(url: URL): UnitReadScope | null {
  const mode = url.searchParams.get("scope");
  if (mode === null || mode === "global") return { kind: "global" };
  if (mode !== "branch") return null;
  const rootId = url.searchParams.get("rootId");
  return rootId && UUID_PATTERN.test(rootId) ? { kind: "branch", rootId } : null;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const url = new URL(request.url);
  const scope = readScope(url);
  const { id } = await context.params;
  if (!scope || !UUID_PATTERN.test(id)) return NextResponse.json({ error: "unit_request_invalid" }, { status: 400 });

  try {
    const detail = await getUnitDetail(id, scope);
    if (!detail) return NextResponse.json({ error: "unit_not_found" }, { status: 404 });
    return NextResponse.json({ data: detail }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof UnitAuthorizationError) {
      const status = error.code === "authentication_required" ? 401 : 403;
      return NextResponse.json({ error: error.code }, { status, headers: { "Cache-Control": "no-store" } });
    }
    console.error("Unit detail query failed:", error);
    return NextResponse.json({ error: "unit_detail_load_failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
