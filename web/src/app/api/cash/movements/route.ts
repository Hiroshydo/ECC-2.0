import { authenticatedRpc } from "@/lib/api/rpc";

export async function POST(request: Request) {
  const input = await request.json() as { cashPeriodId: string; movementType: string; amountCents: number; reason: string; idempotencyKey: string };
  return authenticatedRpc("record_cash_movement", { p_cash_period_id: input.cashPeriodId, p_movement_type: input.movementType, p_amount_cents: input.amountCents, p_reason: input.reason, p_idempotency_key: input.idempotencyKey });
}