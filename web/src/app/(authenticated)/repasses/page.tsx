import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { TransferManager } from "@/components/TransferManager";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { withUserContext } from "@/lib/db/pool";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");
	const memberships = await getUserMemberships(user);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership) return <div className="empty-state"><strong>Sem congregação ativa</strong><span>Seu usuário não possui uma membership disponível.</span></div>;

	const currentPeriod = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString().slice(0, 10);
	const [transfers, closing] = await withUserContext(user.id, async (client) => {
		const transfersResult = await client.query(
			"select id, destination_name, reference_period, amount_sent_cents, amount_received_cents, occurred_on, status, reason from public.headquarters_transfers where origin_congregation_id = $1 order by reference_period desc, created_at desc limit 100",
			[activeMembership.congregationId],
		);
		const closingResult = await client.query(
			"select status from public.monthly_closings where congregation_id = $1 and reference_period = $2",
			[activeMembership.congregationId, currentPeriod],
		);
		return [transfersResult.rows, closingResult.rows[0]] as const;
	});
	return <TransferManager transfers={transfers} congregationId={activeMembership.congregationId} closed={closing?.status === "closed"} canWrite={can(activeMembership, "financial.write")} canApprove={can(activeMembership, "financial.approve")} canConfirm={activeMembership.role === "central_admin"} organizationType={activeMembership.congregation.organizationType} />;
}