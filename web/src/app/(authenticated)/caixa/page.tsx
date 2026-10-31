import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { CashManager } from "@/components/CashManager";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { withUserContext } from "@/lib/db/pool";

export const dynamic = "force-dynamic";

export default async function CashPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");
	const memberships = await getUserMemberships(user);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership) return <div className="empty-state"><strong>Sem congregação ativa</strong><span>Seu usuário não possui uma membership disponível.</span></div>;
	const period = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString().slice(0, 10);
	const { registers, periods, movements } = await withUserContext(user.id, async (client) => {
		const registersResult = await client.query(
			"select id, name, active from public.physical_cash_registers where congregation_id = $1 order by name",
			[activeMembership.congregationId],
		);
		const registerIds = registersResult.rows.map((register) => register.id);
		if (!registerIds.length) return { registers: [], periods: [], movements: [] };

		const periodsResult = await client.query(
			"select id, cash_register_id, reference_period, opening_balance_cents, status from public.physical_cash_periods where cash_register_id = any($1::uuid[]) and reference_period = $2",
			[registerIds, period],
		);
		const periodIds = periodsResult.rows.map((cashPeriod) => cashPeriod.id);
		const movementsResult = periodIds.length
			? await client.query(
				"select id, cash_period_id, movement_type, amount_cents, reason, created_at from public.physical_cash_movements where cash_period_id = any($1::uuid[]) order by created_at desc limit 200",
				[periodIds],
			)
			: { rows: [] };
		return { registers: registersResult.rows, periods: periodsResult.rows, movements: movementsResult.rows };
	});
	return <CashManager registers={registers} periods={periods} movements={movements} congregationId={activeMembership.congregationId} period={period} canWrite={can(activeMembership, "financial.write")} />;
}