import type { Role } from "../../domain/access";
import type { OrganizationType } from "../../domain/vocabulary";
import type { AdminAssignment, AdminOrganization, AdminUser } from "./types";

export type UnitMember = {
  user: AdminUser;
  assignment: AdminAssignment;
};

export type UnitAlert = {
  id: "inactive-with-access" | "no-users" | "no-treasurer";
  label: string;
  severity: "warning" | "danger";
  suggestedRole?: Role;
};

export const ROLE_ORDER: Role[] = [
  "central_admin",
  "treasurer",
  "congregation_admin",
  "auditor",
  "viewer",
];

export const ORGANIZATION_LEVEL_LABELS: Record<AdminOrganization["organization_level"], string> = {
  national_hq: "Sede Nacional",
  state_hq: "Sede Estadual",
  sub_hq: "Sub-Sede / Regional",
  local_congregation: "Congregação Local",
};

export function roleOptionsForOrganizationType(
  type: OrganizationType,
): Array<{ value: Role; label: string }> {
  return ROLE_ORDER.map((role) => ({ value: role, label: roleLabelFor(role, type) }));
}

function normalizeUnitValue(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR");
}

export function findDuplicateUnits(
  name: string,
  city: string,
  organizations: AdminOrganization[],
  excludeId?: string,
): AdminOrganization[] {
  const normalizedName = normalizeUnitValue(name);
  const normalizedCity = normalizeUnitValue(city);
  if (!normalizedName || !normalizedCity) return [];
  return organizations.filter((unit) =>
    unit.id !== excludeId
      && normalizeUnitValue(unit.name) === normalizedName
      && normalizeUnitValue(unit.city) === normalizedCity,
  );
}

export function organizationDisplayLabel(
  unit: AdminOrganization,
  organizations: AdminOrganization[],
): string {
  const duplicates = findDuplicateUnits(unit.name, unit.city, organizations, unit.id);
  const location = `${unit.city}/${unit.state ?? ""}`;
  if (!duplicates.length) return `${unit.name} — ${location}`;
  return `${unit.name} — ${location} · ${ORGANIZATION_LEVEL_LABELS[unit.organization_level]} · ${unit.id.slice(0, 6)}`;
}

export const CONTEXTUAL_ROLES: Record<OrganizationType, Record<Role, string>> = {
  church: {
    central_admin: "Pastor",
    treasurer: "Tesoureiro",
    congregation_admin: "Secretário",
    auditor: "Auditor",
    viewer: "Visualizador",
  },
  ong: {
    central_admin: "Diretor Executivo",
    treasurer: "Gestor Financeiro",
    congregation_admin: "Coordenador de Projetos",
    auditor: "Conselho Fiscal / Auditor",
    viewer: "Visualizador",
  },
};

export function roleLabelFor(role: Role, type: OrganizationType): string {
  return CONTEXTUAL_ROLES[type]?.[role] ?? CONTEXTUAL_ROLES.church[role];
}

export function groupMembersByUnit(users: AdminUser[]): Map<string, UnitMember[]> {
  const map = new Map<string, UnitMember[]>();
  for (const user of users) {
    for (const assignment of user.assignments) {
      const list = map.get(assignment.congregationId) ?? [];
      list.push({ user, assignment });
      map.set(assignment.congregationId, list);
    }
  }
  for (const list of map.values()) {
    list.sort((a, b) => a.user.name.localeCompare(b.user.name, "pt-BR"));
  }
  return map;
}

export function computeUnitAlerts(unit: AdminOrganization, members: UnitMember[]): UnitAlert[] {
  const alerts: UnitAlert[] = [];
  const hasTreasurer = members.some((member) => member.assignment.role === "treasurer");

  if (!unit.active && members.length > 0) {
    alerts.push({
      id: "inactive-with-access",
      label: `Unidade inativa ainda possui ${members.length} ${members.length === 1 ? "acesso ativo" : "acessos ativos"}`,
      severity: "danger",
    });
  }

  if (unit.active && members.length === 0) {
    alerts.push({
      id: "no-users",
      label: "Nenhum usuário vinculado a esta unidade",
      severity: "warning",
      suggestedRole: "treasurer",
    });
  } else if (unit.active && !hasTreasurer) {
    const treasurerLabel = roleLabelFor("treasurer", unit.organization_type);
    alerts.push({
      id: "no-treasurer",
      label: `Sem responsável com perfil de Tesouraria (${treasurerLabel})`,
      severity: "danger",
      suggestedRole: "treasurer",
    });
  }

  return alerts;
}

export function computeAlertsByUnitId(
  organizations: AdminOrganization[],
  membersByUnitId: Map<string, UnitMember[]>,
): Map<string, UnitAlert[]> {
  const map = new Map<string, UnitAlert[]>();
  for (const unit of organizations) {
    map.set(unit.id, computeUnitAlerts(unit, membersByUnitId.get(unit.id) ?? []));
  }
  return map;
}

export function countUnitsWithAlerts(
  organizations: AdminOrganization[],
  users: AdminUser[],
): number {
  const membersByUnitId = groupMembersByUnit(users);
  let count = 0;
  for (const unit of organizations) {
    if (computeUnitAlerts(unit, membersByUnitId.get(unit.id) ?? []).length > 0) {
      count += 1;
    }
  }
  return count;
}
