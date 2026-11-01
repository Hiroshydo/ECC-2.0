import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Node } from "@xyflow/react";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { can, isMasterAdmin } from "@/domain/access";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { InviteOperatorModal } from "@/modules/core/canaa/components/InviteOperatorModal";
import { LocalTeamManager } from "@/modules/core/canaa/components/LocalTeamManager";
import { CongregationFlowMap } from "@/modules/core/canaa/components/CongregationFlowMap";
import type { CongregationNodeData } from "@/modules/core/canaa/types";
import { getLicense } from "@/modules/core/khatam/services/license.service";
import { KhatamQuotaBar } from "@/modules/core/khatam/components/KhatamQuotaBar";
import { Section } from "@/modules/core/canaa/components/Section";
import { getCongregationOperatorCounts, getCongregationOperators } from "@/modules/core/canaa/services/operator.service";
import type { LocalOperator } from "@/modules/core/canaa/types";

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
  const membershipById = new Map(visibleMemberships.map((membership) => [membership.congregationId, membership]));
  let rootId = activeMembership?.congregationId ?? null;
  const ancestors = new Set<string>();
  while (rootId) {
    const parentId = membershipById.get(rootId)?.congregation.parentId;
    if (!parentId || !membershipById.has(parentId) || ancestors.has(parentId)) break;
    ancestors.add(rootId);
    rootId = parentId;
  }
  const treeIds = new Set<string>(rootId ? [rootId] : []);
  let added = true;
  while (added) {
    added = false;
    for (const membership of visibleMemberships) {
      if (membership.congregation.parentId && treeIds.has(membership.congregation.parentId) && !treeIds.has(membership.congregationId)) {
        treeIds.add(membership.congregationId);
        added = true;
      }
    }
  }
  const treeMemberships = visibleMemberships.filter((membership) => treeIds.has(membership.congregationId));
  const namesById = new Map(treeMemberships.map((membership) => [membership.congregationId, membership.congregation.name]));
  const licenseEntries = await Promise.all(treeMemberships.map(async (membership) => [
    membership.congregationId,
    await getLicense(membership.congregationId),
  ] as const));
  const licensesById = new Map(licenseEntries);
  let operatorCounts: Map<string, number> | null = null;
  try {
    operatorCounts = await getCongregationOperatorCounts(treeMemberships.map((membership) => membership.congregationId));
  } catch (error) {
    console.error("Canaã operator counts load failed:", error);
  }
  const nodes: Node<CongregationNodeData>[] = treeMemberships.map((membership) => ({
    id: membership.congregationId,
    type: "congregation",
    position: { x: 0, y: 0 },
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
      selected: membership.congregationId === activeMembership?.congregationId,
      organizationType: membership.congregation.organizationType,
      city: membership.congregation.city,
      state: membership.congregation.state,
      leaderName: membership.congregation.leaderName,
      licenseStatus: licensesById.get(membership.congregationId)?.status ?? null,
      operatorCount: operatorCounts?.get(membership.congregationId) ?? (operatorCounts ? 0 : null),
    },
  }));
  const license = activeMembership ? licensesById.get(activeMembership.congregationId) ?? null : null;
  let operators: LocalOperator[] = [];
  let operatorLoadError: string | null = null;
  if (activeMembership) {
    try {
      operators = await getCongregationOperators(activeMembership.congregationId);
    } catch (error) {
      console.error("Canaã operator list load failed:", error);
      operatorLoadError = "Não foi possível carregar a equipe. Verifique a conexão administrativa do banco.";
    }
  }
  const canInvite = masterAdmin || Boolean(activeMembership && can(activeMembership, "financial.write"));

  return (
    <div className="canaa-page">
      <header className="canaa-page__heading">
        <ModuleIcon module="canaa-local" variant="icon" size={40} decorative />
        <div>
          <h1>Gestão de congregações</h1>
          <p>Acessos, licenças e estrutura organizacional.</p>
        </div>
      </header>
      <Section title="Acesso e licença" subtitle="Gerencie a capacidade de acesso de operadores." moduleSeal="khatam">
        <KhatamQuotaBar license={license}>
          {masterAdmin && activeMembership ? <Link className="secondary-button" href={`/admin?organizationId=${encodeURIComponent(activeMembership.congregationId)}`}>Configurar licença no Canaã Access</Link> : null}
        </KhatamQuotaBar>
      </Section>
      <Section title="Estrutura de congregações" subtitle="Visualize a organização hierárquica das unidades." moduleSeal="hiram">
        <CongregationFlowMap nodes={nodes} activeId={activeMembership?.congregationId ?? null} />
      </Section>
      <Section title="Equipe" subtitle="Operadores cadastrados na congregação ativa." moduleSeal="khatam">
        <LocalTeamManager
          members={operators}
          loadError={operatorLoadError}
          inviteAction={canInvite ? <InviteOperatorModal congregationId={activeMembership?.congregationId ?? null} license={license} /> : null}
        />
      </Section>
    </div>
  );
}
