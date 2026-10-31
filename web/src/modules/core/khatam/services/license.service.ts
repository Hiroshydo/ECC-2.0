import "server-only";

import { createServiceClient } from "@/lib/supabase/admin";
import type { LicenseInfo } from "@/modules/core/khatam/services/license.shared";

export type { LicenseInfo } from "@/modules/core/khatam/services/license.shared";

export async function getLicense(congregationId: string): Promise<LicenseInfo | null> {
  const supabase = createServiceClient();
  if (!supabase) return null;

  const { data: license, error: licenseError } = await supabase
    .from("khatam_licenses")
    .select("seats_total, expires_at")
    .eq("congregation_id", congregationId)
    .maybeSingle();

  if (licenseError) {
    if (licenseError.code !== "42P01" && licenseError.code !== "PGRST205") {
      console.error("Khatam license load failed:", licenseError);
    }
    return null;
  }
  if (!license) return null;

  const { count, error: membershipError } = await supabase
    .from("memberships")
    .select("user_id", { count: "exact", head: true })
    .eq("congregation_id", congregationId);

  if (membershipError) {
    console.error("Khatam license usage load failed:", membershipError);
    return null;
  }

  return {
    seatsTotal: license.seats_total,
    seatsUsed: count ?? 0,
    expiresAt: license.expires_at,
  };
}
