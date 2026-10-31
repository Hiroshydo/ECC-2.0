import { authenticatedRpc } from "@/lib/api/rpc";

export async function POST(request: Request) {
  const input = await request.json() as { congregationId: string; referencePeriod: string };
  return authenticatedRpc("close_monthly_period", {
    p_congregation_id: input.congregationId,
    p_reference_period: input.referencePeriod,
  });
}