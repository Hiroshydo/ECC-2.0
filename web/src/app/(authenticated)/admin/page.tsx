import { redirect } from "next/navigation";

import { DevConsole } from "@/components/DevConsole";
import { isMasterAdmin } from "@/domain/access";
import { getPlatformAdminContext } from "@/lib/admin/platform";

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }: { searchParams: Promise<{ tab?: string; organizationId?: string }> }) {
  const params = await searchParams;
  const context = await getPlatformAdminContext();
  if (!context.ok && context.status === 401) redirect("/login");
  if (!context.ok && context.status === 403) redirect("/");
  if (!context.ok) {
    return <section className="admin-page"><div className="admin-alert warning" role="status"><strong>Gestão global indisponível.</strong><span>Configure a conexão PostgreSQL administrativa local para habilitar operações administrativas.</span></div></section>;
  }
  if (!isMasterAdmin(context.user)) redirect("/");
  return <DevConsole initialTab={params.tab === "noah" ? "noah" : "access"} organizationId={params.organizationId} />;
}