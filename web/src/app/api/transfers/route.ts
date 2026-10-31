import { authenticatedRpc } from "@/lib/api/rpc";

export async function POST(request: Request) {
  const input = await request.json() as Record<string, unknown>;
  return authenticatedRpc("request_transfer", { p_origin_congregation_id: input.originCongregationId, p_destination_name: input.destinationName, p_reference_period: input.referencePeriod, p_amount_sent_cents: input.amountSentCents, p_reason: input.reason, p_occurred_on: input.occurredOn ?? null });
}