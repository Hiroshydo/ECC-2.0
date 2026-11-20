import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createHash } from "node:crypto";

import { getDatabase } from "@/lib/db/sqlite";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("ecc_session")?.value;
  if (token) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    getDatabase().prepare("DELETE FROM local_sessions WHERE token_hash = ?").run(tokenHash);
  }
  const response = NextResponse.json({ data: { signedOut: true } }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set("ecc_session", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
