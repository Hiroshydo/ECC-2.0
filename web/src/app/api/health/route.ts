import { NextResponse } from "next/server";

export function GET() {
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  return NextResponse.json({
    status: supabaseConfigured ? "ok" : "degraded",
    service: "ecclesia-finance-web",
    integrations: { supabase: supabaseConfigured ? "configured" : "missing_environment" },
    timestamp: new Date().toISOString(),
  }, { status: supabaseConfigured ? 200 : 503 });
}