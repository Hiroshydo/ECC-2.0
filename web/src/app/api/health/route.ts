import { NextResponse } from "next/server";
import { query } from "@/lib/db/pool";

export async function GET() {
  try {
    await query("select 1");
    return NextResponse.json({
      status: "ok",
      service: "ecclesia-finance-web",
      integrations: { postgresql: "connected" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health check database query failed:", error);
    return NextResponse.json({
      status: "degraded",
      service: "ecclesia-finance-web",
      integrations: { postgresql: "unavailable" },
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}