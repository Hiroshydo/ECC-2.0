import { authenticatedRpc } from "@/lib/api/rpc";

export async function POST(request: Request) {
  const input = await request.json() as Record<string, unknown>;
  return authenticatedRpc("create_financial_adjustment", {
    p_congregation_id: input.congregationId,
    p_entity_type: input.entityType,
    p_entity_id: input.entityId,
    p_amount_cents: input.amountCents,
    p_reason: input.reason,
    p_idempotency_key: input.idempotencyKey,
  });
}