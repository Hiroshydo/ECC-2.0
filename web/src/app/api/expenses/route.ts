import { authenticatedRpc } from "@/lib/api/rpc";

export async function POST(request: Request) {
  const input = await request.json() as Record<string, unknown>;
  return authenticatedRpc("create_expense", { p_congregation_id: input.congregationId, p_occurred_on: input.occurredOn, p_amount_cents: input.amountCents, p_category: input.category, p_description: input.description, p_vendor: input.vendor ?? null, p_payment_method: input.paymentMethod, p_purpose: input.purpose ?? null, p_cost_center: input.costCenter ?? null, p_is_internal_transfer: input.isInternalTransfer === true });
}