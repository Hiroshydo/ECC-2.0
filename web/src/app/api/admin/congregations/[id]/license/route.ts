import { NextResponse } from "next/server";

import { getPlatformAdminContext } from "@/lib/admin/platform";
import { withAdminTransaction } from "@/lib/db/pool";

type LicenseUpdate = {
  days?: unknown;
  maxOperators?: unknown;
  status?: unknown;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const authorization = await getPlatformAdminContext();
  if (!authorization.ok) {
    return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  }

  const { id } = await context.params;
  if (!UUID_PATTERN.test(id)) return NextResponse.json({ error: "congregation_id_invalid" }, { status: 400 });

  let input: LicenseUpdate;
  try {
    input = await request.json() as LicenseUpdate;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (!Number.isInteger(input.days) || (input.days as number) < 1 || (input.days as number) > 3650) {
    return NextResponse.json({ error: "license_days_invalid" }, { status: 400 });
  }
  if (!Number.isInteger(input.maxOperators) || (input.maxOperators as number) < 0 || (input.maxOperators as number) > 10000) {
    return NextResponse.json({ error: "license_quota_invalid" }, { status: 400 });
  }
  if (input.status !== "active" && input.status !== "grace_period" && input.status !== "blocked") {
    return NextResponse.json({ error: "license_status_invalid" }, { status: 400 });
  }

  const days = input.days as number;
  const maxOperators = input.maxOperators as number;
  const status = input.status;
  try {
    const data = await withAdminTransaction(async (client) => {
      const result = await client.query<{ id: string; license_expires_at: string }>(
        `update public.congregations
            set license_status = $1,
                license_expires_at = now() + make_interval(days => $2),
                license_cycle_days = $2,
                max_operators = $3
          where id = $4
          returning id, license_status, license_expires_at, license_cycle_days, max_operators`,
        [status, days, maxOperators, id],
      );
      const license = result.rows[0];
      if (!license) return null;

      await client.query(
        `insert into public.khatam_licenses (congregation_id, seats_total, expires_at)
         values ($1, $2, $3)
         on conflict (congregation_id) do update
           set seats_total = excluded.seats_total, expires_at = excluded.expires_at`,
        [id, maxOperators, license.license_expires_at],
      );
      await client.query(
        `insert into public.audit_events
           (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
         values ($1, $2, 'updated', 'khatam_licenses', $2, $3::jsonb, 'license_configured')`,
        [authorization.user.id, id, JSON.stringify({ status, days, maxOperators, expiresAt: license.license_expires_at })],
      );
      return license;
    });

    if (!data) return NextResponse.json({ error: "congregation_not_found" }, { status: 404 });
    return NextResponse.json({ data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Congregation license update failed:", error);
    return NextResponse.json({ error: "license_schema_or_database_unavailable" }, { status: 503 });
  }
}
