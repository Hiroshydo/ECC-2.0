import { describe, expect, it } from "vitest";

import {
  classifyLicense,
  expiresWithinDays,
  LICENSE_WARNING_WINDOW_DAYS,
} from "@/modules/core/canaa/services/license.classification";
import { parseUnitFilters } from "@/modules/core/canaa/services/units.filters";

const now = new Date("2026-03-01T12:00:00.000Z");
const inThirtyDays = new Date("2026-03-31T12:00:00.000Z");

describe("classifyLicense", () => {
  it("classifies units without a configured license", () => {
    expect(classifyLicense({ seatsUsed: 0, seatsTotal: null, expiresAt: null, now })).toBe("sem_licenca");
  });

  it("marks licenses expiring within seven days", () => {
    expect(classifyLicense({
      seatsUsed: 1,
      seatsTotal: 5,
      expiresAt: "2026-03-08T11:59:59.999Z",
      now,
    })).toBe("expira_7d");
  });

  it("treats a grace period as expiring even after the original date", () => {
    expect(classifyLicense({
      seatsUsed: 1,
      seatsTotal: 5,
      expiresAt: "2026-02-28T12:00:00.000Z",
      status: "grace_period",
      now,
    })).toBe("expira_7d");
  });

  it("prioritizes blocked and expired license states", () => {
    expect(classifyLicense({
      seatsUsed: 5,
      seatsTotal: 5,
      expiresAt: "2026-02-28T12:00:00.000Z",
      status: "blocked",
      now,
    })).toBe("bloqueada");
    expect(classifyLicense({
      seatsUsed: 5,
      seatsTotal: 5,
      expiresAt: "2026-02-28T12:00:00.000Z",
      now,
    })).toBe("expirada");
  });

  it("classifies full and in-date licenses", () => {
    expect(classifyLicense({
      seatsUsed: 5,
      seatsTotal: 5,
      expiresAt: inThirtyDays,
      now,
    })).toBe("assentos_cheios");
    expect(classifyLicense({
      seatsUsed: 4,
      seatsTotal: 5,
      expiresAt: inThirtyDays,
      now,
    })).toBe("ativa");
  });

  it("uses the assumed 30-day window for network-health summaries", () => {
    expect(LICENSE_WARNING_WINDOW_DAYS).toBe(30);
    expect(expiresWithinDays("2026-03-31T11:59:59.999Z", LICENSE_WARNING_WINDOW_DAYS, now)).toBe(true);
    expect(expiresWithinDays("2026-04-01T12:00:00.000Z", LICENSE_WARNING_WINDOW_DAYS, now)).toBe(false);
    expect(expiresWithinDays("2026-02-28T12:00:00.000Z", LICENSE_WARNING_WINDOW_DAYS, now)).toBe(false);
  });
});

describe("parseUnitFilters", () => {
  it("normalizes valid filters and clamps pagination", () => {
    expect(parseUnitFilters(new URLSearchParams(
      "q=%20Igreja%20Central%20&tipo=church&status=active&licenca=expira_7d&pagina=3&pageSize=500&ordem=expiracao&view=tabela",
    ))).toEqual({
      q: "Igreja Central",
      type: "church",
      status: "active",
      license: "expira_7d",
      parentId: null,
      order: "expiration",
      page: 3,
      pageSize: 100,
      view: "tabela",
    });
  });

  it("uses safe defaults for malformed, short, and unsupported values", () => {
    expect(parseUnitFilters({
      q: "x",
      tipo: "other",
      status: "pending",
      licenca: "unknown",
      pagina: "-2",
      pageSize: "0",
      ordem: "newest",
      view: "grid",
    })).toEqual({
      q: "",
      type: null,
      status: null,
      license: null,
      parentId: null,
      order: "name",
      page: 1,
      pageSize: 25,
      view: null,
    });
  });
});
