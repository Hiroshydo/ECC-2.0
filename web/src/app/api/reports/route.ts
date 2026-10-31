import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { withUserContext } from "@/lib/db/pool";
import { loadReportData } from "@/lib/reports/data";

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
  const params = new URL(request.url).searchParams;
  const congregationId = params.get("congregationId");
  const period = params.get("period");
  if (!congregationId || !period || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    return NextResponse.json({ error: "congregation_and_valid_period_required" }, { status: 400 });
  }
  try {
    const access = await withUserContext(user.id, async (client) => {
      const result = await client.query<{ can_read: boolean; has_membership: boolean }>(
        `select public.has_congregation_permission($1, 'financial.read') as can_read,
                exists(select 1 from public.memberships where user_id = $2 and congregation_id = $1) as has_membership`,
        [congregationId, user.id],
      );
      return result.rows[0];
    });
    if (!access?.can_read || !access.has_membership) {
      return NextResponse.json({ error: "congregation_access_denied" }, { status: 403 });
    }
    return NextResponse.json({
      data: await loadReportData(user.id, congregationId, period, user.email),
    });
  } catch (error) {
    console.error("Report load failed:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "report_load_failed" }, { status: 400 });
  }
}