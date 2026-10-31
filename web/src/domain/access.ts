import type { CongregationId, UserId } from "./finance";
import type { OrganizationType } from "./vocabulary";

export type Role = "central_admin" | "congregation_admin" | "treasurer" | "auditor" | "viewer";
export type Permission =
  | "financial.read"
  | "financial.write"
  | "financial.approve"
  | "closing.submit"
  | "closing.approve"
  | "audit.read"
  | "hierarchy.view"
  | "hierarchy.financial.read";

export type User = { id: UserId; name: string; email: string };
export type Congregation = { id: CongregationId; name: string; city: string; active: boolean; state?: string | null; parentId?: string | null; organizationType?: OrganizationType; isHeadquarters?: boolean };
export type MembershipPermissions = Partial<Record<Permission, boolean>>;
export type Membership = { userId: UserId; congregationId: CongregationId; role: Role; permissions?: MembershipPermissions };

export const rolePermissions: Record<Role, Permission[]> = {
  central_admin: ["financial.read", "financial.write", "financial.approve", "closing.submit", "closing.approve", "audit.read"],
  congregation_admin: ["financial.read", "financial.write", "financial.approve", "closing.submit", "audit.read"],
  treasurer: ["financial.read", "financial.write", "closing.submit"],
  auditor: ["financial.read", "audit.read"],
  viewer: ["financial.read"],
};

export type AdminPermission = Exclude<Permission, "closing.approve">;

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

export const DEV_MASTER_EMAIL = "renanmarianosd@hotmail.com";

export function isMasterAdmin(user: { email?: string | null; app_metadata?: Record<string, unknown> } | null | undefined): boolean {
  const email = user?.email?.toLowerCase().trim();
  const appMetadata = user?.app_metadata ?? {};
  const role = typeof appMetadata.role === "string" ? appMetadata.role.toLowerCase() : undefined;
  const isDev = Boolean(appMetadata.is_dev);
  const isSuperAdmin = Boolean(appMetadata.is_super_admin);
  return email === DEV_MASTER_EMAIL.toLowerCase() || isDev || isSuperAdmin || role === "central_admin";
}

export function allowedCongregationIds(userId: UserId, memberships: Membership[]): CongregationId[] {
  return memberships.filter((membership) => membership.userId === userId).map((membership) => membership.congregationId);
}
