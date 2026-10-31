import { authenticatedRpc } from "@/lib/api/rpc";

type EntryRequest = {
  congregationId: string;
  occurredOn: string;
  amountCents: number;
  category: string;
  origin: string;
  paymentMethod: string;
  purpose?: string;
  isInternalTransfer?: boolean;
};

export async function POST(request: Request) {
  const input = await request.json() as EntryRequest;
  return authenticatedRpc("create_entry", {
      p_congregation_id: input.congregationId,
      p_occurred_on: input.occurredOn,
      p_amount_cents: input.amountCents,
      p_category: input.category,
      p_origin: input.origin,
      p_payment_method: input.paymentMethod,
      p_purpose: input.purpose ?? null,
      p_is_internal_transfer: input.isInternalTransfer === true,
  });
}