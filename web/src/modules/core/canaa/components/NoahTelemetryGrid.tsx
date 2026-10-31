import { ModuleIcon } from "@/components/brand/ModuleIcon";
import type { ModuleTelemetry } from "@/modules/core/canaa/types";
import type { BrandModule } from "@/lib/branding/modules";

const healthPalette: Record<ModuleTelemetry["health"], { label: string; color: string }> = {
  ok: { label: "Operando", color: "#2d9f6d" },
  degraded: { label: "Atenção", color: "#d38a1b" },
  down: { label: "Indisponível", color: "#d64545" },
};

const moduleMap: Record<ModuleTelemetry["module"], BrandModule> = {
  khatam: "khatam",
  hiram: "hiram",
  elias: "elias",
  enoch: "enoch",
  sefer: "sefer",
};

export function NoahTelemetryGrid({ modules = [] }: { modules?: ModuleTelemetry[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 16, width: "100%" }}>
      {modules.map((module) => {
        const palette = healthPalette[module.health];
        const moduleBrand = moduleMap[module.module];
        return (
          <div key={module.module} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 16px", border: "1px solid #dfeae6", borderRadius: 14, background: "#fff", boxShadow: "0 8px 20px rgba(11, 31, 26, 0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <ModuleIcon module={moduleBrand} variant="icon" size={40} decorative />
              <div>
                <div style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: "#52645d", fontWeight: 700 }}>{module.module}</div>
                <div style={{ marginTop: 8, fontSize: 13, color: "#0b1f1a", fontWeight: 600 }}>{palette.label}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: palette.color, display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "#52645d" }}>{module.latencyMs ?? 0}ms</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
