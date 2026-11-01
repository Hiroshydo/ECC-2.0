import type { Permission, Role } from "@/domain/access";
import type { OrganizationLevel, OrganizationType } from "@/domain/vocabulary";

export type AdminPermission = Extract<Permission, "financial.read" | "financial.write" | "financial.approve" | "closing.submit" | "audit.read" | "hierarchy.view" | "hierarchy.financial.read">;
export type AdminPermissionSet = Record<AdminPermission, boolean>;

export type AdminAssignment = {
  congregationId: string;
  role: Role;
  permissions: AdminPermissionSet;
};

export type AdminOrganization = {
  id: string;
  name: string;
  city: string;
  state: string | null;
  parent_id?: string | null;
  leader_name?: string | null;
  organization_type: OrganizationType;
  organization_level: OrganizationLevel;
  is_headquarters: boolean;
  active: boolean;
  license_status?: "active" | "grace_period" | "blocked" | null;
  license_expires_at?: string | null;
  license_cycle_days?: number | null;
  max_operators?: number | null;
  active_operators?: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role | "viewer";
  assignments: AdminAssignment[];
};

export type AdminOverview = {
  organizations: AdminOrganization[];
  users: AdminUser[];
};