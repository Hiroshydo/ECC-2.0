import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ReportSummary } from "@/components/ReportSummary";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { loadReportData } from "@/lib/reports/data";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/login");
	const memberships = await getUserMemberships(user);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership) return <div className="empty-state"><strong>Sem congregação ativa</strong><span>Seu usuário não possui uma membership disponível.</span></div>;
	 const congregations = memberships.map((membership) => ({ congregationId: membership.congregationId, name: membership.congregation.name, city: membership.congregation.city }));
	 const now = new Date();
	 const period = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
	 const data = await loadReportData(user.id, activeMembership.congregationId, period, user.email ?? null);
	 return <ReportSummary initialData={data} congregations={congregations} />;
}