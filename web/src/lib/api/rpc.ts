import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function authenticatedRpc(rpcName: string, params: Record<string, unknown>) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 503 });
  }

  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return NextResponse.json({ error: "authentication_required" }, { status: 401 });
    const { data, error } = await supabase.rpc(rpcName, params);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "invalid_request" }, { status: 400 });
  }
}