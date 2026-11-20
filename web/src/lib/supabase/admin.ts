import "server-only";

import { LocalSupabaseClient } from "@/lib/db/client";

export function createServiceClient(): LocalSupabaseClient {
  return new LocalSupabaseClient(null, true);
}
