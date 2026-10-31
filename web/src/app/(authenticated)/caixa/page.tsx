import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { CashManager } from "@/components/CashManager";
import { toMemberships } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CashPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) redirect("/login");
	const { data: membershipRows, error: membershipError } = await supabase.from("memberships").select("congregation_id, role, congregations(id, name, city, state, active, organization_type, is_headquarters), permission_overrides:membership_permission_overrides(financial_read, financial_write, financial_approve, closing_submit, audit_read)").eq("user_id", user.id);
	if (membershipError) throw new Error(membershipError.message);
	const memberships = toMemberships(user, membershipRows ?? []);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership) return <div className="empty-state"><strong>Sem congregação ativa</strong><span>Seu usuário não possui uma membership disponível.</span></div>;
	const period = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString().slice(0, 10);
	const { data: registers, error: registersError } = await supabase.from("physical_cash_registers").select("id, name, active").eq("congregation_id", activeMembership.congregationId).order("name");
	if (registersError) throw new Error(registersError.message);
	const registerIds = (registers ?? []).map((register) => register.id);
	if (registerIds.length === 0) return <CashManager registers={[]} periods={[]} movements={[]} congregationId={activeMembership.congregationId} period={period} canWrite={can(activeMembership, "financial.write")} />;
	const periodsResult = await supabase.from("physical_cash_periods").select("id, cash_register_id, reference_period, opening_balance_cents, status").in("cash_register_id", registerIds).eq("reference_period", period);
	if (periodsResult.error) throw new Error(periodsResult.error.message);
	const periodIds = (periodsResult.data ?? []).map((cashPeriod) => cashPeriod.id);
	const movementsResult = periodIds.length
		? await supabase.from("physical_cash_movements").select("id, cash_period_id, movement_type, amount_cents, reason, created_at").in("cash_period_id", periodIds).order("created_at", { ascending: false }).limit(200)
		: { data: [], error: null };
	if (movementsResult.error) throw new Error(movementsResult.error.message);
	return <CashManager registers={registers ?? []} periods={periodsResult.data ?? []} movements={movementsResult.data ?? []} congregationId={activeMembership.congregationId} period={period} canWrite={can(activeMembership, "financial.write")} />;
}