import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { EntryManager } from "@/components/EntryManager";
import { createClient } from "@/lib/supabase/server";
import { toMemberships } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function EntriesPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) redirect("/login");
	const { data: membershipRows, error: membershipError } = await supabase.from("memberships").select("congregation_id, role, congregations(id, name, city, state, active, organization_type, is_headquarters), permission_overrides:membership_permission_overrides(financial_read, financial_write, financial_approve, closing_submit, audit_read)").eq("user_id", user.id);
	if (membershipError) throw new Error(membershipError.message);
	const memberships = toMemberships(user, membershipRows ?? []);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership) return <div className="empty-state"><strong>Sem congregação ativa</strong><span>Seu usuário não possui uma membership disponível.</span></div>;

	const [entriesResult, closingResult] = await Promise.all([
		supabase.from("entries").select("id, occurred_on, amount_cents, category, origin, payment_method, purpose").eq("congregation_id", activeMembership.congregationId).order("occurred_on", { ascending: false }).order("created_at", { ascending: false }).limit(100),
		supabase.from("monthly_closings").select("status").eq("congregation_id", activeMembership.congregationId).eq("reference_period", new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString().slice(0, 10)).maybeSingle(),
	]);
	if (entriesResult.error) throw new Error(entriesResult.error.message);
	if (closingResult.error) throw new Error(closingResult.error.message);
	return <EntryManager entries={entriesResult.data ?? []} congregationId={activeMembership.congregationId} closed={closingResult.data?.status === "closed"} canWrite={can(activeMembership, "financial.write")} organizationType={activeMembership.congregation.organizationType} />;
}