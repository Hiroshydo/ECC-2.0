import type { User } from "@supabase/supabase-js";
import type { Congregation, Membership, MembershipPermissions, Role } from "@/domain/access";
import type { OrganizationType } from "@/domain/vocabulary";

export type AuthenticatedMembership = Membership & { congregation: Congregation };

type CongregationRow = { id: string; name: string; city: string; active: boolean; state?: string | null; parent_id?: string | null; organization_type?: OrganizationType; is_headquarters?: boolean };
type PermissionOverrideRow = { financial_read: boolean; financial_write: boolean; financial_approve: boolean; closing_submit: boolean; audit_read: boolean; hierarchy_view?: boolean; hierarchy_financial_read?: boolean };

export function toMemberships(user: User, rows: Array<{
  congregation_id: string;
  role: string;
  congregations: CongregationRow | CongregationRow[] | null;
  permission_overrides?: PermissionOverrideRow | PermissionOverrideRow[] | null;
}>): AuthenticatedMembership[] {
  return rows
    .map((row) => ({
      ...row,
      congregation: Array.isArray(row.congregations) ? row.congregations[0] : row.congregations,
      permissionOverride: Array.isArray(row.permission_overrides) ? row.permission_overrides[0] : row.permission_overrides,
    }))
    .filter((row): row is typeof row & { congregation: CongregationRow } => Boolean(row.congregation))
    .map((row) => {
      const permissionOverrides = row.permissionOverride;
      const permissions: MembershipPermissions | undefined = permissionOverrides ? {
        "financial.read": permissionOverrides.financial_read,
        "financial.write": permissionOverrides.financial_write,
        "financial.approve": permissionOverrides.financial_approve,
        "closing.submit": permissionOverrides.closing_submit,
        "audit.read": permissionOverrides.audit_read,
        "hierarchy.view": permissionOverrides.hierarchy_view ?? false,
        "hierarchy.financial.read": permissionOverrides.hierarchy_financial_read ?? false,
      } : undefined;
      return {
        userId: user.id,
        congregationId: row.congregation_id,
        role: row.role as Role,
        permissions,
        congregation: {
          id: row.congregation.id,
          name: row.congregation.name,
          city: row.congregation.city,
          active: row.congregation.active,
          state: row.congregation.state,
          parentId: row.congregation.parent_id ?? null,
          organizationType: row.congregation.organization_type,
          isHeadquarters: row.congregation.is_headquarters,
        },
      };
    });
}