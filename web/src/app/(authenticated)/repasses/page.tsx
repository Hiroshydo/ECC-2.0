import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { isTransferMethod, type TransferSend } from "@/domain/finance";
import { TransferManager } from "@/components/TransferManager";
import { toMemberships } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function TransfersPage() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) redirect("/login");
	const { data: membershipRows, error: membershipError } = await supabase.from("memberships").select("congregation_id, role, congregations(id, name, city, state, active, organization_type, is_headquarters), permission_overrides:membership_permission_overrides(financial_read, financial_write, financial_approve, closing_submit, audit_read)").eq("user_id", user.id);
	if (membershipError) throw new Error(membershipError.message);
	const memberships = toMemberships(user, membershipRows ?? []);
	const activeId = (await cookies()).get("active_congregation_id")?.value;
	const activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0];
	if (!activeMembership) return <div className="empty-state"><strong>Sem congregação ativa</strong><span>Seu usuário não possui uma membership disponível.</span></div>;

	const currentPeriod = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString().slice(0, 10);
	const [transfersResult, closingResult] = await Promise.all([
		supabase.from("headquarters_transfers").select("id, destination_name, reference_period, amount_requested_cents, amount_approved_cents, amount_sent_cents, amount_received_cents, occurred_on, status, reason, requested_by, approved_by").eq("origin_congregation_id", activeMembership.congregationId).order("reference_period", { ascending: false }).order("created_at", { ascending: false }).limit(100),
		supabase.from("monthly_closings").select("status").eq("congregation_id", activeMembership.congregationId).eq("reference_period", currentPeriod).maybeSingle(),
	]);
	if (transfersResult.error) throw new Error(transfersResult.error.message);
	if (closingResult.error) throw new Error(closingResult.error.message);
	const transferIds = (transfersResult.data ?? []).map((transfer) => transfer.id);
	const sendsResult = transferIds.length
		? await supabase.from("headquarters_transfer_sends").select("id, transfer_id, occurred_on, amount_sent_cents, method, reference, note, sent_by, created_at").in("transfer_id", transferIds)
		: { data: [], error: null };
	if (sendsResult.error) throw new Error(sendsResult.error.message);
	const sendsByTransferId = new Map<string, TransferSend>();
	for (const send of sendsResult.data ?? []) {
		if (!isTransferMethod(send.method)) throw new Error(`Unsupported transfer method: ${send.method}`);
		sendsByTransferId.set(send.transfer_id, {
			occurred_on: send.occurred_on,
			amount_sent_cents: send.amount_sent_cents,
			method: send.method,
			reference: send.reference,
			note: send.note,
			sent_by: send.sent_by,
			created_at: send.created_at,
		});
	}
	const transfers = (transfersResult.data ?? []).map((transfer) => ({
		...transfer,
		send: sendsByTransferId.get(transfer.id) ?? null,
	}));
	return <TransferManager transfers={transfers} congregationId={activeMembership.congregationId} currentUserId={user.id} closed={closingResult.data?.status === "closed"} canWrite={can(activeMembership, "financial.write")} canApprove={can(activeMembership, "financial.approve")} canSend={can(activeMembership, "transfer.send")} canConfirm={activeMembership.role === "central_admin"} organizationType={activeMembership.congregation.organizationType} />;
}