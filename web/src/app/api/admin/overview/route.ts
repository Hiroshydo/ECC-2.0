import { NextResponse } from "next/server";

import { permissionsForRole, type Role } from "@/domain/access";
import { getPlatformAdminContext } from "@/lib/admin/platform";
import { adminQuery } from "@/lib/db/pool";
import type { AdminAssignment, AdminOrganization, AdminOverview, AdminPermissionSet, AdminUser } from "@/lib/admin/types";

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

  try {
    const [organizationResult, membershipResult, permissionResult, userResult] = await Promise.all([
      adminQuery<AdminOrganization>("select id, name, city, state, parent_id, leader_name, organization_type, organization_level, is_headquarters, active from public.congregations order by name"),
      adminQuery<MembershipRow>("select user_id, congregation_id, role from public.memberships"),
      adminQuery<PermissionRow>("select user_id, congregation_id, financial_read, financial_write, financial_approve, closing_submit, audit_read, hierarchy_view, hierarchy_financial_read from public.membership_permission_overrides"),
      adminQuery<{ id: string; email: string | null; user_metadata: Record<string, unknown> | null }>(
        `select id, email, coalesce(raw_user_meta_data, '{}'::jsonb) as user_metadata
           from auth.users
          where deleted_at is null
          order by created_at desc`,
      ),
    ]);

    const memberships = membershipResult.rows;
    const operatorCounts = new Map<string, number>();
    for (const membership of memberships) {
      operatorCounts.set(membership.congregation_id, (operatorCounts.get(membership.congregation_id) ?? 0) + 1);
    }
    let licenseRows: Array<{ congregation_id: string; seats_total: number; expires_at: string }> = [];
    let congregationLicenses: Array<{
      id: string;
      license_status: "active" | "grace_period" | "blocked" | null;
      license_expires_at: string | null;
      license_cycle_days: number | null;
      max_operators: number | null;
    }> = [];
    try {
      const licenseResult = await adminQuery<{ congregation_id: string; seats_total: number; expires_at: string }>(
        "select congregation_id, seats_total, expires_at from public.khatam_licenses",
      );
      licenseRows = licenseResult.rows;
    } catch (error) {
      console.error("Admin license overview query failed:", error);
    }
    try {
      const congregationLicenseResult = await adminQuery<{
        id: string;
        license_status: "active" | "grace_period" | "blocked" | null;
        license_expires_at: string | null;
        license_cycle_days: number | null;
        max_operators: number | null;
      }>(
        `select id, license_status, license_expires_at, license_cycle_days, max_operators
           from public.congregations
          where license_expires_at is not null`,
      );
      congregationLicenses = congregationLicenseResult.rows;
    } catch (error) {
      console.error("Congregation license columns are unavailable:", error);
    }
    const licensesByCongregation = new Map(licenseRows.map((license) => [license.congregation_id, license]));
    const congregationLicensesById = new Map(congregationLicenses.map((license) => [license.id, license]));
    const overrides = permissionResult.rows;
    const users: AdminUser[] = userResult.rows.map((user) => {
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
      organizations: organizationResult.rows.map((organization) => {
        const license = licensesByCongregation.get(organization.id);
        const configuredLicense = congregationLicensesById.get(organization.id);
        return {
          ...organization,
          license_status: configuredLicense?.license_status ?? (license ? "active" : null),
          license_expires_at: configuredLicense?.license_expires_at ?? license?.expires_at ?? null,
          license_cycle_days: configuredLicense?.license_cycle_days ?? (license ? 30 : null),
          max_operators: configuredLicense?.max_operators ?? license?.seats_total ?? null,
          active_operators: operatorCounts.get(organization.id) ?? 0,
        };
      }),
      users: users.sort((left, right) => left.name.localeCompare(right.name, "pt-BR")),
    };
    return NextResponse.json({ data: overview }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Admin overview query failed:", error);
    return NextResponse.json({ error: "admin_data_load_failed" }, { status: 500, headers: { "Cache-Control": "no-store" } });
  }
}