import { NextResponse } from "next/server";

import { permissionsForRole, type Role } from "@/domain/access";
import { getPlatformAdminContext } from "@/lib/admin/platform";
import type { AdminAssignment, AdminOrganization, AdminPage, AdminPermissionSet, AdminUser } from "@/lib/admin/types";

const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
type MembershipRow = { user_id: string; congregation_id: string; role: Role };
type PermissionRow = {
  user_id: string;
  congregation_id: string;
  financial_read: boolean;
  financial_write: boolean;
  financial_approve: boolean;
  closing_submit: boolean;
  audit_read: boolean;
  hierarchy_view?: boolean;
  hierarchy_financial_read?: boolean;
};

function permissionSet(row: PermissionRow | undefined, role: Role): AdminPermissionSet {
  const defaults = permissionsForRole(role);
  return {
    "financial.read": row?.financial_read ?? defaults["financial.read"] ?? false,
    "financial.write": row?.financial_write ?? defaults["financial.write"] ?? false,
    "financial.approve": row?.financial_approve ?? defaults["financial.approve"] ?? false,
    "closing.submit": row?.closing_submit ?? defaults["closing.submit"] ?? false,
    "audit.read": row?.audit_read ?? defaults["audit.read"] ?? false,
    "hierarchy.view": row?.hierarchy_view ?? defaults["hierarchy.view"] ?? false,
    "hierarchy.financial.read": row?.hierarchy_financial_read ?? defaults["hierarchy.financial.read"] ?? false,
  };
}

function positiveInteger(value: string | null, fallback: number): number | null {
  if (value === null) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function errorResponse(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}

export async function GET(request: Request) {
  const context = await getPlatformAdminContext();
  if (!context.ok) return errorResponse(context.error, context.status);

  const search = new URL(request.url).searchParams;
  const resource = search.get("resource");
  if (resource !== "organizations" && resource !== "users") {
    return errorResponse("admin_resource_invalid", 400);
  }
  const page = positiveInteger(search.get("page"), 1);
  const pageSize = positiveInteger(search.get("pageSize"), DEFAULT_PAGE_SIZE);
  if (page === null || pageSize === null || pageSize > MAX_PAGE_SIZE) {
    return errorResponse("admin_pagination_invalid", 400);
  }
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to)) return errorResponse("admin_pagination_invalid", 400);

  if (resource === "organizations") {
    const { data, count, error } = await context.serviceClient
      .from("congregations")
      .select("id, name, city, state, parent_id, leader_name, organization_type, organization_level, is_headquarters, active", { count: "exact" })
      .order("name")
      .order("id")
      .range(from, to);
    if (error) return errorResponse(`admin_organization_list_failed: ${error.message}`);
    const result: AdminPage<AdminOrganization> = { data: data ?? [], total: count ?? 0, page, pageSize };
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  }

  const { data: listedUsers, error: usersError } = await context.serviceClient.auth.admin.listUsers({ page, perPage: pageSize });
  if (usersError) return errorResponse(`admin_user_list_failed: ${usersError.message}`);

  let memberships: MembershipRow[] = [];
  let overrides: PermissionRow[] = [];
  const userIds = listedUsers.users.map((user) => user.id);
  if (userIds.length) {
    const [membershipsResult, overridesResult] = await Promise.all([
      context.serviceClient
        .from("memberships")
        .select("user_id, congregation_id, role")
        .in("user_id", userIds)
        .order("user_id")
        .order("congregation_id"),
      context.serviceClient
        .from("membership_permission_overrides")
        .select("user_id, congregation_id, financial_read, financial_write, financial_approve, closing_submit, audit_read, hierarchy_view, hierarchy_financial_read")
        .in("user_id", userIds)
        .order("user_id")
        .order("congregation_id"),
    ]);
    if (membershipsResult.error) return errorResponse(`admin_membership_list_failed: ${membershipsResult.error.message}`);
    if (overridesResult.error) return errorResponse(`admin_permission_override_list_failed: ${overridesResult.error.message}`);
    memberships = (membershipsResult.data ?? []) as MembershipRow[];
    overrides = (overridesResult.data ?? []) as PermissionRow[];
  }

  const users: AdminUser[] = listedUsers.users.map((user) => {
    const assignments: AdminAssignment[] = memberships
      .filter((membership) => membership.user_id === user.id)
      .map((membership) => {
        const role = membership.role;
        const override = overrides.find((item) => item.user_id === user.id && item.congregation_id === membership.congregation_id);
        return { congregationId: membership.congregation_id, role, permissions: permissionSet(override, role) };
      });
    return {
      id: user.id,
      name: String(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Usuário"),
      email: user.email ?? "",
      role: assignments[0]?.role ?? "viewer",
      assignments,
    };
  });
  const result: AdminPage<AdminUser> = { data: users, total: listedUsers.total, page, pageSize };
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}
