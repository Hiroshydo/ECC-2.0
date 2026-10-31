import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { CorrectionManager } from "@/components/CorrectionManager";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { withUserContext } from "@/lib/db/pool";

export const dynamic = "force-dynamic";

export default async function AdjustmentsPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");
	const memberships = await getUserMemberships(user);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership) return <div className="empty-state"><strong>Sem congregação ativa</strong><span>Seu usuário não possui uma membership disponível.</span></div>;
	const records = await withUserContext(user.id, async (client) => {
		const result = await client.query(
			"select id, reference_period, entity_type, entity_id, amount_cents, reason, status from public.financial_adjustments where congregation_id = $1 order by created_at desc limit 100",
			[activeMembership.congregationId],
		);
		return result.rows;
	});
	return <CorrectionManager kind="adjustment" records={records} congregationId={activeMembership.congregationId} canWrite={can(activeMembership, "financial.approve")} />;
}