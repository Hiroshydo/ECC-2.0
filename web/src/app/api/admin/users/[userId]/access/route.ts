import { NextResponse } from "next/server";

import { allPermissions, type Role } from "@/domain/access";
import { getPlatformAdminContext } from "@/lib/admin/platform";
import type { AdminAssignment, AdminPermissionSet } from "@/lib/admin/types";

const roles: Role[] = ["central_admin", "congregation_admin", "treasurer", "auditor", "viewer"];

function parseAssignments(value: unknown): AdminAssignment[] | null {
  if (!Array.isArray(value)) return null;
  const assignments: AdminAssignment[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const assignment = item as Record<string, unknown>;
    if (typeof assignment.congregationId !== "string" || !roles.includes(assignment.role as Role)) return null;
    if (!assignment.permissions || typeof assignment.permissions !== "object") return null;
    const rawPermissions = assignment.permissions as Record<string, unknown>;
    if (allPermissions.some((permission) => typeof rawPermissions[permission] !== "boolean")) return null;
    assignments.push({
      congregationId: assignment.congregationId,
      role: assignment.role as Role,
      permissions: Object.fromEntries(allPermissions.map((permission) => [permission, rawPermissions[permission]])) as AdminPermissionSet,
    });
  }
  if (new Set(assignments.map((assignment) => assignment.congregationId)).size !== assignments.length) return null;
  return assignments;
}

export async function PUT(request: Request, context: RouteContext<"/api/admin/users/[userId]/access">) {
  const authorization = await getPlatformAdminContext();
  if (!authorization.ok) return NextResponse.json({ error: authorization.error }, { status: authorization.status });
  const { userId } = await context.params;
  const { data: targetUser, error: userError } = await authorization.serviceClient.auth.admin.getUserById(userId);
  if (userError || !targetUser.user) return NextResponse.json({ error: "user_not_found" }, { status: 404 });

  let input: { assignments?: unknown };
  try {
    input = await request.json() as typeof input;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const assignments = parseAssignments(input.assignments);
  if (!assignments) return NextResponse.json({ error: "assignments_invalid" }, { status: 400 });

  const { error } = await authorization.serviceClient.rpc("admin_replace_user_access", {
    p_actor_id: authorization.user.id,
    p_user_id: userId,
    p_assignments: assignments,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ data: { updated: true } }, { headers: { "Cache-Control": "no-store" } });
}