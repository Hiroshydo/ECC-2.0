import { NextResponse } from "next/server";

import { permissionsForRole, type Role } from "@/domain/access";
import { getPlatformAdminContext } from "@/lib/admin/platform";
import type { AdminAssignment, AdminOverview, AdminPermissionSet, AdminUser } from "@/lib/admin/types";

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

export async function GET() {
  const context = await getPlatformAdminContext();
  if (!context.ok) return NextResponse.json({ error: context.error }, { status: context.status, headers: { "Cache-Control": "no-store" } });

  const [organizationResult, membershipResult, permissionResult] = await Promise.all([
    context.serviceClient.from("congregations").select("id, name, city, state, parent_id, leader_name, organization_type, organization_level, is_headquarters, active").order("name"),
    context.serviceClient.from("memberships").select("user_id, congregation_id, role"),
    context.serviceClient.from("membership_permission_overrides").select("user_id, congregation_id, financial_read, financial_write, financial_approve, closing_submit, audit_read, hierarchy_view, hierarchy_financial_read"),
  ]);
  const failedQuery = [organizationResult, membershipResult, permissionResult].find((result) => result.error);
  if (failedQuery?.error) return NextResponse.json({ error: "admin_data_load_failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });

  const memberships = (membershipResult.data ?? []) as MembershipRow[];
  const overrides = (permissionResult.data ?? []) as PermissionRow[];
  const users: AdminUser[] = [];
  for (let page = 1; page <= 20; page += 1) {
    const { data, error } = await context.serviceClient.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return NextResponse.json({ error: "admin_user_list_failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    users.push(...data.users.map((user) => {
      const assignments: AdminAssignment[] = memberships.filter((membership) => membership.user_id === user.id).map((membership) => {
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
    }));
    if (data.users.length < 1000) break;
  }

  const overview: AdminOverview = {
    organizations: organizationResult.data ?? [],
    users: users.sort((left, right) => left.name.localeCompare(right.name, "pt-BR")),
  };
  return NextResponse.json({ data: overview }, { headers: { "Cache-Control": "no-store" } });
}