import "server-only";

import { platformOperatorAccessStatus } from "@/domain/access";
import { LocalSupabaseClient, type LocalUser } from "@/lib/db/client";
import { createClient as createSessionClient } from "@/lib/supabase/server";

export type PlatformAdminContext =
  | { ok: true; user: LocalUser; serviceClient: LocalSupabaseClient }
  | { ok: false; status: 401 | 403 | 503; error: string };

export async function getPlatformAdminContext(): Promise<PlatformAdminContext> {
  const sessionClient = await createSessionClient();
  const { data: { user }, error } = await sessionClient.auth.getUser();
  if (error) return { ok: false, status: 401, error: "authentication_required" };
  if (!user) return { ok: false, status: 401, error: "authentication_required" };
  const status = platformOperatorAccessStatus(user);
  if (status === 403) return { ok: false, status, error: "platform_operator_required" };

  return {
    ok: true,
    user,
    serviceClient: new LocalSupabaseClient(null, true),
  };
}