import { NextResponse } from "next/server";

import { authenticateLocalUser, createLocalSession } from "@/lib/db/client";

export async function POST(request: Request) {
  let input: { email?: unknown; password?: unknown };
  try {
    input = await request.json() as typeof input;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (typeof input.email !== "string" || typeof input.password !== "string" || input.password.length > 1024) {
    return NextResponse.json({ error: "invalid_credentials" }, { status: 400 });
  }

  const user = await authenticateLocalUser(input.email, input.password);
  if (!user) return NextResponse.json({ error: "invalid_credentials" }, { status: 401 });

  const session = await createLocalSession(user.id);
  const response = NextResponse.json({ data: { user: { id: user.id, email: user.email } } }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set("ecc_session", session.token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(session.expiresAt),
  });
  return response;
}
