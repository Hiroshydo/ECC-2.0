import type { CongregationId, UserId } from "./finance";
import type { OrganizationLevel, OrganizationType } from "./vocabulary";

export type Role = "central_admin" | "congregation_admin" | "treasurer" | "auditor" | "viewer";
export type Permission =
  | "financial.read"
  | "financial.write"
  | "financial.approve"
  | "closing.submit"
  | "transfer.send"
  | "audit.read"
  | "hierarchy.view"
  | "hierarchy.financial.read";

export type User = { id: UserId; name: string; email: string };
export type Congregation = { id: CongregationId; name: string; city: string; active: boolean; state?: string | null; parentId?: string | null; organizationType?: OrganizationType; organizationLevel?: OrganizationLevel; isHeadquarters?: boolean };
export type MembershipPermissions = Partial<Record<Permission, boolean>>;
export type Membership = { userId: UserId; congregationId: CongregationId; role: Role; permissions?: MembershipPermissions };

export const rolePermissions: Record<Role, Permission[]> = {
  central_admin: ["financial.read", "financial.write", "financial.approve", "closing.submit", "audit.read"],
  congregation_admin: ["financial.read", "financial.write", "financial.approve", "closing.submit", "audit.read"],
  treasurer: ["financial.read", "financial.write", "closing.submit", "transfer.send"],
  auditor: ["financial.read", "audit.read"],
  viewer: ["financial.read"],
};

export type AdminPermission = Exclude<Permission, "transfer.send">;

export const allPermissions: AdminPermission[] = [
  "financial.read",
  "financial.write",
  "financial.approve",
  "closing.submit",
  "audit.read",
  "hierarchy.view",
  "hierarchy.financial.read",
];

export function permissionsForRole(role: Role): MembershipPermissions {
  return Object.fromEntries(allPermissions.map((permission) => [permission, rolePermissions[role].includes(permission)])) as MembershipPermissions;
}

export function can(membership: Membership, permission: Permission): boolean {
  const override = membership.permissions?.[permission];
  if (override !== undefined) return override;
  return rolePermissions[membership.role].includes(permission);
}

export function isPlatformOperator(
  user: { app_metadata?: Record<string, unknown> } | null | undefined,
): boolean {
  return user?.app_metadata?.role === "platform_operator";
}

export function platformOperatorAccessStatus(
  user: { app_metadata?: Record<string, unknown> } | null | undefined,
): 401 | 403 | null {
  if (!user) return 401;
  return isPlatformOperator(user) ? null : 403;
}

export function allowedCongregationIds(userId: UserId, memberships: Membership[]): CongregationId[] {
  return memberships.filter((membership) => membership.userId === userId).map((membership) => membership.congregationId);
}
