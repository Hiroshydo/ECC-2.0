import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Edge, Node } from "@xyflow/react";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { can, isMasterAdmin } from "@/domain/access";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { InviteOperatorModal } from "@/modules/core/canaa/components/InviteOperatorModal";
import { LocalTeamManager } from "@/modules/core/canaa/components/LocalTeamManager";
import { CongregationFlowMap } from "@/modules/core/canaa/components/CongregationFlowMap";
import type { CongregationNodeData } from "@/modules/core/canaa/types";
import { getLicense } from "@/modules/core/khatam/services/license.service";
import { KhatamQuotaBar } from "@/modules/core/khatam/components/KhatamQuotaBar";

export const dynamic = "force-dynamic";

export default async function CanaaPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const memberships = await getUserMemberships(user);
  const selectedId = (await cookies()).get("active_congregation_id")?.value;
  const activeMembership = memberships.find((membership) => membership.congregationId === selectedId) ?? memberships[0] ?? null;
  const masterAdmin = isMasterAdmin(user);

  if (!masterAdmin && (!activeMembership || !can(activeMembership, "hierarchy.view"))) redirect("/");

  const visibleMemberships = masterAdmin
    ? memberships
    : memberships.filter((membership) => can(membership, "hierarchy.view"));
  const visibleIds = new Set(visibleMemberships.map((membership) => membership.congregationId));
  const nodes: Node<CongregationNodeData>[] = visibleMemberships.map((membership, index) => ({
    id: membership.congregationId,
    type: "congregation",
    position: { x: (index % 3) * 220, y: Math.floor(index / 3) * 150 },
    data: {
      id: membership.congregationId,
      name: membership.congregation.name,
      parentId: membership.congregation.parentId ?? null,
      active: membership.congregation.active,
    },
  }));
  const edges: Edge[] = visibleMemberships.flatMap((membership) => {
    const parentId = membership.congregation.parentId;
    return parentId && visibleIds.has(parentId)
      ? [{ id: `${parentId}-${membership.congregationId}`, source: parentId, target: membership.congregationId }]
      : [];
  });
  const license = activeMembership ? await getLicense(activeMembership.congregationId) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 20, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ModuleIcon module="canaa-local" variant="icon" size={56} decorative={false} />
        <h1 style={{ margin: 0, fontSize: 32 }}>Canaã Local</h1>
      </div>
      <KhatamQuotaBar license={license} />
      <CongregationFlowMap nodes={nodes} edges={edges} />
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ModuleIcon module="canaa-access" variant="icon" size={28} decorative />
            <h2 style={{ margin: 0, fontSize: 24 }}>Equipe local</h2>
          </div>
          <InviteOperatorModal congregationId={activeMembership?.congregationId ?? null} license={license} />
        </div>
        <LocalTeamManager members={[]} />
      </div>
    </div>
  );
}
