import { NextResponse } from "next/server";

import { parseUnitFilters } from "@/modules/core/canaa/services/units.filters";
import {
  getNetworkHealth,
  listUnits,
  UnitAuthorizationError,
  type UnitReadScope,
} from "@/modules/core/canaa/services/units.service";

function readScope(url: URL): UnitReadScope | null {
  const mode = url.searchParams.get("scope");
  if (mode === null || mode === "global") return { kind: "global" };
  if (mode !== "branch") return null;
  const rootId = url.searchParams.get("rootId");
  if (!rootId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(rootId)) return null;
  return { kind: "branch", rootId };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const scope = readScope(url);
  if (!scope) return NextResponse.json({ error: "unit_scope_invalid" }, { status: 400 });

  try {
    const [units, networkHealth] = await Promise.all([
      listUnits(parseUnitFilters(url.searchParams), scope),
      getNetworkHealth(scope),
    ]);
    return NextResponse.json(
      { data: { ...units, networkHealth } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof UnitAuthorizationError) {
      const status = error.code === "authentication_required" ? 401 : 403;
      return NextResponse.json({ error: error.code }, { status, headers: { "Cache-Control": "no-store" } });
    }
    console.error("Units query failed:", error);
    return NextResponse.json({ error: "units_load_failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}
