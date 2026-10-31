import { checkSeat, usagePercent, type LicenseInfo } from "@/modules/core/khatam/services/license.service";

export function KhatamQuotaBar({ license }: { license: LicenseInfo }) {
  const seatCheck = checkSeat(license, new Date());
  const usage = usagePercent(license);
  const red = usage >= 100 || seatCheck.reason === "expired";

  return (
    <div style={{ width: "100%", border: "1px solid #dfeae6", borderRadius: 16, background: "#fff", padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", color: "#52645d", fontWeight: 700 }}>Khatam</div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{license.seatsUsed}/{license.seatsTotal} ativos</div>
      </div>
      <div style={{ marginTop: 12, height: 12, width: "100%", borderRadius: 999, background: "#edf3ef", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(100, Math.max(0, usage))}%`, background: red ? "#d64545" : "#067a5d", transition: "width 180ms ease" }} />
      </div>
    </div>
  );
}
