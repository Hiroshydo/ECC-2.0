"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronRight, Search, Users, X } from "lucide-react";

import type { AdminOrganization, AdminUser } from "@/lib/admin/types";
import {
  computeAlertsByUnitId,
  findDuplicateUnits,
  groupMembersByUnit,
  organizationDisplayLabel,
  ORGANIZATION_LEVEL_LABELS,
  ROLE_ORDER,
  roleLabelFor,
  type UnitAlert,
  type UnitMember,
} from "@/lib/admin/unit-access";
import type { Role } from "@/domain/access";
import type { OrganizationType } from "@/domain/vocabulary";

type OrganizationTreeNode = { organization: AdminOrganization; children: OrganizationTreeNode[] };
type OrganizationTypeFilter = OrganizationType | "all";

const ORGANIZATION_TYPE_LABELS: Record<OrganizationType, string> = { church: "Igreja", ong: "ONG" };

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR");
}

function buildOrganizationTree(organizations: AdminOrganization[]): OrganizationTreeNode[] {
  const knownIds = new Set(organizations.map((organization) => organization.id));
  const childrenByParent = new Map<string, AdminOrganization[]>();
  for (const organization of organizations) {
    if (!organization.parent_id || !knownIds.has(organization.parent_id)) continue;
    const children = childrenByParent.get(organization.parent_id) ?? [];
    children.push(organization);
    childrenByParent.set(organization.parent_id, children);
  }
  const included = new Set<string>();
  function build(organization: AdminOrganization, ancestors: Set<string>): OrganizationTreeNode {
    included.add(organization.id);
    const nextAncestors = new Set(ancestors);
    nextAncestors.add(organization.id);
    const children = (childrenByParent.get(organization.id) ?? [])
      .filter((child) => !nextAncestors.has(child.id))
      .map((child) => build(child, nextAncestors));
    return { organization, children };
  }
  const roots = organizations.filter((organization) =>
    !organization.parent_id || !knownIds.has(organization.parent_id),
  );
  const tree = roots.map((organization) => build(organization, new Set()));
  for (const organization of organizations) {
    if (!included.has(organization.id)) tree.push(build(organization, new Set()));
  }
  return tree;
}

function filterOrganizationTree(
  nodes: OrganizationTreeNode[],
  search: string,
  type: OrganizationTypeFilter,
): OrganizationTreeNode[] {
  return nodes.flatMap((node) => {
    const { organization } = node;
    const searchable = normalize(`${organization.name} ${organization.city} ${organization.state ?? ""}`);
    const matchesOwn = (type === "all" || organization.organization_type === type)
      && (!search || searchable.includes(search));
    const children = filterOrganizationTree(node.children, search, type);
    return matchesOwn || children.length ? [{ ...node, children }] : [];
  });
}

function getExpandableIds(nodes: OrganizationTreeNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.children.length ? [node.organization.id] : []),
    ...getExpandableIds(node.children),
  ]);
}

function getDescendantCounts(nodes: OrganizationTreeNode[]): Map<string, number> {
  const result = new Map<string, number>();
  function count(node: OrganizationTreeNode): number {
    let descendants = 0;
    for (const child of node.children) descendants += count(child);
    result.set(node.organization.id, descendants);
    return descendants + (node.organization.organization_level === "local_congregation" ? 1 : 0);
  }
  for (const node of nodes) count(node);
  return result;
}

type Props = {
  organizations: AdminOrganization[];
  users: AdminUser[];
  loading: boolean;
  limitReached: boolean;
  initialUnitId: string | null;
  onEditUnit: (unit: AdminOrganization) => void;
  onOpenPerson: (userId: string) => void;
  onManagePeople: (unitId: string) => void;
  onInvitePerson: (unitId: string, role?: Role) => void;
};

export function AdminUnitAccessView({
  organizations,
  users,
  loading,
  limitReached,
  initialUnitId,
  onEditUnit,
  onOpenPerson,
  onManagePeople,
  onInvitePerson,
}: Props) {
  const [unitSearch, setUnitSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<OrganizationTypeFilter>("all");
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(initialUnitId);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [memberSearch, setMemberSearch] = useState("");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const detailPanelRef = useRef<HTMLElement | null>(null);

  const tree = useMemo(() => buildOrganizationTree(organizations), [organizations]);
  const filteredTree = useMemo(
    () => filterOrganizationTree(tree, normalize(unitSearch), typeFilter),
    [tree, unitSearch, typeFilter],
  );
  const searchExpands = unitSearch.trim().length > 0;
  const visibleExpandedIds = useMemo(
    () => searchExpands ? new Set(getExpandableIds(filteredTree)) : expandedIds,
    [searchExpands, filteredTree, expandedIds],
  );
  const descendantCounts = useMemo(() => getDescendantCounts(tree), [tree]);
  const organizationsById = useMemo(
    () => new Map(organizations.map((organization) => [organization.id, organization])),
    [organizations],
  );
  const membersByUnitId = useMemo(() => groupMembersByUnit(users), [users]);
  const alertsByUnitId = useMemo(
    () => computeAlertsByUnitId(organizations, membersByUnitId),
    [organizations, membersByUnitId],
  );

  const filteredUnitIds = useMemo(() => {
    const ids: string[] = [];
    function visit(nodes: OrganizationTreeNode[]) {
      for (const node of nodes) {
        ids.push(node.organization.id);
        visit(node.children);
      }
    }
    visit(filteredTree);
    return ids;
  }, [filteredTree]);
  const selectedUnit = selectedUnitId ? organizationsById.get(selectedUnitId) ?? null : null;
  const selectedUnitHasDuplicate = selectedUnit
    ? findDuplicateUnits(selectedUnit.name, selectedUnit.city, organizations, selectedUnit.id).length > 0
    : false;
  const selectedMembers = selectedUnit ? membersByUnitId.get(selectedUnit.id) ?? [] : [];
  const selectedAlerts = selectedUnit ? alertsByUnitId.get(selectedUnit.id) ?? [] : [];
  const parentUnit = selectedUnit?.parent_id ? organizationsById.get(selectedUnit.parent_id) ?? null : null;
  const directChildren = selectedUnit ? organizations.filter((unit) => unit.parent_id === selectedUnit.id) : [];
  const isCongregation = selectedUnit?.organization_level === "local_congregation";
  const roleCounts = ROLE_ORDER.map((role) => ({
    role,
    count: selectedMembers.filter((member) => member.assignment.role === role).length,
  }));
  const maxRoleCount = Math.max(1, ...roleCounts.map((entry) => entry.count));
  const visibleMembers = selectedMembers.filter((member) => {
    if (roleFilter && member.assignment.role !== roleFilter) return false;
    const query = normalize(memberSearch);
    return !query || normalize(`${member.user.name} ${member.user.email}`).includes(query);
  });

  function selectUnit(unit: AdminOrganization, trigger: HTMLButtonElement, openMobile = true) {
    openerRef.current = trigger;
    setSelectedUnitId(unit.id);
    setRoleFilter(null);
    setMemberSearch("");
    setMobileDetailOpen(openMobile && window.matchMedia("(max-width: 899px)").matches);
  }

  function closeDetail() {
    setSelectedUnitId(null);
    setMobileDetailOpen(false);
    requestAnimationFrame(() => openerRef.current?.focus());
  }

  useEffect(() => {
    if (!selectedUnitId) return;
    if (mobileDetailOpen) {
      requestAnimationFrame(() => detailPanelRef.current?.querySelector<HTMLButtonElement>(".unit-mobile-back")?.focus());
    }
    function handleKeyDown(event: KeyboardEvent) {
      const otherDialog = document.querySelector('[role="dialog"][aria-modal="true"]:not(.unit-access-detail)');
      if (event.key === "Escape" && !otherDialog) {
        closeDetail();
        return;
      }
      if (event.key !== "Tab" || !mobileDetailOpen || otherDialog) return;
      const focusable = detailPanelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedUnitId, mobileDetailOpen]);

  const unitList = (
    <div className={`unit-access-sidebar${mobileDetailOpen ? " is-hidden-mobile" : ""}`}>
      <div className="unit-access-sidebar-head">
        <div className="unit-access-sidebar-title">
          <div>
            <h2>Unidades</h2>
            <p>{filteredUnitIds.length} de {organizations.length} unidades</p>
          </div>
        </div>
        <label className="unit-search">
          <Search size={16} aria-hidden="true" />
          <span className="sr-only">Buscar unidade por nome, cidade ou UF</span>
          <input type="search" value={unitSearch} placeholder="Buscar unidade..." onChange={(event) => setUnitSearch(event.target.value)} />
          {unitSearch && <button type="button" aria-label="Limpar busca" onClick={() => setUnitSearch("")}><X size={15} aria-hidden="true" /></button>}
        </label>
        <div className="unit-filter-row" aria-label="Filtrar por tipo">
          {(["all", "church", "ong"] as const).map((filter) => (
            <button key={filter} type="button" className={typeFilter === filter ? "is-active" : ""} aria-pressed={typeFilter === filter} onClick={() => setTypeFilter(filter)}>
              {filter === "all" ? "Todas" : ORGANIZATION_TYPE_LABELS[filter]}
            </button>
          ))}
        </div>
        <div className="organization-tree-actions">
          <button type="button" onClick={() => setExpandedIds(new Set(getExpandableIds(filteredTree)))} disabled={!filteredUnitIds.length}>Expandir tudo</button>
          <button type="button" onClick={() => setExpandedIds(new Set())} disabled={searchExpands || !expandedIds.size} title={searchExpands ? "Os resultados da busca permanecem expandidos." : undefined}>Recolher tudo</button>
        </div>
      </div>
      <div className="organization-tree-list" role="tree" aria-label="Hierarquia de unidades">
        {filteredTree.length ? filteredTree.map((node) => (
          <OrganizationTreeItem
            key={node.organization.id}
            node={node}
            depth={0}
            expandedIds={visibleExpandedIds}
            selectedId={selectedUnitId}
            descendantCounts={descendantCounts}
            memberCounts={membersByUnitId}
            organizations={organizations}
            onToggle={(id) => setExpandedIds((current) => {
              const next = new Set(current);
              if (next.has(id)) next.delete(id);
              else next.add(id);
              return next;
            })}
            onSelect={(unit, trigger) => selectUnit(unit, trigger)}
          />
        )) : (
          <div className="unit-access-empty">
            <p>Nenhuma unidade corresponde à busca e aos filtros.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <section className="unit-access-view" aria-label="Unidades e acessos">
      {limitReached && <div className="admin-alert warning" role="status">O diretório de pessoas atingiu o limite retornado pela API; contagens e pendências podem estar incompletas.</div>}
      <div className="unit-access-layout">
        {unitList}
        <section
          ref={detailPanelRef}
          className={`unit-access-detail${selectedUnit ? ` type-${selectedUnit.organization_type}` : ""}${mobileDetailOpen ? " is-open-mobile" : ""}`}
          role={mobileDetailOpen ? "dialog" : undefined}
          aria-modal={mobileDetailOpen ? true : undefined}
          aria-label="Detalhes da unidade"
        >
          {selectedUnit ? (
            <>
              <div className="unit-detail-header">
                <button type="button" className="unit-mobile-back" onClick={closeDetail}><ChevronLeftIcon /> Voltar às unidades</button>
                <div className="unit-detail-heading">
                  <div className="unit-detail-heading-copy">
                    <div className="unit-detail-badges">
                      <span className={`unit-type-badge type-${selectedUnit.organization_type}`}>{ORGANIZATION_TYPE_LABELS[selectedUnit.organization_type]}</span>
                      <span className="unit-level-badge">{ORGANIZATION_LEVEL_LABELS[selectedUnit.organization_level]}</span>
                      <span className={`unit-status-badge${selectedUnit.active ? " is-active" : " is-inactive"}`}>{selectedUnit.active ? "Ativa" : "Inativa"}</span>
                    </div>
                    <h2 id="unit-detail-title">{selectedUnit.name}</h2>
                    {selectedUnitHasDuplicate && <span className="unit-duplicate-identifier">Identificador {selectedUnit.id.slice(0, 6)}</span>}
                    <p>{selectedUnit.city}{selectedUnit.state ? `, ${selectedUnit.state}` : ""}</p>
                    {parentUnit && <p className="unit-parent-link">Responde a: <button type="button" onClick={(event) => selectUnit(parentUnit, event.currentTarget)}>{organizationDisplayLabel(parentUnit, organizations)}</button></p>}
                  </div>
                  <button type="button" className="unit-edit-button" onClick={() => onEditUnit(selectedUnit)}>Editar unidade</button>
                </div>
              </div>

              <div className="unit-overview-grid">
                <div className="unit-overview-card"><span>Pessoas com acesso</span><strong>{selectedMembers.length}</strong></div>
                <div className="unit-overview-card"><span>{isCongregation ? "Unidade responsável" : "Unidades subordinadas"}</span><strong>{isCongregation ? (parentUnit ? "1" : "Nenhuma") : directChildren.length}</strong></div>
              </div>

              {selectedAlerts.length > 0 && (
                <section className="unit-alerts-strip" aria-label="Pendência da unidade">
                  {selectedAlerts.map((alert) => (
                    <UnitAlertRow
                      key={alert.id}
                      alert={alert}
                      onManagePeople={() => onManagePeople(selectedUnit.id)}
                      onInvitePerson={() => onInvitePerson(selectedUnit.id, alert.suggestedRole)}
                      onEditUnit={() => onEditUnit(selectedUnit)}
                    />
                  ))}
                </section>
              )}

              {directChildren.length > 0 && (
                <section className="unit-section-block">
                  <div className="unit-section-head">
                    <div><h3>Unidades subordinadas</h3><p>{directChildren.length} subordinada(s)</p></div>
                  </div>
                  <ul className="unit-subordinate-list">
                    {directChildren.map((child) => (
                      <li key={child.id}>
                        <button type="button" onClick={(event) => selectUnit(child, event.currentTarget)}>
                          <strong>{organizationDisplayLabel(child, organizations)}</strong>
                          <span>{child.active ? "Ativa" : "Inativa"} · {membersByUnitId.get(child.id)?.length ?? 0} pessoas</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section className="unit-section-block">
                <div className="unit-section-head">
                  <div><h3>Distribuição por perfil</h3><p>Selecione um perfil para filtrar as pessoas.</p></div>
                </div>
                <div className="unit-role-bars">
                  {roleCounts.map(({ role, count }) => (
                    <button
                      key={role}
                      type="button"
                      className={`unit-role-bar-row${roleFilter === role ? " is-active" : ""}${count === 0 ? " is-zero" : ""}`}
                      aria-pressed={roleFilter === role}
                      onClick={() => setRoleFilter((current) => current === role ? null : role)}
                    >
                      <span className="unit-role-bar-label">
                        <span className={`unit-role-dot role-${role}`} aria-hidden="true" />
                        <span>{roleLabelFor(role, selectedUnit.organization_type)}</span>
                      </span>
                      <span className="unit-role-bar-track"><span className={`unit-role-bar-fill role-${role}`} style={{ width: `${count ? Math.max(8, (count / maxRoleCount) * 100) : 0}%` }} /></span>
                      <span className="unit-role-bar-stats"><strong>{count}</strong></span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="unit-section-block unit-people-section">
                <div className="unit-people-head">
                  <div><h3><Users size={16} aria-hidden="true" /> Pessoas com acesso</h3><p>{visibleMembers.length} de {selectedMembers.length} pessoa(s)</p></div>
                  <label className="unit-member-search">
                    <Search size={15} aria-hidden="true" />
                    <span className="sr-only">Filtrar pessoas nesta unidade</span>
                    <input type="search" value={memberSearch} placeholder="Filtrar pessoas" onChange={(event) => setMemberSearch(event.target.value)} />
                  </label>
                  <button type="button" className="unit-manage-people-button" onClick={() => onManagePeople(selectedUnit.id)}>Gerenciar pessoas</button>
                </div>
                {visibleMembers.length ? (
                  <ul className="unit-member-list">
                    {visibleMembers.map((member) => (
                      <li key={member.user.id} className="unit-member-card">
                        <button type="button" className="unit-member-link" onClick={() => onOpenPerson(member.user.id)}>
                          <span className="unit-member-avatar" aria-hidden="true">{member.user.name.trim().slice(0, 1).toLocaleUpperCase("pt-BR")}</span>
                          <span className="unit-member-copy"><strong>{member.user.name}</strong><small>{member.user.email}</small></span>
                          <span className={`unit-role-pill role-${member.assignment.role}`}>{roleLabelFor(member.assignment.role, selectedUnit.organization_type)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="unit-access-empty">
                    <p>{selectedMembers.length ? "Nenhuma pessoa corresponde a este filtro." : "Nenhuma pessoa vinculada a esta unidade."}</p>
                  </div>
                )}
              </section>
            </>
          ) : (
            <div className="unit-access-empty-global">
              <div className="unit-access-empty-icon"><Users size={26} aria-hidden="true" /></div>
              <h3>{loading ? "Carregando unidades..." : "Selecione uma unidade"}</h3>
              <p>Escolha uma unidade na hierarquia para ver seus detalhes, pendências e pessoas com acesso.</p>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function UnitAlertRow({
  alert,
  onManagePeople,
  onInvitePerson,
  onEditUnit,
}: {
  alert: UnitAlert;
  onManagePeople: () => void;
  onInvitePerson: () => void;
  onEditUnit: () => void;
}) {
  const isInactiveAlert = alert.id === "inactive-with-access";
  const isNoUsersAlert = alert.id === "no-users";
  return (
    <div className={`unit-alert-item severity-${alert.severity}`}>
      <strong>Pendência</strong>
      <span>{alert.label}</span>
      <button type="button" className="unit-alert-cta" onClick={isInactiveAlert ? onEditUnit : isNoUsersAlert ? onInvitePerson : onManagePeople}>
        {isInactiveAlert ? "Revisar unidade" : isNoUsersAlert ? "Convidar pessoa" : "Revisar acessos"}
      </button>
    </div>
  );
}

function ChevronLeftIcon() {
  return <ChevronRight className="unit-back-chevron" size={16} aria-hidden="true" />;
}

function OrganizationTreeItem({
  node,
  depth,
  expandedIds,
  selectedId,
  descendantCounts,
  memberCounts,
  organizations,
  onToggle,
  onSelect,
}: {
  node: OrganizationTreeNode;
  depth: number;
  expandedIds: Set<string>;
  selectedId: string | null;
  descendantCounts: Map<string, number>;
  memberCounts: Map<string, UnitMember[]>;
  organizations: AdminOrganization[];
  onToggle: (id: string) => void;
  onSelect: (unit: AdminOrganization, trigger: HTMLButtonElement) => void;
}) {
  const { organization, children } = node;
  const expanded = expandedIds.has(organization.id);
  const childrenId = `organization-children-${organization.id}`;
  const localUnit = organization.organization_level === "local_congregation";
  const count = localUnit
    ? `${memberCounts.get(organization.id)?.length ?? 0} pessoas`
    : `${descendantCounts.get(organization.id) ?? 0} congregações`;
  return (
    <div className="organization-tree-item" role="treeitem" aria-expanded={children.length ? expanded : undefined} aria-selected={selectedId === organization.id}>
      <div className={`organization-tree-row${selectedId === organization.id ? " is-selected" : ""}`}>
        <div className="organization-tree-indent" style={{ paddingLeft: `${12 + depth * 20}px` }}>
          {children.length ? (
            <button
              type="button"
              className="organization-tree-chevron"
              aria-label={`${expanded ? "Recolher" : "Expandir"} ${organizationDisplayLabel(organization, organizations)}`}
              aria-expanded={expanded}
              aria-controls={childrenId}
              onClick={() => onToggle(organization.id)}
            >
              {expanded ? <ChevronDown size={17} aria-hidden="true" /> : <ChevronRight size={17} aria-hidden="true" />}
            </button>
          ) : <span className="organization-tree-spacer" aria-hidden="true" />}
          <button
            type="button"
            className="organization-tree-details"
            data-unit-id={organization.id}
            aria-label={`${organizationDisplayLabel(organization, organizations)}, ${organization.active ? "ativa" : "inativa"}. Abrir detalhes`}
            onClick={(event) => onSelect(organization, event.currentTarget)}
          >
            <span className={`organization-tree-type-dot type-${organization.organization_type}`} aria-hidden="true" />
            <span className="organization-tree-copy">
              <strong>{organizationDisplayLabel(organization, organizations)}</strong>
              <small>{organization.active ? "Ativa" : "Inativa"}</small>
            </span>
            <span className="organization-tree-count">{count}</span>
          </button>
        </div>
      </div>
      {children.length > 0 && (
        <div id={childrenId} role="group" hidden={!expanded}>
          {expanded && children.map((child) => (
            <OrganizationTreeItem
              key={child.organization.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              descendantCounts={descendantCounts}
              memberCounts={memberCounts}
              organizations={organizations}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
