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

export async function POST(request: Request) {
  const context = await getPlatformAdminContext();
  if (!context.ok) return NextResponse.json({ error: context.error }, { status: context.status });

  let input: { name?: string; email?: string; assignments?: unknown };
  try {
    input = await request.json() as typeof input;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  const name = input.name?.trim();
  const email = input.email?.trim().toLowerCase();
  const assignments = parseAssignments(input.assignments);
  if (!name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !assignments) {
    return NextResponse.json({ error: "name_email_or_assignments_invalid" }, { status: 400 });
  }

  const { data, error } = await context.serviceClient.auth.admin.inviteUserByEmail(email, { data: { full_name: name, name } });
  if (error || !data.user) return NextResponse.json({ error: error?.message ?? "user_invite_failed" }, { status: 400 });

  const { error: accessError } = await context.serviceClient.rpc("admin_replace_user_access", {
    p_actor_id: context.user.id,
    p_user_id: data.user.id,
    p_assignments: assignments,
  });
  if (accessError) {
    await context.serviceClient.auth.admin.deleteUser(data.user.id);
    return NextResponse.json({ error: accessError.message }, { status: 400 });
  }

  return NextResponse.json({ data: { id: data.user.id, email, name } }, { status: 201, headers: { "Cache-Control": "no-store" } });
}

