import "server-only";

import { isMasterAdmin } from "@/domain/access";
import { getCurrentUser, type AppUser } from "@/lib/auth/session";

export type PlatformAdminContext =
  | { ok: true; user: AppUser }
  | { ok: false; status: 401 | 403 | 503; error: string };

export async function getPlatformAdminContext(): Promise<PlatformAdminContext> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, status: 401, error: "authentication_required" };

  if (!isMasterAdmin(user)) return { ok: false, status: 403, error: "master_admin_required" };

  if (!process.env.DATABASE_ADMIN_URL) return { ok: false, status: 503, error: "admin_database_not_configured" };
  return { ok: true, user };
}