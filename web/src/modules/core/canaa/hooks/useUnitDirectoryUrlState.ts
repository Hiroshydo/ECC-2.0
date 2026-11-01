"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  parseUnitDirectoryUrlState,
  serializeUnitDirectoryUrlState,
  type UnitDirectoryUrlState,
} from "@/modules/core/canaa/services/units.url-state";
import type { UnitFilters } from "@/modules/core/canaa/services/units.filters";

export function useUnitDirectoryUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const state = useMemo(
    () => parseUnitDirectoryUrlState(new URLSearchParams(queryString)),
    [queryString],
  );

  const update = useCallback((next: UnitDirectoryUrlState) => {
    const params = serializeUnitDirectoryUrlState(new URLSearchParams(queryString), next);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, queryString, router]);

  const updateFilters = useCallback((patch: Partial<UnitFilters>) => {
    const filters = { ...state.filters, ...patch };
    if (patch.page === undefined) filters.page = 1;
    update({ ...state, filters });
  }, [state, update]);

  const setPage = useCallback((page: number) => {
    update({ ...state, filters: { ...state.filters, page } });
  }, [state, update]);

  const setSelectedUnitId = useCallback((selectedUnitId: string | null) => {
    update({ ...state, selectedUnitId });
  }, [state, update]);

  const setView = useCallback((view: UnitFilters["view"]) => {
    update({ ...state, filters: { ...state.filters, view } });
  }, [state, update]);

  return { ...state, updateFilters, setPage, setSelectedUnitId, setView };
}
