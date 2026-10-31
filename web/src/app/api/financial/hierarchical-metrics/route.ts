import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

type MetricsRequest = {
  unitId: string;
  mode: "local" | "consolidated";
  startDate: string;
  endDate: string;
};

export async function GET(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });

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

  const { data, error } = await supabase.rpc("get_hierarchical_financial_metrics", {
    p_user_id: user.id,
    p_unit_id: input.unitId,
    p_mode: input.mode,
    p_start_date: input.startDate,
    p_end_date: input.endDate,
  });
  if (error) {
    const status = error.code === "42501" ? 403 : 400;
    return NextResponse.json({ error: error.message }, { status, headers: { "Cache-Control": "no-store" } });
  }

  return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
}
