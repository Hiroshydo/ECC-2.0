import type { ReactNode } from "react";
import { LockKeyhole } from "lucide-react";

import { checkSeat, usagePercent, type LicenseInfo } from "@/modules/core/khatam/services/license.shared";

export function KhatamQuotaBar({ license, children }: { license: LicenseInfo | null; children?: ReactNode }) {
  const now = new Date();
  const seatCheck = license ? checkSeat(license, now) : null;
  const usage = license ? usagePercent(license) : 0;
  const expiresAt = license ? new Date(license.expiresAt) : null;
  const validExpiry = expiresAt && Number.isFinite(expiresAt.getTime());
  const daysUntilExpiry = validExpiry
    ? Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / 86_400_000))
    : null;
  const blocked = seatCheck?.reason === "blocked" || seatCheck?.reason === "expired";
  const expiring = !blocked && (license?.status === "grace_period" || (daysUntilExpiry !== null && daysUntilExpiry <= 7));

  return (
    <div className={`license-summary${blocked ? " is-blocked" : expiring ? " is-expiring" : ""}`}>
      <div className="license-summary__status">
        <LockKeyhole aria-hidden="true" size={20} strokeWidth={1.7} />
        <div>
          <strong>{!license ? "Licença não configurada" : blocked ? "Licença bloqueada" : license.status === "grace_period" ? "Período de carência" : "Licença ativa"}</strong>
          <span>
            {!license
              ? "Configure uma licença para habilitar convites."
              : validExpiry
                ? `Restam ${daysUntilExpiry} dias · Ciclo de ${license.cycleDays ?? 30} dias · vence em ${expiresAt.toLocaleDateString("pt-BR")}`
                : `Ciclo de ${license.cycleDays ?? 30} dias`}
          </span>
        </div>
      </div>

      {license ? (
        <div className="license-summary__usage">
          <div className="license-summary__usage-label">
            <span>Operadores ativos</span>
            <strong>{license.seatsUsed} de {license.seatsTotal}</strong>
          </div>
          <div
            className="license-summary__track"
            role="progressbar"
            aria-label="Consumo de assentos"
            aria-valuenow={usage}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <span style={{ width: `${usage}%` }} />
          </div>
        </div>
      ) : null}

      {children ? <div className="license-summary__action">{children}</div> : null}
    </div>
  );
}
