import { redirect } from "next/navigation";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { isMasterAdmin } from "@/domain/access";
import { createClient } from "@/lib/supabase/server";
import { CongregationFlowMap } from "@/modules/core/canaa/components/CongregationFlowMap";
import { NoahTelemetryGrid } from "@/modules/core/canaa/components/NoahTelemetryGrid";
import type { ModuleTelemetry } from "@/modules/core/canaa/types";

const telemetry: ModuleTelemetry[] = [
  { module: "khatam", health: "unknown" },
  { module: "hiram", health: "unknown" },
  { module: "elias", health: "unknown" },
  { module: "enoch", health: "unknown" },
  { module: "sefer", health: "unknown" },
];

export default async function NoahOpsPage() {
  const { data: { user } } = await (await createClient()).auth.getUser();
  if (!user) redirect("/login");
  if (!isMasterAdmin(user)) redirect("/");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 20, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ModuleIcon module="noah" variant="icon" size={56} decorative={false} />
        <div>
          <p className="eyebrow">SISTEMA · OPE</p>
          <h1 style={{ margin: 0, fontSize: 32 }}>Noah Ops</h1>
        </div>
      </div>
      <NoahTelemetryGrid modules={telemetry} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="eyebrow" style={{ letterSpacing: "0.08em" }}>Plugins · Em breve</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 18 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 12, border: "1px solid #dfeae6", borderRadius: 18, background: "#fff" }}>
            <ModuleIcon module="gideon" variant="badge" size={112} muted decorative />
            <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 999, background: "#edf3ef", color: "#2a5e4b", fontSize: 11, fontWeight: 700 }}>Em breve</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 12, border: "1px solid #dfeae6", borderRadius: 18, background: "#fff" }}>
            <ModuleIcon module="shofeet" variant="badge" size={112} muted decorative />
            <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 999, background: "#edf3ef", color: "#2a5e4b", fontSize: 11, fontWeight: 700 }}>Em breve</span>
          </div>
        </div>
      </div>
      <CongregationFlowMap nodes={[]} edges={[]} />
    </div>
  );
}
