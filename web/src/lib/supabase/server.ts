import { getCurrentUser, LocalSupabaseClient } from "@/lib/db/client";

export async function createClient() {
  const user = await getCurrentUser();
  return new LocalSupabaseClient(user?.id ?? null);
}
