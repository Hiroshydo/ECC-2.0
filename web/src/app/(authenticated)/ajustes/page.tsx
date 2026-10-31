import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { CorrectionManager } from "@/components/CorrectionManager";
import { toMemberships } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdjustmentsPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) redirect("/login");
	const { data: membershipRows, error: membershipError } = await supabase.from("memberships").select("congregation_id, role, congregations(id, name, city, state, active, organization_type, is_headquarters), permission_overrides:membership_permission_overrides(financial_read, financial_write, financial_approve, closing_submit, audit_read)").eq("user_id", user.id);
	if (membershipError) throw new Error(membershipError.message);
	const memberships = toMemberships(user, membershipRows ?? []);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership) return <div className="empty-state"><strong>Sem congregação ativa</strong><span>Seu usuário não possui uma membership disponível.</span></div>;
	const { data, error } = await supabase.from("financial_adjustments").select("id, reference_period, entity_type, entity_id, amount_cents, reason, status").eq("congregation_id", activeMembership.congregationId).order("created_at", { ascending: false }).limit(100);
	if (error) throw new Error(error.message);
	return <CorrectionManager kind="adjustment" records={data ?? []} congregationId={activeMembership.congregationId} canWrite={can(activeMembership, "financial.approve")} />;
}