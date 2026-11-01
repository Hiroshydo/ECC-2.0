import { describe, expect, it } from "vitest";

import {
  parseUnitDirectoryUrlState,
  serializeUnitDirectoryUrlState,
} from "@/modules/core/canaa/services/units.url-state";

const selectedUnitId = "3213e0ce-f4c1-4d10-9c4c-75e944e0a933";

describe("unit directory URL state", () => {
  it("round-trips directory filters, view, page, and selected unit", () => {
    const current = new URLSearchParams("tab=access&organizationId=external-focus");
    const query = serializeUnitDirectoryUrlState(current, {
      filters: {
        q: "Igreja Central",
        type: "church",
        status: "active",
        license: "expira_7d",
        parentId: selectedUnitId,
        order: "expiration",
        page: 3,
        pageSize: 50,
        view: "tabela",
      },
      selectedUnitId,
    });

    expect(query.get("tab")).toBe("access");
    expect(query.get("organizationId")).toBe("external-focus");
    expect(parseUnitDirectoryUrlState(query)).toEqual({
      filters: {
        q: "Igreja Central",
        type: "church",
        status: "active",
        license: "expira_7d",
        parentId: selectedUnitId,
        order: "expiration",
        page: 3,
        pageSize: 50,
        view: "tabela",
      },
      selectedUnitId,
    });
  });

  it("removes defaults and ignores malformed selected-unit IDs", () => {
    const current = new URLSearchParams("q=old&pagina=2&unidade=not-a-uuid&tab=noah");
    const query = serializeUnitDirectoryUrlState(current, {
      filters: {
        q: "",
        type: null,
        status: null,
        license: null,
        parentId: null,
        order: "name",
        page: 1,
        pageSize: 25,
        view: null,
      },
      selectedUnitId: "invalid",
    });
    expect(query.toString()).toBe("tab=noah");
    expect(parseUnitDirectoryUrlState(query).selectedUnitId).toBeNull();
  });
});
