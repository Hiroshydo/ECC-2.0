import "server-only";

import { isMasterAdmin } from "@/domain/access";
import { LocalSupabaseClient, type LocalUser } from "@/lib/db/client";
import { createClient as createSessionClient } from "@/lib/supabase/server";

export type PlatformAdminContext =
  | { ok: true; user: LocalUser; serviceClient: LocalSupabaseClient }
  | { ok: false; status: 401 | 403 | 503; error: string };

export async function getPlatformAdminContext(): Promise<PlatformAdminContext> {
  const sessionClient = await createSessionClient();
  const { data: { user }, error } = await sessionClient.auth.getUser();
  if (error || !user) return { ok: false, status: 401, error: "authentication_required" };

  if (!isMasterAdmin(user)) return { ok: false, status: 403, error: "master_admin_required" };

  return {
    ok: true,
    user,
    serviceClient: new LocalSupabaseClient(null, true),
  };
}