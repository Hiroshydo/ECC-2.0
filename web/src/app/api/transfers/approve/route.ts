import { authenticatedRpc } from "@/lib/api/rpc";

export async function POST(request: Request) {
  const input = await request.json() as { transferId: string };
  return authenticatedRpc("approve_transfer", { p_transfer_id: input.transferId });
}