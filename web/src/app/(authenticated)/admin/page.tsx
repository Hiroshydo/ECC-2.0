import { redirect } from "next/navigation";

import { AdminManager } from "@/components/AdminManager";
import { getPlatformAdminContext } from "@/lib/admin/platform";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const context = await getPlatformAdminContext();
  if (!context.ok && context.status === 401) redirect("/login");
  if (!context.ok && context.status === 403) {
    const sessionClient = await (await import("@/lib/supabase/server")).createClient();
    const { data: { user } } = await sessionClient.auth.getUser();
    const email = user?.email?.toLowerCase().trim();
    console.log("[Admin Auth Check]", { email, isDev: user?.app_metadata?.is_dev, role: user?.app_metadata?.role, redirectTo: "/" });
    redirect("/");
  }
  if (!context.ok) {
    return <section className="admin-page"><div className="admin-alert warning" role="status"><strong>Gestão global indisponível.</strong><span>Configure SUPABASE_SERVICE_ROLE_KEY somente como variável server-side da Vercel para habilitar operações administrativas.</span></div></section>;
  }
  const email = context.user.email?.toLowerCase().trim();
  const isDev = Boolean(context.user.app_metadata?.is_dev);
  const isSuperAdmin = Boolean(context.user.app_metadata?.is_super_admin);
  const role = context.user.app_metadata?.role?.toLowerCase();
  const authorized = email === "renanmarianosd@hotmail.com" || isDev || isSuperAdmin || role === "central_admin";
  if (!authorized) {
    console.log("[Admin Auth Check]", { email, isDev, role, redirectTo: "/" });
    redirect("/");
  }

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