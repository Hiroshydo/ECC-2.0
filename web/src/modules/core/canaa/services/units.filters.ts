import type { LicenseState } from "@/modules/core/canaa/services/license.classification";

// ASSUNÇÃO: limitar a página a 100 mantém consultas administrativas previsíveis.
export const MAX_PAGE_SIZE = 100;
// ASSUNÇÃO: a primeira carga da tabela usa 25 unidades.
export const DEFAULT_PAGE_SIZE = 25;

export type UnitFilters = {
  q: string;
  type: "church" | "ngo" | null;
  status: "active" | "inactive" | null;
  license: LicenseState | null;
  parentId: string | null;
  order: "name" | "city" | "expiration";
  page: number;
  pageSize: number;
  view: "cartoes" | "tabela" | "mapa" | null;
  id?: string;
};

export type SearchParamInput = URLSearchParams | Record<string, string | string[] | undefined>;

function getValue(params: SearchParamInput, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function positiveInteger(value: string | undefined, fallback: number): number {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

const licenseFilters = new Set<LicenseState>([
  "sem_licenca",
  "ativa",
  "expira_7d",
  "expirada",
  "assentos_cheios",
  "bloqueada",
]);

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseUnitFilters(params: SearchParamInput): UnitFilters {
  const rawSearch = getValue(params, "q")?.trim() ?? "";
  const rawType = getValue(params, "tipo");
  const rawStatus = getValue(params, "status");
  const rawLicense = getValue(params, "licenca");
  const rawOrder = getValue(params, "ordem");
  const rawView = getValue(params, "view");
  const requestedPageSize = positiveInteger(getValue(params, "pageSize"), DEFAULT_PAGE_SIZE);

  // ASSUNÇÃO: busca só começa com 2 caracteres e é limitada a 100 para reduzir consultas amplas.
  return {
    q: rawSearch.length >= 2 ? rawSearch.slice(0, 100) : "",
    type: rawType === "church" || rawType === "ngo" ? rawType : null,
    status: rawStatus === "active" || rawStatus === "inactive" ? rawStatus : null,
    license: rawLicense && licenseFilters.has(rawLicense as LicenseState) ? rawLicense as LicenseState : null,
    parentId: (() => {
      const parentId = getValue(params, "ramo");
      return parentId && UUID_PATTERN.test(parentId) ? parentId : null;
    })(),
    order: rawOrder === "cidade" ? "city" : rawOrder === "expiracao" ? "expiration" : "name",
    page: positiveInteger(getValue(params, "pagina"), 1),
    pageSize: Math.min(MAX_PAGE_SIZE, requestedPageSize),
    view: rawView === "cartoes" || rawView === "tabela" || rawView === "mapa" ? rawView : null,
  };
}
