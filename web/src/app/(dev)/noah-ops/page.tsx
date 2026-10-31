import { CongregationFlowMap } from "@/modules/core/canaa/components/CongregationFlowMap";
import { NoahTelemetryGrid } from "@/modules/core/canaa/components/NoahTelemetryGrid";
import type { ModuleTelemetry } from "@/modules/core/canaa/types";

const telemetry: ModuleTelemetry[] = [];

export default function NoahOpsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 20, width: "100%" }}>
      <NoahTelemetryGrid modules={telemetry} />
      <CongregationFlowMap nodes={[]} edges={[]} />
    </div>
  );
}
