import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth/session";
import { callUserFunction } from "@/lib/db/rpc";

export async function authenticatedRpc(rpcName: string, params: Record<string, unknown>) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    const data = await callUserFunction(user.id, rpcName, params);
    return NextResponse.json({ data });
  } catch (error) {
    console.error(`Local database function ${rpcName} failed:`, error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "database_operation_failed" }, { status: 400 });
  }
}