import { authenticatedRpc } from "@/lib/api/rpc";

export async function POST(request: Request) {
  const input = await request.json() as { expenseId: string };
  return authenticatedRpc("approve_expense", { p_expense_id: input.expenseId });
}