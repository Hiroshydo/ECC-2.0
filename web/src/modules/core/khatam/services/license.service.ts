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
    }>(
      `select license.seats_total, license.expires_at, count(membership.user_id)::int as seats_used
         from public.khatam_licenses license
         left join public.memberships membership
           on membership.congregation_id = license.congregation_id
        where license.congregation_id = $1
        group by license.congregation_id`,
      [congregationId],
    );
    const license = result.rows[0];
    if (!license) return null;

    return {
      seatsTotal: license.seats_total,
      seatsUsed: license.seats_used,
      expiresAt: license.expires_at,
    };
  } catch (error) {
    console.error("Khatam license load failed:", error);
    return null;
  }
}
