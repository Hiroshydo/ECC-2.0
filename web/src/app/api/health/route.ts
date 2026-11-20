import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db/sqlite";

export function GET() {
  try {
    getDatabase().prepare("SELECT 1").get();
    return NextResponse.json({
      status: "ok",
      service: "ecclesia-finance-web",
      database: { engine: "sqlite", status: "connected" },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("SQLite health check failed:", error);
    return NextResponse.json({
      status: "degraded",
      service: "ecclesia-finance-web",
      database: { engine: "sqlite", status: "unavailable" },
      timestamp: new Date().toISOString(),
    }, { status: 503 });
  }
}