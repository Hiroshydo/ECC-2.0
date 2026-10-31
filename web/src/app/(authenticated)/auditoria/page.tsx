import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { AuditLog } from "@/components/AuditLog";
import { toMemberships } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) redirect("/login");
	const { data: membershipRows, error: membershipError } = await supabase.from("memberships").select("congregation_id, role, congregations(id, name, city, state, active, organization_type, is_headquarters), permission_overrides:membership_permission_overrides(financial_read, financial_write, financial_approve, closing_submit, audit_read)").eq("user_id", user.id);
	if (membershipError) throw new Error(membershipError.message);
	const memberships = toMemberships(user, membershipRows ?? []);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership || !can(activeMembership, "audit.read")) return <div className="empty-state"><strong>Auditoria indisponível</strong><span>Seu perfil não possui permissão para consultar o histórico desta congregação.</span></div>;
	const { data, error } = await supabase.from("audit_events").select("id, action, entity, entity_id, occurred_at, reason").eq("congregation_id", activeMembership.congregationId).order("occurred_at", { ascending: false }).limit(200);
	if (error) throw new Error(error.message);
	return <AuditLog events={data ?? []} />;
}