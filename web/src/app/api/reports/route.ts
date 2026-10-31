import { NextResponse } from "next/server";

import { loadReportData } from "@/lib/reports/data";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const congregationId = params.get("congregationId");
  const period = params.get("period");
  if (!congregationId || !period) return NextResponse.json({ error: "congregation_and_period_required" }, { status: 400 });
  const { data: canRead, error: permissionError } = await supabase.rpc("has_congregation_permission", { target_congregation: congregationId, target_permission: "financial.read" });
  if (permissionError) return NextResponse.json({ error: "permission_check_failed" }, { status: 500 });
  if (!canRead) return NextResponse.json({ error: "congregation_access_denied" }, { status: 403 });
  const { data: membership } = await supabase.from("memberships").select("congregation_id").eq("user_id", user.id).eq("congregation_id", congregationId).maybeSingle();
  if (!membership) return NextResponse.json({ error: "congregation_access_denied" }, { status: 403 });
  try { return NextResponse.json({ data: await loadReportData(supabase, congregationId, period, user.email ?? null) }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "report_load_failed" }, { status: 400 }); }
}