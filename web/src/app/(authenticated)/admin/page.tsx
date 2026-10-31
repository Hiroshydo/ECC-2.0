import { redirect } from "next/navigation";

import { AdminManager } from "@/components/AdminManager";
import { isMasterAdmin } from "@/domain/access";
import { getPlatformAdminContext } from "@/lib/admin/platform";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const context = await getPlatformAdminContext();
  if (!context.ok && context.status === 401) redirect("/login");
  if (!context.ok && context.status === 403) redirect("/");
  if (!context.ok) {
    return <section className="admin-page"><div className="admin-alert warning" role="status"><strong>Gestão global indisponível.</strong><span>Configure SUPABASE_SERVICE_ROLE_KEY somente como variável server-side da Vercel para habilitar operações administrativas.</span></div></section>;
  }
  if (!isMasterAdmin(context.user)) redirect("/");

  try {
    const supabase = await (await import("@/lib/supabase/server")).createClient();
    const { data: congregations, error: congregationsError } = await supabase.from("congregations").select("id, name, city, state, active, organization_type, is_headquarters").limit(20);
    const { data: users, error: usersError } = await supabase.from("memberships").select("user_id, congregation_id, role").limit(20);
    if (congregationsError || usersError) {
      console.error("Admin page initial data load failed:", { congregationsError, usersError });
    }
    void congregations;
    void users;
  } catch (error) {
    console.error("Admin page initial data load crashed:", error);
  }

  return <AdminManager />;
}