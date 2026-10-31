import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { callUserFunction } from "@/lib/db/rpc";

type MetricsRequest = {
  unitId: string;
  mode: "local" | "consolidated";
  startDate: string;
  endDate: string;
};

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

  const params = new URL(request.url).searchParams;
  const input: MetricsRequest = {
    unitId: params.get("unitId") ?? "",
    mode: params.get("mode") === "consolidated" ? "consolidated" : "local",
    startDate: params.get("startDate") ?? "",
    endDate: params.get("endDate") ?? "",
  };
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  if (!input.unitId || !isoDate.test(input.startDate) || !isoDate.test(input.endDate) || input.endDate < input.startDate) {
    return NextResponse.json({ error: "unit_and_valid_date_range_required" }, { status: 400 });
  }

  try {
    const data = await callUserFunction(user.id, "get_hierarchical_financial_metrics", {
      p_user_id: user.id,
      p_unit_id: input.unitId,
      p_mode: input.mode,
      p_start_date: input.startDate,
      p_end_date: input.endDate,
    });
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = typeof error === "object" && error !== null && "code" in error && error.code === "42501" ? 403 : 400;
    console.error("Hierarchical financial metrics query failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "metrics_query_failed" }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
