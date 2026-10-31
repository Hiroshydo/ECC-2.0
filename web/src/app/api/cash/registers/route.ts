import { authenticatedRpc } from "@/lib/api/rpc";

export async function POST(request: Request) {
  const input = await request.json() as { congregationId: string; name: string };
  return authenticatedRpc("create_cash_register", { p_congregation_id: input.congregationId, p_name: input.name });
}