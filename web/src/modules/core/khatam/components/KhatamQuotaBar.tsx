import type { ReactNode } from "react";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { checkSeat, usagePercent, type LicenseInfo } from "@/modules/core/khatam/services/license.shared";

export function KhatamQuotaBar({ license, children }: { license: LicenseInfo | null; children?: ReactNode }) {
  const seatCheck = license ? checkSeat(license, new Date()) : null;
  const usage = license ? usagePercent(license) : 0;
  const exhausted = seatCheck?.reason === "quota_exceeded";
  const expired = seatCheck?.reason === "expired";
  const status = !license
    ? "Licença não configurada"
    : expired
      ? "Licença expirada"
      : exhausted
        ? "Cota esgotada"
        : "Licença ativa";
  const statusColor = !license || expired || exhausted ? "#b45309" : "#047857";
  const expiresAt = license ? new Date(license.expiresAt) : null;

  return (
    <section aria-label="Khatam Authenticate" className="grid grid-cols-1 gap-4 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-white p-4 shadow-sm md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] md:items-center md:gap-6">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ display: "grid", width: 44, height: 44, flexShrink: 0, placeItems: "center", borderRadius: 14, background: "rgba(245, 158, 11, 0.1)" }}>
          <ModuleIcon module="khatam" variant="icon" size={32} decorative />
        </span>
        <div>
          <h2 style={{ margin: 0, color: "#78350f", fontSize: 16, fontWeight: 750 }}>Khatam Authenticate</h2>
          <p style={{ margin: "3px 0 0", color: "#78716c", fontSize: 12 }}>Ciclo de 30 dias</p>
        </div>
      </div>
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
          <span style={{ color: "#78716c", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Operadores Ativos</span>
          <strong style={{ color: "#292524", fontSize: 13 }}>{license ? `${license.seatsUsed} / ${license.seatsTotal}` : "Sem dados"}</strong>
        </div>
        <div style={{ height: 8, width: "100%", borderRadius: 999, background: "#f1f0ed", overflow: "hidden" }} role="progressbar" aria-label="Consumo de assentos" aria-valuenow={license ? usage : undefined} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ height: "100%", width: `${usage}%`, borderRadius: 999, background: expired || exhausted ? "#d97706" : "#10b981", transition: "width 180ms ease" }} />
        </div>
        <p style={{ margin: "6px 0 0", color: statusColor, fontSize: 12, fontWeight: 700 }}>
          {status}
          {expiresAt && Number.isFinite(expiresAt.getTime()) ? ` · até ${expiresAt.toLocaleDateString("pt-BR")}` : ""}
        </p>
      </div>
      <div className="flex flex-col items-start gap-2 md:items-end">
        {children}
        {!license ? <span style={{ color: "#78716c", fontSize: 11 }}>Configure a licença para liberar convites.</span> : null}
      </div>
    </section>
  );
}
