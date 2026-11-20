import { NextResponse } from "next/server";

import { permissionsForRole, type Role } from "@/domain/access";
import { getPlatformAdminContext } from "@/lib/admin/platform";
import type { AdminAssignment, AdminOverview, AdminPermissionSet, AdminUser } from "@/lib/admin/types";
import type { LocalUser } from "@/lib/db/client";
import { collectPages } from "@/lib/admin/pagination";

const DATABASE_PAGE_SIZE = 500;
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

  let organizations: AdminOverview["organizations"];
  let memberships: MembershipRow[];
  let overrides: PermissionRow[];
  let listedUsers: LocalUser[];
  try {
    [organizations, memberships, overrides, listedUsers] = await Promise.all([
      collectPages(async (page, pageSize) => {
        const { data, error } = await context.serviceClient
          .from("congregations")
          .select("id, name, city, state, parent_id, leader_name, organization_type, organization_level, is_headquarters, active")
          .order("name")
          .order("id")
          .range((page - 1) * pageSize, page * pageSize - 1);
        if (error) throw new Error("admin_organization_list_failed");
        return data ?? [];
      }, DATABASE_PAGE_SIZE),
      collectPages(async (page, pageSize) => {
        const { data, error } = await context.serviceClient
          .from("memberships")
          .select("user_id, congregation_id, role")
          .order("user_id")
          .order("congregation_id")
          .range((page - 1) * pageSize, page * pageSize - 1);
        if (error) throw new Error("admin_membership_list_failed");
        return (data ?? []) as MembershipRow[];
      }, DATABASE_PAGE_SIZE),
      collectPages(async (page, pageSize) => {
        const { data, error } = await context.serviceClient
          .from("membership_permission_overrides")
          .select("user_id, congregation_id, financial_read, financial_write, financial_approve, closing_submit, audit_read, hierarchy_view, hierarchy_financial_read")
          .order("user_id")
          .order("congregation_id")
          .range((page - 1) * pageSize, page * pageSize - 1);
        if (error) throw new Error("admin_permission_override_list_failed");
        return (data ?? []) as PermissionRow[];
      }, DATABASE_PAGE_SIZE),
      collectPages(async (page, pageSize) => {
        const { data, error } = await context.serviceClient.auth.admin.listUsers({ page, perPage: pageSize });
        if (error) throw new Error("admin_user_list_failed");
        return data.users;
      }, DATABASE_PAGE_SIZE),
    ]);
  } catch (error) {
    const message = error instanceof Error ? error.message : "admin_data_load_failed";
    return NextResponse.json({ error: message }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
  const users: AdminUser[] = listedUsers.map((user) => {
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
    });

  const overview: AdminOverview = {
    organizations,
    users: users.sort((left, right) => left.name.localeCompare(right.name, "pt-BR")),
  };
  return NextResponse.json({ data: overview }, { headers: { "Cache-Control": "no-store" } });
}