import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

import { allPermissions, type Role } from "@/domain/access";
import { getPlatformAdminContext } from "@/lib/admin/platform";
import { withAdminContext } from "@/lib/db/pool";
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

  const temporaryPassword = randomBytes(32).toString("base64url");
  try {
    const user = await withAdminContext(async (client) => {
      const result = await client.query<{ id: string }>(
        `insert into auth.users (
           id, aud, role, email, encrypted_password, email_confirmed_at,
           raw_app_meta_data, raw_user_meta_data, created_at, updated_at
         )
         values (
           gen_random_uuid(), 'authenticated', 'authenticated', $1,
           extensions.crypt($2, extensions.gen_salt('bf')), now(),
           '{"provider":"email","providers":["email"]}'::jsonb, $3::jsonb, now(), now()
         )
         returning id`,
        [email, temporaryPassword, JSON.stringify({ full_name: name, name })],
      );
      const createdUser = result.rows[0];
      if (!createdUser) throw new Error("user_creation_failed");

      await client.query(
        "select public.admin_replace_user_access($1, $2, $3::jsonb)",
        [context.user.id, createdUser.id, JSON.stringify(assignments)],
      );
      return createdUser;
    });

    return NextResponse.json({
      data: { id: user.id, email, name, temporaryPassword },
    }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Local user creation failed:", error);
    return NextResponse.json({ error: "user_creation_failed" }, { status: 400 });
  }
}
