import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { ClosingManager } from "@/components/ClosingManager";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { withUserContext } from "@/lib/db/pool";
import { getCurrentBusinessPeriod } from "@/lib/business-date";

export const dynamic = "force-dynamic";

export default async function ClosingPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");
	const memberships = await getUserMemberships(user);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership) return <div className="empty-state"><strong>Sem congregação ativa</strong><span>Seu usuário não possui uma membership disponível.</span></div>;
	const referencePeriod = getCurrentBusinessPeriod();
	const [summary, closing] = await withUserContext(user.id, async (client) => {
		const summaryResult = await client.query(
			"select opening_balance, entries, expenses, transfers, adjustments, closing_balance from public.congregation_monthly_summary where congregation_id = $1 and reference_period = $2",
			[activeMembership.congregationId, referencePeriod],
		);
		const closingResult = await client.query(
			"select status, closed_at from public.monthly_closings where congregation_id = $1 and reference_period = $2",
			[activeMembership.congregationId, referencePeriod],
		);
		return [summaryResult.rows[0] ?? null, closingResult.rows[0] ?? null] as const;
	});
	return <ClosingManager congregationId={activeMembership.congregationId} referencePeriod={referencePeriod} congregationName={activeMembership.congregation.name} summary={summary} closing={closing} canClose={can(activeMembership, "financial.approve")} />;
}