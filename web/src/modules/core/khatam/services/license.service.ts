import "server-only";

import { adminQuery } from "@/lib/db/pool";
import type { LicenseInfo } from "@/modules/core/khatam/services/license.shared";

export type { LicenseInfo } from "@/modules/core/khatam/services/license.shared";

export async function getLicense(congregationId: string): Promise<LicenseInfo | null> {
  try {
    const result = await adminQuery<{
      seats_total: number;
      seats_used: number;
      expires_at: string;
      license_status?: "active" | "grace_period" | "blocked" | null;
      license_cycle_days?: number | null;
    }>(
      `select coalesce(congregation.max_operators, license.seats_total) as seats_total,
              coalesce(congregation.license_expires_at, license.expires_at) as expires_at,
              congregation.license_status,
              congregation.license_cycle_days,
              count(membership.user_id)::int as seats_used
         from public.congregations congregation
         left join public.khatam_licenses license on license.congregation_id = congregation.id
         left join public.memberships membership on membership.congregation_id = congregation.id
        where congregation.id = $1
          and (congregation.license_expires_at is not null or license.congregation_id is not null)
        group by congregation.id, license.congregation_id`,
      [congregationId],
    );
    const license = result.rows[0];
    if (!license) return null;

    return {
      seatsTotal: license.seats_total,
      seatsUsed: license.seats_used,
      expiresAt: license.expires_at,
      status: license.license_status ?? "active",
      cycleDays: license.license_cycle_days ?? 30,
    };
  } catch (error) {
    const databaseError = error as { code?: string };
    if (databaseError.code !== "42703") {
      console.error("Khatam license load failed:", error);
    }
    try {
      const legacyResult = await adminQuery<{
        seats_total: number;
        seats_used: number;
        expires_at: string;
      }>(
        `select license.seats_total, license.expires_at, count(membership.user_id)::int as seats_used
           from public.khatam_licenses license
           left join public.memberships membership on membership.congregation_id = license.congregation_id
          where license.congregation_id = $1
          group by license.congregation_id`,
        [congregationId],
      );
      const legacyLicense = legacyResult.rows[0];
      return legacyLicense ? {
        seatsTotal: legacyLicense.seats_total,
        seatsUsed: legacyLicense.seats_used,
        expiresAt: legacyLicense.expires_at,
        status: "active",
        cycleDays: 30,
      } : null;
    } catch (legacyError) {
      console.error("Legacy Khatam license load failed:", legacyError);
      return null;
    }
  }
}
