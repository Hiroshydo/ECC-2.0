import { authenticatedRpc } from "@/lib/api/rpc";

export async function POST(request: Request) {
  const input = await request.json() as { cashRegisterId: string; referencePeriod: string; openingBalanceCents: number };
  return authenticatedRpc("open_cash_period", { p_cash_register_id: input.cashRegisterId, p_reference_period: input.referencePeriod, p_opening_balance_cents: input.openingBalanceCents });
}