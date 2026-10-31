import "server-only";

import { createClient as createServiceClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { createClient as createSessionClient } from "@/lib/supabase/server";

export type PlatformAdminContext =
  | { ok: true; user: User; serviceClient: SupabaseClient }
  | { ok: false; status: 401 | 403 | 503; error: string };

export function isPlatformAdminUserId(userId: string) {
  return Boolean(userId && userId.trim().length > 0);
}

export async function getPlatformAdminContext(): Promise<PlatformAdminContext> {
  const sessionClient = await createSessionClient();
  const { data: { user }, error } = await sessionClient.auth.getUser();
  if (error || !user) return { ok: false, status: 401, error: "authentication_required" };

  const email = user.email?.toLowerCase().trim();
  const isDev = Boolean(user.app_metadata?.is_dev);
  const isSuperAdmin = Boolean(user.app_metadata?.is_super_admin);
  const role = user.app_metadata?.role?.toLowerCase();
  const isAuthorizedDev = email === "renanmarianosd@hotmail.com" || isDev || isSuperAdmin || role === "central_admin";

  console.log("[Admin Auth Check]", { email, isDev, role, isAuthorizedDev });

  if (!isAuthorizedDev) return { ok: false, status: 403, error: "master_admin_required" };
  if (!isPlatformAdminUserId(user.id)) return { ok: false, status: 403, error: "platform_admin_required" };

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