import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { InviteOperatorModal } from "@/modules/core/canaa/components/InviteOperatorModal";
import { LocalTeamManager } from "@/modules/core/canaa/components/LocalTeamManager";
import { CongregationFlowMap } from "@/modules/core/canaa/components/CongregationFlowMap";
import { KhatamQuotaBar } from "@/modules/core/khatam/components/KhatamQuotaBar";

const license = {
  seatsTotal: 5,
  seatsUsed: 3,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export default function CanaaPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 20, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ModuleIcon module="canaa-local" variant="icon" size={56} decorative={false} />
        <h1 style={{ margin: 0, fontSize: 32 }}>Canaã Local</h1>
      </div>
      <KhatamQuotaBar license={license} />
      <CongregationFlowMap nodes={[]} edges={[]} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ModuleIcon module="canaa-access" variant="icon" size={28} decorative />
            <h2 style={{ margin: 0, fontSize: 24 }}>Equipe local</h2>
          </div>
          <InviteOperatorModal license={license} />
        </div>
        <LocalTeamManager members={[]} />
      </div>
    </div>
  );
}
