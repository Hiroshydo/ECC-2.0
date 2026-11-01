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

const FLOW_NODE_WIDTH = 248;
const FLOW_COLUMN_WIDTH = 300;
const FLOW_ROW_HEIGHT = 190;
const FLOW_ROOT_Y = 40;

function layoutCongregationNodes(nodes: Node<CongregationNodeData>[]) {
  const nodesById = new Map(nodes.map((node) => [node.id, node]));
  const childrenByParent = new Map<string, Node<CongregationNodeData>[]>();
  const roots: Node<CongregationNodeData>[] = [];

  for (const node of nodes) {
    const parentId = node.data.parentId;
    if (!parentId || !nodesById.has(parentId)) {
      roots.push(node);
      continue;
    }
    const siblings = childrenByParent.get(parentId) ?? [];
    siblings.push(node);
    childrenByParent.set(parentId, siblings);
  }

  roots.sort((left, right) => left.data.name.localeCompare(right.data.name, "pt-BR"));
  for (const children of childrenByParent.values()) {
    children.sort((left, right) => left.data.name.localeCompare(right.data.name, "pt-BR"));
  }

  const subtreeWidth = (nodeId: string, ancestors: Set<string>): number => {
    if (ancestors.has(nodeId)) return FLOW_COLUMN_WIDTH;
    const descendants = childrenByParent.get(nodeId) ?? [];
    if (descendants.length === 0) return FLOW_COLUMN_WIDTH;
    const nextAncestors = new Set(ancestors).add(nodeId);
    return Math.max(
      FLOW_COLUMN_WIDTH,
      descendants.reduce((width, child) => width + subtreeWidth(child.id, nextAncestors), 0),
    );
  };

  const positions = new Map<string, { x: number; y: number }>();
  const placeSubtree = (node: Node<CongregationNodeData>, left: number, depth: number, ancestors: Set<string>) => {
    if (ancestors.has(node.id) || positions.has(node.id)) return;
    const descendants = childrenByParent.get(node.id) ?? [];
    const nextAncestors = new Set(ancestors).add(node.id);
    const width = subtreeWidth(node.id, ancestors);
    positions.set(node.id, {
      x: left + (width - FLOW_NODE_WIDTH) / 2,
      y: FLOW_ROOT_Y + depth * FLOW_ROW_HEIGHT,
    });

    let childLeft = left + (width - descendants.reduce(
      (total, child) => total + subtreeWidth(child.id, nextAncestors),
      0,
    )) / 2;
    for (const child of descendants) {
      const childWidth = subtreeWidth(child.id, nextAncestors);
      placeSubtree(child, childLeft, depth + 1, nextAncestors);
      childLeft += childWidth;
    }
  };

  let rootLeft = 0;
  for (const root of roots) {
    const width = subtreeWidth(root.id, new Set());
    placeSubtree(root, rootLeft, 0, new Set());
    rootLeft += width;
  }

  for (const node of nodes) {
    if (!positions.has(node.id)) {
      const width = subtreeWidth(node.id, new Set());
      placeSubtree(node, rootLeft, 0, new Set());
      rootLeft += width;
    }
  }

  return nodes.map((node) => ({ ...node, position: positions.get(node.id) ?? { x: 0, y: FLOW_ROOT_Y } }));
}

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
  const namesById = new Map(visibleMemberships.map((membership) => [
    membership.congregationId,
    membership.congregation.name,
  ]));
  const nodes: Node<CongregationNodeData>[] = layoutCongregationNodes(visibleMemberships.map((membership) => ({
    id: membership.congregationId,
    type: "congregation",
    position: { x: 0, y: FLOW_ROOT_Y },
    data: {
      id: membership.congregationId,
      name: membership.congregation.name,
      parentId: membership.congregation.parentId ?? null,
      parentLabel: membership.congregation.parentId
        ? namesById.has(membership.congregation.parentId)
          ? `Vinculada a ${namesById.get(membership.congregation.parentId)}`
          : "Vínculo fora do escopo"
        : "Unidade Raiz",
      active: membership.congregation.active,
      organizationType: membership.congregation.organizationType,
    },
  })));
  const edges: Edge[] = visibleMemberships.flatMap((membership) => {
    const parentId = membership.congregation.parentId;
    return parentId && visibleIds.has(parentId)
      ? [{
          id: `${parentId}-${membership.congregationId}`,
          source: parentId,
          target: membership.congregationId,
          type: "smoothstep",
          animated: true,
          style: { stroke: "#10b981", strokeWidth: 2 },
        }]
      : [];
  });
  const license = activeMembership ? await getLicense(activeMembership.congregationId) : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingTop: 20, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <ModuleIcon module="canaa-access" variant="icon" size={48} decorative={false} />
        <div>
          <h1 style={{ margin: 0, fontSize: 32 }}>Canaã Access</h1>
          <p style={{ margin: "4px 0 0", color: "#52645d" }}>Portal de Identidades</p>
        </div>
      </div>
      <KhatamQuotaBar license={license}>
        <InviteOperatorModal congregationId={activeMembership?.congregationId ?? null} license={license} />
      </KhatamQuotaBar>
      <section aria-labelledby="hiram-title" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ModuleIcon module="hiram" variant="icon" size={36} decorative />
          <div>
            <h2 id="hiram-title" style={{ margin: 0, fontSize: 22 }}>Hiram Architecture</h2>
            <p style={{ margin: "3px 0 0", color: "#52645d", fontSize: 13 }}>Topologia Multi-Tenant de Congregações</p>
          </div>
        </div>
        <CongregationFlowMap nodes={nodes} edges={edges} />
      </section>
      <LocalTeamManager members={[]} />
    </div>
  );
}
