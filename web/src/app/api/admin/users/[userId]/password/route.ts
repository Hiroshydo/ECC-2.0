import { NextResponse } from "next/server";

import { getPlatformAdminContext } from "@/lib/admin/platform";

export async function POST(_request: Request, context: RouteContext<"/api/admin/users/[userId]/password">) {
  const authorization = await getPlatformAdminContext();
  if (!authorization.ok) return NextResponse.json({ error: authorization.error }, { status: authorization.status });

  const { userId } = await context.params;
  if (userId === authorization.user.id) {
    return NextResponse.json({ error: "self_password_reset_not_allowed" }, { status: 400 });
  }

  const { data, error } = await authorization.serviceClient.auth.admin.resetUserPassword(userId, authorization.user.id);
  if (error || !data.temporaryPassword) {
    const status = error?.message === "user_not_found" ? 404 : 500;
    return NextResponse.json({ error: error?.message ?? "user_password_reset_failed" }, { status });
  }
  return NextResponse.json(
    { data: { temporaryPassword: data.temporaryPassword } },
    { headers: { "Cache-Control": "no-store" } },
  );
}
