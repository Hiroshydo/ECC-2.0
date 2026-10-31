import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { AuditLog } from "@/components/AuditLog";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { withUserContext } from "@/lib/db/pool";

export const dynamic = "force-dynamic";

export default async function AuditPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");
	const memberships = await getUserMemberships(user);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership || !can(activeMembership, "audit.read")) return <div className="empty-state"><strong>Auditoria indisponível</strong><span>Seu perfil não possui permissão para consultar o histórico desta congregação.</span></div>;
	const events = await withUserContext(user.id, async (client) => {
		const result = await client.query(
			"select id, action, entity, entity_id, occurred_at, reason from public.audit_events where congregation_id = $1 order by occurred_at desc limit 200",
			[activeMembership.congregationId],
		);
		return result.rows;
	});
	return <AuditLog events={events} />;
}