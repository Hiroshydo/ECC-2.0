import "server-only";

import { createClient as createServiceClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { isMasterAdmin } from "@/domain/access";
import { createClient as createSessionClient } from "@/lib/supabase/server";

export type PlatformAdminContext =
  | { ok: true; user: User; serviceClient: SupabaseClient }
  | { ok: false; status: 401 | 403 | 503; error: string };

export async function getPlatformAdminContext(): Promise<PlatformAdminContext> {
  const sessionClient = await createSessionClient();
  const { data: { user }, error } = await sessionClient.auth.getUser();
  if (error || !user) return { ok: false, status: 401, error: "authentication_required" };

  if (!isMasterAdmin(user)) return { ok: false, status: 403, error: "master_admin_required" };

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return { ok: false, status: 503, error: "admin_server_environment_missing" };

  return {
    ok: true,
    user,
    serviceClient: createServiceClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    }),
  };
}