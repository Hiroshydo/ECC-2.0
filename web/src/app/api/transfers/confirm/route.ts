import { authenticatedRpc } from "@/lib/api/rpc";

export async function POST(request: Request) {
  const input = await request.json() as { transferId: string; amountReceivedCents: number };
  return authenticatedRpc("confirm_transfer", { p_transfer_id: input.transferId, p_amount_received_cents: input.amountReceivedCents });
}