import { parseUnitFilters, type SearchParamInput, type UnitFilters } from "@/modules/core/canaa/services/units.filters";

export type UnitDirectoryUrlState = {
  filters: UnitFilters;
  selectedUnitId: string | null;
};

const UNIT_QUERY_KEYS = [
  "q",
  "tipo",
  "status",
  "licenca",
  "ramo",
  "ordem",
  "pagina",
  "pageSize",
  "view",
  "unidade",
] as const;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getValue(params: SearchParamInput, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

export function parseUnitDirectoryUrlState(params: SearchParamInput): UnitDirectoryUrlState {
  const selected = getValue(params, "unidade");
  return {
    filters: parseUnitFilters(params),
    selectedUnitId: selected && UUID_PATTERN.test(selected) ? selected : null,
  };
}

export function serializeUnitDirectoryUrlState(
  existing: URLSearchParams,
  state: UnitDirectoryUrlState,
): URLSearchParams {
  const params = new URLSearchParams(existing);
  for (const key of UNIT_QUERY_KEYS) params.delete(key);

  const { filters } = state;
  if (filters.q) params.set("q", filters.q.slice(0, 100));
  if (filters.type) params.set("tipo", filters.type);
  if (filters.status) params.set("status", filters.status);
  if (filters.license) params.set("licenca", filters.license);
  if (filters.parentId) params.set("ramo", filters.parentId);
  if (filters.order === "city") params.set("ordem", "cidade");
  if (filters.order === "expiration") params.set("ordem", "expiracao");
  if (filters.page > 1) params.set("pagina", String(filters.page));
  if (filters.pageSize !== 25) params.set("pageSize", String(Math.min(100, Math.max(1, filters.pageSize))));
  if (filters.view) params.set("view", filters.view);
  if (state.selectedUnitId && UUID_PATTERN.test(state.selectedUnitId)) {
    params.set("unidade", state.selectedUnitId);
  }
  return params;
}
