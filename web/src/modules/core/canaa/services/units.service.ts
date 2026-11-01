import "server-only";

import { can, isMasterAdmin } from "@/domain/access";
import type { OrganizationType } from "@/domain/vocabulary";
import type { AuthenticatedMembership } from "@/lib/auth/session";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { adminQuery } from "@/lib/db/pool";
import {
  classifyLicense,
  expiresWithinDays,
  LICENSE_WARNING_WINDOW_DAYS,
  type LicenseState,
} from "@/modules/core/canaa/services/license.classification";
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  type UnitFilters,
} from "@/modules/core/canaa/services/units.filters";

export { classifyLicense, MAX_PAGE_SIZE };
export { parseUnitFilters } from "@/modules/core/canaa/services/units.filters";
export type { LicenseState } from "@/modules/core/canaa/services/license.classification";
export type { UnitFilters } from "@/modules/core/canaa/services/units.filters";

export type UnitSummary = {
  id: string;
  name: string;
  city: string;
  state: string | null;
  type: OrganizationType;
  isHeadquarters: boolean;
  active: boolean;
  parentId: string | null;
  parentName: string | null;
  leaderName: string | null;
  childrenCount: number;
  seatsUsed: number;
  seatsTotal: number | null;
  licenseExpiresAt: string | null;
  licenseState: LicenseState;
};

export type ListUnitsResult = {
  items: UnitSummary[];
  total: number;
  licenseAvailability: "available" | "unavailable";
};

export type NetworkHealth = {
  available: boolean;
  counts: {
    sem_licenca: number;
    expira_30d: number;
    assentos_cheios: number;
    sem_administrador: number;
    em_dia: number;
  } | null;
};

export type UnitDetail = UnitSummary & {
  organizationLevel: "national_hq" | "state_hq" | "sub_hq" | "local_congregation";
  children: UnitSummary[];
  operators: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    contextualRole: string;
  }>;
};

export type UnitReadScope =
  | { kind: "global" }
  | { kind: "branch"; rootId: string };

export class UnitAuthorizationError extends Error {
  constructor(readonly code: "authentication_required" | "master_admin_required" | "hierarchy_view_required") {
    super(code);
  }
}

type Authorization = {
  userId: string;
  isMaster: boolean;
  memberships: AuthenticatedMembership[];
};

type UnitRow = {
  id: string;
  name: string;
  city: string;
  state: string | null;
  organization_type: string;
  is_headquarters: boolean;
  active: boolean;
  parent_id: string | null;
  parent_name: string | null;
  leader_name: string | null;
  children_count: number;
  seats_used: number;
  seats_total: number | null;
  license_expires_at: string | null;
  license_status: "active" | "grace_period" | "blocked" | null;
};

type QueryParts = {
  cte: string;
  from: string;
  where: string;
  values: unknown[];
};

const DEFAULT_FILTERS: UnitFilters = {
  q: "",
  type: null,
  status: null,
  license: null,
  parentId: null,
  order: "name",
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  view: null,
};

const ROLE_LABELS: Record<string, Record<string, string>> = {
  church: {
    central_admin: "Pastor",
    congregation_admin: "Secretário",
    treasurer: "Tesoureiro",
    auditor: "Auditor",
    viewer: "Visualizador",
  },
  ong: {
    central_admin: "Diretor Executivo",
    congregation_admin: "Coordenador de Projetos",
    treasurer: "Gestor Financeiro",
    auditor: "Conselho Fiscal",
    viewer: "Visualizador",
  },
};

function databaseErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null || !("code" in error)) return undefined;
  return typeof error.code === "string" ? error.code : undefined;
}

async function authorize(scope: UnitReadScope): Promise<Authorization> {
  const user = await getCurrentUser();
  if (!user) throw new UnitAuthorizationError("authentication_required");

  const isMaster = isMasterAdmin(user);
  if (scope.kind === "global" && !isMaster) throw new UnitAuthorizationError("master_admin_required");

  let memberships: AuthenticatedMembership[] = [];
  if (!isMaster || scope.kind === "branch") memberships = await getUserMemberships(user);
  if (scope.kind === "branch") {
    const membership = memberships.find((item) => item.congregationId === scope.rootId);
    if (!membership || !can(membership, "hierarchy.view")) throw new UnitAuthorizationError("hierarchy_view_required");
  }

  return { userId: user.id, isMaster, memberships };
}

function buildQueryParts(filters: UnitFilters, scope: UnitReadScope): QueryParts {
  const values: unknown[] = [];
  const cte = scope.kind === "branch"
    ? `with recursive scoped_units(id, visited) as (
         select congregation.id, array[congregation.id]
           from public.congregations congregation
          where congregation.id = $1
         union all
         select child.id, parent.visited || child.id
           from public.congregations child
           join scoped_units parent on child.parent_id = parent.id
          where not child.id = any(parent.visited)
       )`
    : `with scoped_units(id, visited) as (
         select congregation.id, array[congregation.id]
           from public.congregations congregation
       )`;
  if (scope.kind === "branch") values.push(scope.rootId);

  const conditions = ["unit.id in (select id from scoped_units)"];
  const add = (value: unknown) => {
    values.push(value);
    return `$${values.length}`;
  };

  if (filters.q) {
    const query = filters.q.replace(/[\\%_]/g, "\\$&");
    const searchParameter = add(`%${query}%`);
    conditions.push(`(unit.name ilike ${searchParameter} escape '\\' or unit.city ilike ${searchParameter} escape '\\')`);
  }
  if (filters.type) conditions.push(`unit.organization_type = ${add(filters.type)}`);
  if (filters.status) conditions.push(`unit.active = ${add(filters.status === "active")}`);
  if (filters.id) conditions.push(`unit.id = ${add(filters.id)}`);

  switch (filters.license) {
    case "sem_licenca":
      conditions.push("(unit.seats_total is null or unit.license_expires_at is null)");
      break;
    case "ativa":
      conditions.push("unit.license_state = 'ativa'");
      break;
    case "expira_7d":
      conditions.push("unit.license_state = 'expira_7d'");
      break;
    case "expirada":
      conditions.push("unit.license_state = 'expirada'");
      break;
    case "assentos_cheios":
      conditions.push("unit.license_state = 'assentos_cheios'");
      break;
    case "bloqueada":
      conditions.push("unit.license_state = 'bloqueada'");
      break;
  }

  if (filters.parentId) {
    const parentParam = add(filters.parentId);
    conditions.push(`unit.id in (
      with recursive selected_branch(id, visited) as (
        select congregation.id, array[congregation.id]
          from public.congregations congregation
         where congregation.id = ${parentParam}
        union all
        select child.id, parent.visited || child.id
          from public.congregations child
          join selected_branch parent on child.parent_id = parent.id
         where not child.id = any(parent.visited)
      )
      select id from selected_branch
    )`);
  }

  const from = `from (
    select congregation.id, congregation.name, congregation.city, congregation.state,
           congregation.organization_type, congregation.is_headquarters, congregation.active,
           congregation.parent_id, parent.name as parent_name, congregation.leader_name,
           (select count(*)::int from public.congregations child where child.parent_id = congregation.id) as children_count,
           coalesce(member_counts.seats_used, 0)::int as seats_used,
           coalesce(congregation.max_operators, license.seats_total) as seats_total,
           coalesce(congregation.license_expires_at, license.expires_at) as license_expires_at,
           coalesce(congregation.license_status, case when license.congregation_id is not null then 'active' end) as license_status,
           case
             when congregation.license_status = 'blocked' then 'bloqueada'
             when congregation.license_status = 'grace_period' then 'expira_7d'
             when congregation.license_expires_at is null and license.congregation_id is null then 'sem_licenca'
             when coalesce(congregation.license_expires_at, license.expires_at) <= now() then 'expirada'
             when coalesce(member_counts.seats_used, 0) >= coalesce(congregation.max_operators, license.seats_total) then 'assentos_cheios'
             when coalesce(congregation.license_expires_at, license.expires_at) <= now() + interval '7 days' then 'expira_7d'
             else 'ativa'
           end as license_state
      from public.congregations congregation
      left join public.congregations parent on parent.id = congregation.parent_id
      left join public.khatam_licenses license on license.congregation_id = congregation.id
      left join (
        select membership.congregation_id, count(*)::int as seats_used
          from public.memberships membership
          join auth.users account on account.id = membership.user_id and account.deleted_at is null
          group by membership.congregation_id
      ) member_counts on member_counts.congregation_id = congregation.id
  ) unit`;
  const where = `where ${conditions.join(" and ")}`;

  return { cte, from, where, values };
}

function mapUnit(row: UnitRow): UnitSummary {
  const state = classifyLicense({
    seatsUsed: Number(row.seats_used),
    seatsTotal: row.seats_total === null ? null : Number(row.seats_total),
    expiresAt: row.license_expires_at,
    status: row.license_status,
  });
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    state: row.state,
    type: row.organization_type === "ong" ? "ong" : "church",
    isHeadquarters: row.is_headquarters,
    active: row.active,
    parentId: row.parent_id,
    parentName: row.parent_name,
    leaderName: row.leader_name,
    childrenCount: Number(row.children_count),
    seatsUsed: Number(row.seats_used),
    seatsTotal: row.seats_total === null ? null : Number(row.seats_total),
    licenseExpiresAt: row.license_expires_at,
    licenseState: state,
  };
}

function orderBy(order: UnitFilters["order"]): string {
  if (order === "city") return "unit.city asc, unit.name asc";
  if (order === "expiration") return "unit.license_expires_at asc nulls last, unit.name asc";
  return "unit.name asc";
}

async function runListQuery(filters: UnitFilters, scope: UnitReadScope) {
  const parts = buildQueryParts(filters, scope);
  const select = `select unit.id, unit.name, unit.city, unit.state, unit.organization_type,
      unit.is_headquarters, unit.active, unit.parent_id, unit.parent_name, unit.leader_name,
      unit.children_count, unit.seats_used, unit.seats_total, unit.license_expires_at,
      unit.license_status
    ${parts.from}
    join scoped_units scope_unit on scope_unit.id = unit.id
    ${parts.where}
    order by ${orderBy(filters.order)}
    limit $${parts.values.length + 1} offset $${parts.values.length + 2}`;
  const count = `select count(*)::int as total
    ${parts.from}
    join scoped_units scope_unit on scope_unit.id = unit.id
    ${parts.where}`;
  const values = [...parts.values];
  const countValues = [...values];
  values.push(Math.min(MAX_PAGE_SIZE, Math.max(1, filters.pageSize)), (Math.max(1, filters.page) - 1) * Math.min(MAX_PAGE_SIZE, Math.max(1, filters.pageSize)));
  const [rows, countResult] = await Promise.all([
    adminQuery<UnitRow>(`${parts.cte} ${select}`, values),
    adminQuery<{ total: number }>(`${parts.cte} ${count}`, countValues),
  ]);
  return {
    items: rows.rows.map(mapUnit),
    total: Number(countResult.rows[0]?.total ?? 0),
    licenseAvailability: "available" as const,
  };
}

async function runLegacyListQuery(filters: UnitFilters, scope: UnitReadScope) {
  const parts = buildQueryParts(filters, scope);
  const legacyFrom = `from (
    select congregation.id, congregation.name, congregation.city, congregation.state,
           congregation.organization_type, congregation.is_headquarters, congregation.active,
           congregation.parent_id, parent.name as parent_name, congregation.leader_name,
           (select count(*)::int from public.congregations child where child.parent_id = congregation.id) as children_count,
           coalesce(member_counts.seats_used, 0)::int as seats_used,
           license.seats_total, license.expires_at as license_expires_at,
           case when license.congregation_id is not null then 'active' else null end as license_status,
           case
             when license.congregation_id is null then 'sem_licenca'
             when license.expires_at <= now() then 'expirada'
             when coalesce(member_counts.seats_used, 0) >= license.seats_total then 'assentos_cheios'
             when license.expires_at <= now() + interval '7 days' then 'expira_7d'
             else 'ativa'
           end as license_state
      from public.congregations congregation
      left join public.congregations parent on parent.id = congregation.parent_id
      left join public.khatam_licenses license on license.congregation_id = congregation.id
      left join (
        select membership.congregation_id, count(*)::int as seats_used
          from public.memberships membership
          join auth.users account on account.id = membership.user_id and account.deleted_at is null
          group by membership.congregation_id
      ) member_counts on member_counts.congregation_id = congregation.id
  ) unit`;
  const conditions = [...parts.where.replace(/^where /, "").split(" and ")];
  const values = [...parts.values];

  // Legacy schemas do not have a persisted state, so classify using their license table values.
  const legacyWhere = `where ${conditions.join(" and ")}`;
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, filters.pageSize));
  const offset = (Math.max(1, filters.page) - 1) * limit;
  const [rows, countResult] = await Promise.all([
    adminQuery<UnitRow>(
      `${parts.cte} select unit.id, unit.name, unit.city, unit.state, unit.organization_type,
          unit.is_headquarters, unit.active, unit.parent_id, unit.parent_name, unit.leader_name,
          unit.children_count, unit.seats_used, unit.seats_total, unit.license_expires_at,
          unit.license_status
        ${legacyFrom}
        join scoped_units scope_unit on scope_unit.id = unit.id
        ${legacyWhere}
        order by ${orderBy(filters.order)}
        limit $${values.length + 1} offset $${values.length + 2}`,
      [...values, limit, offset],
    ),
    adminQuery<{ total: number }>(
      `${parts.cte} select count(*)::int as total
        ${legacyFrom}
        join scoped_units scope_unit on scope_unit.id = unit.id
        ${legacyWhere}`,
      values,
    ),
  ]);
  return {
    items: rows.rows.map(mapUnit),
    total: Number(countResult.rows[0]?.total ?? 0),
    licenseAvailability: "available" as const,
  };
}

export async function listUnits(
  filters: UnitFilters = DEFAULT_FILTERS,
  scope: UnitReadScope = { kind: "global" },
): Promise<ListUnitsResult> {
  await authorize(scope);
  try {
    return await runListQuery(filters, scope);
  } catch (error) {
    if (databaseErrorCode(error) === "42703") {
      try {
        return await runLegacyListQuery(filters, scope);
      } catch (legacyError) {
        if (databaseErrorCode(legacyError) !== "42P01") throw legacyError;
        return { items: [], total: 0, licenseAvailability: "unavailable" };
      }
    }
    if (databaseErrorCode(error) === "42P01") {
      return { items: [], total: 0, licenseAvailability: "unavailable" };
    }
    throw error;
  }
}

async function loadHealthRows(scope: UnitReadScope, includeNewColumns: boolean): Promise<Array<{
  seats_used: number;
  seats_total: number | null;
  expires_at: string | null;
  status: "active" | "grace_period" | "blocked" | null;
  has_admin: boolean;
}>> {
  const cte = scope.kind === "branch"
    ? `with recursive scoped_units(id, visited) as (
         select id, array[id] from public.congregations where id = $1
         union all
         select child.id, parent.visited || child.id
           from public.congregations child join scoped_units parent on child.parent_id = parent.id
          where not child.id = any(parent.visited)
       )`
    : `with scoped_units(id, visited) as (select id, array[id] from public.congregations)`;
  const values = scope.kind === "branch" ? [scope.rootId] : [];
  const columns = includeNewColumns
    ? `coalesce(congregation.max_operators, license.seats_total) as seats_total,
       coalesce(congregation.license_expires_at, license.expires_at) as expires_at,
       coalesce(congregation.license_status, case when license.congregation_id is not null then 'active' end) as status`
    : `license.seats_total, license.expires_at, case when license.congregation_id is not null then 'active' end as status`;
  const result = await adminQuery<{
    seats_used: number;
    seats_total: number | null;
    expires_at: string | null;
    status: "active" | "grace_period" | "blocked" | null;
    has_admin: boolean;
  }>(
    `${cte}
     select coalesce(seats.used, 0)::int as seats_used,
            ${columns},
            exists (
              select 1 from public.memberships membership
              join auth.users account on account.id = membership.user_id
              where membership.congregation_id = congregation.id
                and membership.role in ('central_admin', 'congregation_admin')
                and account.deleted_at is null
            ) as has_admin
       from public.congregations congregation
       join scoped_units scope_unit on scope_unit.id = congregation.id
       left join public.khatam_licenses license on license.congregation_id = congregation.id
       left join (
         select congregation_id, count(*)::int as used
           from public.memberships membership
           join auth.users account on account.id = membership.user_id and account.deleted_at is null
          group by congregation_id
       ) seats on seats.congregation_id = congregation.id`,
    values,
  );
  return result.rows;
}

export async function getNetworkHealth(scope: UnitReadScope = { kind: "global" }): Promise<NetworkHealth> {
  await authorize(scope);
  let rows: Awaited<ReturnType<typeof loadHealthRows>>;
  try {
    rows = await loadHealthRows(scope, true);
  } catch (error) {
    if (databaseErrorCode(error) !== "42703") {
      if (databaseErrorCode(error) === "42P01") return { available: false, counts: null };
      throw error;
    }
    try {
      rows = await loadHealthRows(scope, false);
    } catch (legacyError) {
      if (databaseErrorCode(legacyError) === "42P01") return { available: false, counts: null };
      throw legacyError;
    }
  }

  const counts = {
    sem_licenca: 0,
    expira_30d: 0,
    assentos_cheios: 0,
    sem_administrador: 0,
    em_dia: 0,
  };
  for (const row of rows) {
    const licenseState = classifyLicense({
      seatsUsed: Number(row.seats_used),
      seatsTotal: row.seats_total === null ? null : Number(row.seats_total),
      expiresAt: row.expires_at,
      status: row.status,
    });
    if (licenseState === "sem_licenca") counts.sem_licenca += 1;
    if (licenseState === "expira_7d" || expiresWithinDays(row.expires_at, LICENSE_WARNING_WINDOW_DAYS) || row.status === "grace_period") {
      counts.expira_30d += 1;
    }
    if (licenseState === "assentos_cheios") counts.assentos_cheios += 1;
    if (licenseState === "ativa") counts.em_dia += 1;
    if (!row.has_admin) counts.sem_administrador += 1;
  }
  return { available: true, counts };
}

export async function getUnitDetail(id: string, scope: UnitReadScope = { kind: "global" }): Promise<UnitDetail | null> {
  await authorize(scope);
  const unitResult = await listUnits({ ...DEFAULT_FILTERS, id, pageSize: 1 }, scope);
  const unit = unitResult.items[0];
  if (!unit) return null;

  const levels = await adminQuery<{ organization_level: UnitDetail["organizationLevel"] }>(
    "select organization_level from public.congregations where id = $1",
    [id],
  );
  const childrenResult = await listUnits({
    ...DEFAULT_FILTERS,
    parentId: id,
    pageSize: MAX_PAGE_SIZE,
  }, scope);
  const operatorResult = await adminQuery<{
    id: string;
    name: string | null;
    email: string | null;
    role: string;
  }>(
    `select account.id,
            coalesce(account.raw_user_meta_data ->> 'full_name',
                     account.raw_user_meta_data ->> 'name',
                     account.email,
                     'Usuário') as name,
            account.email,
            membership.role
       from public.memberships membership
       join auth.users account on account.id = membership.user_id
      where membership.congregation_id = $1 and account.deleted_at is null
      order by name`,
    [id],
  );
  const organizationType = unit.type;

  return {
    ...unit,
    organizationLevel: levels.rows[0]?.organization_level ?? "local_congregation",
    children: childrenResult.items.filter((child) => child.parentId === id),
    operators: operatorResult.rows.map((operator) => ({
      id: operator.id,
      name: operator.name ?? "Usuário",
      email: operator.email ?? "",
      role: operator.role,
      contextualRole: ROLE_LABELS[organizationType][operator.role] ?? operator.role,
    })),
  };
}
