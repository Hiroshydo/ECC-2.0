import { NextResponse } from "next/server";

import { createSessionToken, sessionCookieOptions } from "@/lib/auth/session";
import { query } from "@/lib/db/pool";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
    return NextResponse.json({ error: "local_auth_not_configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_request_body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const email = "email" in body && typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = "password" in body && typeof body.password === "string" ? body.password : "";
  if (!email || !password || email.length > 320 || password.length > 1024) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });
  }

  try {
    const result = await query<{ id: string }>(
      `select id
         from auth.users
        where lower(email) = $1
          and encrypted_password <> ''
          and extensions.crypt($2, encrypted_password) = encrypted_password
          and deleted_at is null
        limit 1`,
      [email, password],
    );
    const user = result.rows[0];
    if (!user) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

    const response = NextResponse.json({ ok: true });
    response.cookies.set("ecclesia_session", createSessionToken(user.id), sessionCookieOptions());
    return response;
  } catch (error) {
    console.error("Local login failed:", error);
    return NextResponse.json({ error: "local_auth_unavailable" }, { status: 503 });
  }
}
