import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { ClosingManager } from "@/components/ClosingManager";
import { toMemberships } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ClosingPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) redirect("/login");
	const { data: membershipRows, error: membershipError } = await supabase.from("memberships").select("congregation_id, role, congregations(id, name, city, state, active, organization_type, is_headquarters), permission_overrides:membership_permission_overrides(financial_read, financial_write, financial_approve, closing_submit, audit_read)").eq("user_id", user.id);
	if (membershipError) throw new Error(membershipError.message);
	const memberships = toMemberships(user, membershipRows ?? []);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership) return <div className="empty-state"><strong>Sem congregação ativa</strong><span>Seu usuário não possui uma membership disponível.</span></div>;
	const now = new Date();
	const referencePeriod = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);
	const [summaryResult, closingResult] = await Promise.all([
		supabase.from("congregation_monthly_summary").select("opening_balance, entries, expenses, transfers, adjustments, closing_balance").eq("congregation_id", activeMembership.congregationId).eq("reference_period", referencePeriod).maybeSingle(),
		supabase.from("monthly_closings").select("status, closed_at").eq("congregation_id", activeMembership.congregationId).eq("reference_period", referencePeriod).maybeSingle(),
	]);
	if (summaryResult.error) throw new Error(summaryResult.error.message);
	if (closingResult.error) throw new Error(closingResult.error.message);
	return <ClosingManager congregationId={activeMembership.congregationId} referencePeriod={referencePeriod} congregationName={activeMembership.congregation.name} summary={summaryResult.data} closing={closingResult.data} canClose={can(activeMembership, "financial.approve")} />;
}