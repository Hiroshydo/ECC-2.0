"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, Building2, ChevronDown, ChevronRight, Search, X } from "lucide-react";

import { allPermissions, permissionsForRole, type Role } from "@/domain/access";
import type { OrganizationLevel, OrganizationType } from "@/domain/vocabulary";
import type { AdminAssignment, AdminOverview, AdminOrganization, AdminPermission, AdminPermissionSet, AdminUser } from "@/lib/admin/types";

const roleLabels: Record<Role, string> = {
  central_admin: "Administrador central",
  congregation_admin: "Administrador da unidade",
  treasurer: "Tesouraria",
  auditor: "Auditoria",
  viewer: "Visualização",
};

const contextualRoleOptions: Record<OrganizationType, Array<{ value: Role; label: string }>> = {
  church: [
    { value: "central_admin", label: "Pastor" },
    { value: "treasurer", label: "Tesoureiro" },
    { value: "congregation_admin", label: "Secretário" },
    { value: "auditor", label: "Auditor" },
    { value: "viewer", label: "Visualizador" },
  ],
  ong: [
    { value: "central_admin", label: "Diretor Executivo" },
    { value: "treasurer", label: "Gestor Financeiro" },
    { value: "congregation_admin", label: "Coordenador de Projetos" },
    { value: "auditor", label: "Conselho Fiscal / Auditor" },
    { value: "viewer", label: "Visualizador" },
  ],
};

function roleOptionsForOrganizationType(type: OrganizationType) {
  return contextualRoleOptions[type] ?? contextualRoleOptions.church;
}

const permissionLabels: Record<AdminPermission, string> = {
  "financial.read": "Visualização geral",
  "financial.write": "Lançamentos financeiros",
  "financial.approve": "Aprovação de despesas",
  "closing.submit": "Fechamento de caixa",
  "audit.read": "Acesso à auditoria",
  "hierarchy.view": "Visualizar congregações subordinadas",
  "hierarchy.financial.read": "Visualizar Financeiro Consolidado da Rede Subordinada",
};

const organizationTypeLabels: Record<OrganizationType, string> = { church: "Igreja", ong: "ONG" };
const organizationLevelLabels: Record<OrganizationLevel, string> = {
  national_hq: "Sede Nacional",
  state_hq: "Sede Estadual",
  sub_hq: "Sub-Sede / Regional",
  local_congregation: "Congregação Local",
};
const allowedParentLevels: Record<OrganizationLevel, OrganizationLevel[]> = {
  national_hq: [],
  state_hq: ["national_hq"],
  sub_hq: ["national_hq", "state_hq"],
  local_congregation: ["national_hq", "state_hq", "sub_hq"],
};

type OrganizationTreeNode = { organization: AdminOrganization; children: OrganizationTreeNode[] };
type OrganizationTypeFilter = OrganizationType | "all";
type OrganizationExpansion = { filterKey: string; ids: Set<string> };
const MAX_OVERVIEW_USERS = 20_000;

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
    !organization.parent_id || !knownIds.has(organization.parent_id)
  );
  const tree = roots.map((organization) => build(organization, new Set()));
  for (const organization of organizations) {
    if (!included.has(organization.id)) tree.push(build(organization, new Set()));
  }
  return tree;
}

function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").trim();
}

function filterOrganizationTree(
  nodes: OrganizationTreeNode[],
  search: string,
  type: OrganizationTypeFilter,
): OrganizationTreeNode[] {
  return nodes.flatMap((node) => {
    const organization = node.organization;
    const searchText = normalizeSearch([organization.name, organization.city, organization.state ?? ""].join(" "));
    const matchesOwn = (type === "all" || organization.organization_type === type)
      && (!search || searchText.includes(search));
    const children = filterOrganizationTree(node.children, search, type);
    return matchesOwn || children.length ? [{ ...node, children }] : [];
  });
}

function expandableOrganizationIds(nodes: OrganizationTreeNode[]): string[] {
  return nodes.flatMap((node) => [
    ...(node.children.length ? [node.organization.id] : []),
    ...expandableOrganizationIds(node.children),
  ]);
}

function descendantOrganizationIds(organizationId: string, organizations: AdminOrganization[]): Set<string> {
  const childrenByParent = new Map<string, AdminOrganization[]>();
  for (const organization of organizations) {
    if (!organization.parent_id) continue;
    const children = childrenByParent.get(organization.parent_id) ?? [];
    children.push(organization);
    childrenByParent.set(organization.parent_id, children);
  }
  const descendants = new Set<string>();
  const pending = [...(childrenByParent.get(organizationId) ?? [])];
  while (pending.length) {
    const child = pending.pop();
    if (!child || descendants.has(child.id) || child.id === organizationId) continue;
    descendants.add(child.id);
    pending.push(...(childrenByParent.get(child.id) ?? []));
  }
  return descendants;
}

function descendantCongregationCounts(nodes: OrganizationTreeNode[]): Map<string, number> {
  const counts = new Map<string, number>();
  function count(node: OrganizationTreeNode): number {
    let descendants = 0;
    for (const child of node.children) descendants += count(child);
    counts.set(node.organization.id, descendants);
    return descendants + (node.organization.organization_level === "local_congregation" ? 1 : 0);
  }
  for (const node of nodes) count(node);
  return counts;
}

function permissionsFor(role: Role): AdminPermissionSet {
  const defaults = permissionsForRole(role);
  return Object.fromEntries(allPermissions.map((permission) => [permission, defaults[permission] ?? false])) as AdminPermissionSet;
}

async function readApi<T>(response: Response, errorContext = "Falha ao concluir operação"): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${errorContext} (${response.status}): ${errorText}`);
  }
  const result = await response.json() as { data?: T; error?: string };
  return result.data as T;
}

function OrganizationTreeRow({
  node,
  depth,
  expandedIds,
  selectedId,
  congregationCounts,
  userCounts,
  onToggle,
  onOpenDetails,
}: {
  node: OrganizationTreeNode;
  depth: number;
  expandedIds: Set<string>;
  selectedId: string | null;
  congregationCounts: Map<string, number>;
  userCounts: Map<string, number>;
  onToggle: (organizationId: string) => void;
  onOpenDetails: (organization: AdminOrganization, trigger: HTMLButtonElement) => void;
}) {
  const { organization, children } = node;
  const expanded = expandedIds.has(organization.id);
  const childrenId = `organization-children-${organization.id}`;
  const isCongregation = organization.organization_level === "local_congregation";
  const count = isCongregation
    ? `${userCounts.get(organization.id) ?? 0} usuários`
    : `${congregationCounts.get(organization.id) ?? 0} congregações`;

  return (
    <div className="organization-tree-item">
      <div className={`organization-tree-row${selectedId === organization.id ? " is-selected" : ""}`}>
        <div className="organization-tree-indent" style={{ paddingLeft: `${12 + depth * 24}px` }}>
          {children.length ? (
            <button
              type="button"
              className="organization-tree-chevron"
              aria-label={`${expanded ? "Recolher" : "Expandir"} ${organization.name}`}
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
            aria-label={`${organization.name}, ${organization.city}${organization.state ? `, ${organization.state}` : ""}. Abrir detalhes`}
            onClick={(event) => onOpenDetails(organization, event.currentTarget)}
          >
            <span className="organization-tree-name">
              <strong>{organization.name}</strong>
              <small>{organization.city}{organization.state ? ` · ${organization.state}` : ""}</small>
            </span>
            <span className="organization-tree-count">{count}</span>
            <span className={`organization-status ${organization.active ? "active" : "inactive"}`}>
              {organization.active ? "Ativa" : "Inativa"}
            </span>
          </button>
        </div>
      </div>
      {children.length > 0 && (
        <div id={childrenId} hidden={!expanded}>
          {children.map((child) => (
            <OrganizationTreeRow
              key={child.organization.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              selectedId={selectedId}
              congregationCounts={congregationCounts}
              userCounts={userCounts}
              onToggle={onToggle}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminManager() {
  const [activeTab, setActiveTab] = useState<"organizations" | "users">("organizations");
  const [overview, setOverview] = useState<AdminOverview>({ organizations: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [organizationSearch, setOrganizationSearch] = useState("");
  const [organizationTypeFilter, setOrganizationTypeFilter] = useState<OrganizationTypeFilter>("all");
  const [organizationExpansion, setOrganizationExpansion] = useState<OrganizationExpansion>(() => ({ filterKey: "", ids: new Set() }));
  const [organization, setOrganization] = useState({ name: "", city: "", state: "", organizationType: "church" as OrganizationType, organizationLevel: "local_congregation" as OrganizationLevel, parent_id: null as string | null });
  const [newUser, setNewUser] = useState({ name: "", email: "", congregationId: "", role: "viewer" as Role });
  const [editingOrganization, setEditingOrganization] = useState<AdminOrganization | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<AdminOrganization | null>(null);
  const [draftAssignments, setDraftAssignments] = useState<AdminAssignment[]>([]);
  const [organizationDraft, setOrganizationDraft] = useState({ name: "", city: "", state: "", leaderName: "", organizationType: "church" as OrganizationType, organizationLevel: "local_congregation" as OrganizationLevel, parent_id: null as string | null, active: true });
  const drawerOpenerRef = useRef<HTMLButtonElement | null>(null);
  const drawerCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const drawerRef = useRef<HTMLElement | null>(null);

  const organizationTree = useMemo(() => buildOrganizationTree(overview.organizations), [overview.organizations]);
  const normalizedSearch = normalizeSearch(organizationSearch);
  const filteredOrganizationTree = useMemo(
    () => filterOrganizationTree(organizationTree, normalizedSearch, organizationTypeFilter),
    [organizationTree, normalizedSearch, organizationTypeFilter],
  );
  const hasOrganizationFilters = Boolean(normalizedSearch) || organizationTypeFilter !== "all";
  const organizationFilterKey = JSON.stringify([normalizedSearch, organizationTypeFilter]);
  const visibleExpandableIds = useMemo(
    () => expandableOrganizationIds(filteredOrganizationTree),
    [filteredOrganizationTree],
  );
  const expandedOrganizationIds = useMemo(
    () => organizationExpansion.filterKey === organizationFilterKey
      ? organizationExpansion.ids
      : hasOrganizationFilters ? new Set(visibleExpandableIds) : new Set<string>(),
    [organizationExpansion, organizationFilterKey, hasOrganizationFilters, visibleExpandableIds],
  );
  const congregationCounts = useMemo(
    () => descendantCongregationCounts(organizationTree),
    [organizationTree],
  );
  const userCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const user of overview.users) {
      for (const assignment of user.assignments) {
        counts.set(assignment.congregationId, (counts.get(assignment.congregationId) ?? 0) + 1);
      }
    }
    return counts;
  }, [overview.users]);
  const organizationsById = useMemo(
    () => new Map(overview.organizations.map((unit) => [unit.id, unit])),
    [overview.organizations],
  );
  const childrenByParentId = useMemo(() => {
    const children = new Map<string, AdminOrganization[]>();
    for (const unit of overview.organizations) {
      if (!unit.parent_id) continue;
      const current = children.get(unit.parent_id) ?? [];
      current.push(unit);
      children.set(unit.parent_id, current);
    }
    return children;
  }, [overview.organizations]);
  const excludedEditParentIds = useMemo(
    () => editingOrganization
      ? descendantOrganizationIds(editingOrganization.id, overview.organizations)
      : new Set<string>(),
    [editingOrganization, overview.organizations],
  );
  const availableCreateHeadquarters = overview.organizations.filter((unit) =>
    allowedParentLevels[organization.organizationLevel].includes(unit.organization_level) && unit.organization_type === organization.organizationType
  );
  const availableEditHeadquarters = overview.organizations.filter((unit) =>
    allowedParentLevels[organizationDraft.organizationLevel].includes(unit.organization_level)
      && unit.id !== editingOrganization?.id
      && !excludedEditParentIds.has(unit.id)
      && unit.organization_type === organizationDraft.organizationType
  );
  const selectedOrganizationChildren = selectedOrganization
    ? childrenByParentId.get(selectedOrganization.id) ?? []
    : [];
  const selectedOrganizationParent = selectedOrganization?.parent_id
    ? organizationsById.get(selectedOrganization.parent_id) ?? null
    : null;
  const selectedOrganizationIsCongregation = selectedOrganization?.organization_level === "local_congregation";
  const selectedOrganizationCount = selectedOrganization
    ? selectedOrganizationIsCongregation
      ? userCounts.get(selectedOrganization.id) ?? 0
      : congregationCounts.get(selectedOrganization.id) ?? 0
    : 0;

  const closeOrganizationDrawer = useCallback(() => {
    const opener = drawerOpenerRef.current;
    setSelectedOrganization(null);
    if (opener) {
      requestAnimationFrame(() => {
        opener.focus();
        if (drawerOpenerRef.current === opener) drawerOpenerRef.current = null;
      });
    }
  }, []);

  useEffect(() => {
    if (!selectedOrganization) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => drawerCloseButtonRef.current?.focus());
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeOrganizationDrawer();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = drawerRef.current?.querySelectorAll<HTMLElement>(
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
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedOrganization, closeOrganizationDrawer]);

  async function refreshOverview() {
    const data = await readApi<AdminOverview>(await fetch("/api/admin/overview", { cache: "no-store" }));
    setOverview(data);
    setNewUser((current) => ({ ...current, congregationId: current.congregationId || data.organizations[0]?.id || "" }));
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/overview", { cache: "no-store" })
      .then(readApi<AdminOverview>)
      .then((data) => {
        if (!active) return;
        setOverview(data);
        setNewUser((current) => ({ ...current, congregationId: current.congregationId || data.organizations[0]?.id || "" }));
      })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Falha ao carregar a gestão."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError(null); setNotice(null);
    try {
      await readApi<AdminOrganization>(await fetch("/api/admin/congregations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...organization,
          isHeadquarters: organization.organizationLevel !== "local_congregation",
          parent_id: organization.organizationLevel === "national_hq" ? null : organization.parent_id,
        }),
      }));
      setOrganization({ name: "", city: "", state: "", organizationType: "church", organizationLevel: "local_congregation", parent_id: null });
      setShowOrganizationForm(false);
      setNotice("Unidade cadastrada.");
      await refreshOverview();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Não foi possível cadastrar a unidade."); }
    finally { setPending(false); }
  }

  async function inviteUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true); setError(null); setNotice(null);
    try {
      const invited = await readApi<{ id: string; initialPassword: string }>(await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          assignments: newUser.congregationId ? [{ congregationId: newUser.congregationId, role: newUser.role, permissions: permissionsFor(newUser.role) }] : [],
        }),
      }));
      setNewUser((current) => ({ ...current, name: "", email: "" }));
      setShowUserForm(false);
      setNotice(`Usuário criado. Compartilhe a senha inicial por um canal seguro: ${invited.initialPassword}`);
      await refreshOverview();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Não foi possível convidar o usuário."); }
    finally { setPending(false); }
  }

  async function resetUserPassword(user: AdminUser) {
    if (!window.confirm(`Redefinir a senha de ${user.email}? As sessões ativas serão encerradas.`)) return;
    setPending(true); setError(null); setNotice(null);
    try {
      const result = await readApi<{ temporaryPassword: string }>(await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/password`, {
        method: "POST",
      }), "Falha ao redefinir senha");
      setNotice(`Senha temporária de ${user.email}: ${result.temporaryPassword}. Entregue por um canal seguro.`);
    } catch (resetError) { setError(resetError instanceof Error ? resetError.message : "Não foi possível redefinir a senha."); }
    finally { setPending(false); }
  }

  async function saveOrganizationEdits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingOrganization) return;
    setPending(true); setError(null); setNotice(null);
    try {
      await readApi<AdminOrganization>(await fetch(`/api/admin/congregations/${encodeURIComponent(editingOrganization.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: organizationDraft.name,
          city: organizationDraft.city,
          state: organizationDraft.state,
          leader_name: organizationDraft.leaderName,
          organizationType: organizationDraft.organizationType,
          organizationLevel: organizationDraft.organizationLevel,
          isHeadquarters: organizationDraft.organizationLevel !== "local_congregation",
          parent_id: organizationDraft.organizationLevel === "national_hq" ? null : organizationDraft.parent_id,
          active: organizationDraft.active,
        }),
      }), "Falha ao salvar unidade");
      setEditingOrganization(null);
      setNotice("Unidade atualizada com sucesso.");
      await refreshOverview();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Não foi possível atualizar a unidade."); }
    finally { setPending(false); }
  }

  function openOrganizationEditor(unit: AdminOrganization) {
    setEditingOrganization(unit);
    setOrganizationDraft({
      name: unit.name,
      city: unit.city,
      state: unit.state ?? "",
      leaderName: unit.leader_name ?? "",
      organizationType: unit.organization_type,
      organizationLevel: unit.organization_level,
      parent_id: unit.parent_id ?? null,
      active: unit.active,
    });
    setError(null);
  }

  function openOrganizationDetails(unit: AdminOrganization, trigger: HTMLButtonElement) {
    if (!selectedOrganization) drawerOpenerRef.current = trigger;
    setSelectedOrganization(unit);
    if (selectedOrganization) requestAnimationFrame(() => drawerCloseButtonRef.current?.focus());
  }

  function toggleOrganizationExpanded(organizationId: string) {
    setOrganizationExpansion((current) => {
      const currentIds = current.filterKey === organizationFilterKey
        ? current.ids
        : hasOrganizationFilters ? visibleExpandableIds : [];
      const next = new Set(currentIds);
      if (next.has(organizationId)) next.delete(organizationId);
      else next.add(organizationId);
      return { filterKey: organizationFilterKey, ids: next };
    });
  }

  function editSelectedOrganization() {
    if (!selectedOrganization) return;
    openOrganizationEditor(selectedOrganization);
    setSelectedOrganization(null);
    drawerOpenerRef.current = null;
  }

  function openAccessEditor(user: AdminUser) {
    setEditingUser(user);
    setDraftAssignments(user.assignments.map((assignment) => ({ ...assignment, permissions: { ...assignment.permissions } })));
    setError(null);
  }

  function toggleOrganization(unit: AdminOrganization) {
    setDraftAssignments((current) => {
      const existing = current.find((assignment) => assignment.congregationId === unit.id);
      if (existing) return current.filter((assignment) => assignment.congregationId !== unit.id);
      const role = editingUser?.role ?? "viewer";
      return [...current, { congregationId: unit.id, role, permissions: permissionsFor(role) }];
    });
  }

  function updateAssignment(congregationId: string, update: Partial<AdminAssignment>) {
    setDraftAssignments((current) => current.map((assignment) => assignment.congregationId === congregationId ? { ...assignment, ...update } : assignment));
  }

  function togglePermission(congregationId: string, permission: AdminPermission) {
    setDraftAssignments((current) => current.map((assignment) => {
      if (assignment.congregationId !== congregationId) return assignment;
      const enabled = !assignment.permissions[permission];
      const permissions = { ...assignment.permissions, [permission]: enabled };
      if (permission === "financial.read" && !enabled) {
        for (const key of allPermissions.filter((key) => !key.startsWith("hierarchy."))) permissions[key] = false;
      } else if (permission !== "financial.read" && !permission.startsWith("hierarchy.") && enabled) {
        permissions["financial.read"] = true;
      }
      return { ...assignment, permissions };
    }));
  }

  async function saveAccess() {
    if (!editingUser) return;
    setPending(true); setError(null); setNotice(null);
    try {
      await readApi<{ updated: boolean }>(await fetch(`/api/admin/users/${encodeURIComponent(editingUser.id)}/access`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ assignments: draftAssignments }),
      }));
      setNotice(`Acessos de ${editingUser.name} atualizados.`);
      setEditingUser(null);
      await refreshOverview();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : "Não foi possível atualizar os acessos."); }
    finally { setPending(false); }
  }

  return <section className="admin-page">
    <div className="admin-heading admin-heading-tools"><div><p className="eyebrow">CONTROLE DA PLATAFORMA</p><h1>Administração</h1><p>Gerencie unidades, usuários e permissões de acesso.</p></div><div className="admin-dev-shortcuts"><Link href="/noah-ops" className="admin-secondary-button"><Activity size={16} aria-hidden="true"/> Noah Ops</Link><Link href="/canaa" className="admin-secondary-button"><Building2 size={16} aria-hidden="true"/> Gestão da organização</Link></div></div>
    <div className="admin-tabs" role="tablist" aria-label="Áreas de administração">
      <button type="button" role="tab" aria-selected={activeTab === "organizations"} className={activeTab === "organizations" ? "is-active" : ""} onClick={() => setActiveTab("organizations")}>Unidades <span>{overview.organizations.length}</span></button>
      <button type="button" role="tab" aria-selected={activeTab === "users"} className={activeTab === "users" ? "is-active" : ""} onClick={() => setActiveTab("users")}>Usuários <span>{overview.users.length}</span></button>
    </div>
    {error && <div className="admin-alert error" role="alert">{error}</div>}
    {notice && <div className="admin-alert success" role="status">{notice}</div>}

    {activeTab === "organizations" && <section className="admin-section" role="tabpanel">
      <div className="admin-section-heading"><div><h2>Congregações &amp; Unidades</h2><p>Igrejas, projetos e organizações cadastradas.</p></div><button type="button" className="admin-primary-button" onClick={() => setShowOrganizationForm(!showOrganizationForm)}>{showOrganizationForm ? "Cancelar" : "+ Nova unidade"}</button></div>
      {showOrganizationForm && <form className="admin-form" onSubmit={createOrganization}>
        <label>Nome<input required value={organization.name} onChange={(event) => setOrganization({ ...organization, name: event.target.value })} /></label>
        <label>Cidade<input required value={organization.city} onChange={(event) => setOrganization({ ...organization, city: event.target.value })} /></label>
        <label>Estado<input required value={organization.state} onChange={(event) => setOrganization({ ...organization, state: event.target.value })} /></label>
        <label>Tipo<select value={organization.organizationType} onChange={(event) => setOrganization({ ...organization, organizationType: event.target.value as OrganizationType, parent_id: null })}><option value="church">Igreja</option><option value="ong">ONG</option></select></label>
        <label>Nível Organizacional<select value={organization.organizationLevel} onChange={(event) => setOrganization({ ...organization, organizationLevel: event.target.value as OrganizationLevel, parent_id: null })}>{Object.entries(organizationLevelLabels).map(([level, label]) => <option key={level} value={level}>{label}</option>)}</select></label>
        <label className="admin-form-wide">Responde a
          <select id="new-unit-parent" disabled={organization.organizationLevel === "national_hq"} required={organization.organizationLevel === "state_hq" || organization.organizationLevel === "sub_hq"} value={organization.parent_id ?? ""} onChange={(event) => setOrganization({ ...organization, parent_id: event.target.value || null })}>
            <option value="">Nenhuma (Unidade Independente)</option>
            {availableCreateHeadquarters.map((headquarters) => <option key={headquarters.id} value={headquarters.id}>{headquarters.name} — {headquarters.city}/{headquarters.state ?? ""}</option>)}
          </select>
          <span className="admin-form-help">Define a qual matriz esta unidade presta contas.</span>
        </label>
        <button type="submit" className="admin-primary-button" disabled={pending}>{pending ? "Salvando…" : "Cadastrar unidade"}</button>
      </form>}
      {loading ? <AdminLoading /> : overview.organizations.length ? <>
        <div className="organization-list-controls">
          <label className="organization-search">
            <span className="admin-field-label">Buscar unidade</span>
            <span className="organization-search-input"><Search size={16} aria-hidden="true"/><input type="search" value={organizationSearch} onChange={(event) => setOrganizationSearch(event.target.value)} placeholder="Nome, cidade ou UF" /></span>
          </label>
          <label className="organization-type-filter">
            <span className="admin-field-label">Tipo</span>
            <select value={organizationTypeFilter} onChange={(event) => setOrganizationTypeFilter(event.target.value as OrganizationTypeFilter)}>
              <option value="all">Todas</option>
              <option value="church">Igrejas</option>
              <option value="ong">ONGs</option>
            </select>
          </label>
          <div className="organization-tree-actions" role="group" aria-label="Ações da hierarquia">
            <button type="button" className="admin-secondary-button" disabled={!visibleExpandableIds.length} onClick={() => setOrganizationExpansion({ filterKey: organizationFilterKey, ids: new Set(visibleExpandableIds) })}>Expandir tudo</button>
            <button type="button" className="admin-secondary-button" disabled={!expandedOrganizationIds.size} onClick={() => setOrganizationExpansion({ filterKey: organizationFilterKey, ids: new Set() })}>Recolher tudo</button>
          </div>
        </div>
        <section className="organization-tree" aria-label="Lista hierárquica de unidades">
          <div className="organization-tree-header" aria-hidden="true">
            <span>Unidade</span><span className="organization-tree-count">Contagem</span><span>Status</span>
          </div>
          {filteredOrganizationTree.length ? filteredOrganizationTree.map((node) => (
            <OrganizationTreeRow
              key={node.organization.id}
              node={node}
              depth={0}
              expandedIds={expandedOrganizationIds}
              selectedId={selectedOrganization?.id ?? null}
              congregationCounts={congregationCounts}
              userCounts={userCounts}
              onToggle={toggleOrganizationExpanded}
              onOpenDetails={openOrganizationDetails}
            />
          )) : <div className="admin-empty" role="status">Nenhuma unidade corresponde aos filtros.</div>}
        </section>
      </> : <div className="admin-empty">Nenhuma unidade cadastrada.</div>}
    </section>}

    {activeTab === "users" && <section className="admin-section" role="tabpanel">
      <div className="admin-section-heading"><div><h2>Usuários &amp; Permissões</h2><p>Convide pessoas e controle seu acesso por unidade.</p></div><button type="button" className="admin-primary-button" onClick={() => setShowUserForm(!showUserForm)}>{showUserForm ? "Cancelar" : "+ Novo usuário"}</button></div>
      {overview.users.length >= MAX_OVERVIEW_USERS && <div className="admin-alert warning" role="status">A lista atingiu o limite atual de 20.000 usuários da API. Pode haver usuários não exibidos.</div>}
      {showUserForm && <form className="admin-form user-invite-form" onSubmit={inviteUser}>
        <label>Nome<input required value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} /></label>
        <label>E-mail<input required type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} /></label>
        <label>Unidade inicial<select value={newUser.congregationId} onChange={(event) => setNewUser({ ...newUser, congregationId: event.target.value })}><option value="">Sem unidade</option>{overview.organizations.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
        <label>Perfil inicial<select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value as Role })}>{(newUser.congregationId ? roleOptionsForOrganizationType(overview.organizations.find((unit) => unit.id === newUser.congregationId)?.organization_type ?? "church") : roleOptionsForOrganizationType("church")).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <button type="submit" className="admin-primary-button" disabled={pending}>{pending ? "Enviando convite…" : "Enviar convite"}</button>
        <p className="admin-form-note">A senha inicial será mostrada após o cadastro. Compartilhe-a por um canal seguro.</p>
      </form>}
      {loading ? <AdminLoading /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Usuário</th><th>Perfil</th><th>Unidades</th><th>Acesso</th></tr></thead><tbody>{overview.users.map((user) => <tr key={user.id}><td><div className="admin-user-cell"><span className="admin-avatar">{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.email || "E-mail não informado"}</small></span></div></td><td>{roleLabels[user.role]}</td><td>{user.assignments.length}</td><td><div className="flex items-center gap-3"><button type="button" className="admin-link-button" onClick={() => openAccessEditor(user)}>Editar acessos</button><button type="button" className="admin-link-button" disabled={pending || user.id === editingUser?.id} onClick={() => void resetUserPassword(user)}>Redefinir senha</button></div></td></tr>)}</tbody></table></div>}
    </section>}

    {selectedOrganization && <div className="admin-drawer-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeOrganizationDrawer();
    }}>
      <section ref={drawerRef} className="admin-drawer" role="dialog" aria-modal="true" aria-labelledby="organization-drawer-title">
        <header className="admin-drawer-header">
          <div><p className="eyebrow">DETALHES DA UNIDADE</p><h2 id="organization-drawer-title">{selectedOrganization.name}</h2></div>
          <button ref={drawerCloseButtonRef} type="button" className="admin-icon-button" aria-label="Fechar detalhes" onClick={closeOrganizationDrawer}><X size={18} aria-hidden="true"/></button>
        </header>
        <div className="admin-drawer-body">
          <div className="admin-drawer-summary">
            <div className="admin-drawer-badges">
              <span className={`organization-type ${selectedOrganization.organization_type}`}>{organizationTypeLabels[selectedOrganization.organization_type]}</span>
              <span className={`organization-status ${selectedOrganization.active ? "active" : "inactive"}`}>{selectedOrganization.active ? "Ativa" : "Inativa"}</span>
            </div>
            <p>{selectedOrganization.city}{selectedOrganization.state ? ` · ${selectedOrganization.state}` : ""}</p>
          </div>
          <dl className="admin-drawer-details">
            <div><dt>Nível</dt><dd>{organizationLevelLabels[selectedOrganization.organization_level]}</dd></div>
            <div><dt>Status</dt><dd>{selectedOrganization.active ? "Ativa" : "Inativa"}</dd></div>
            <div>
              <dt>{selectedOrganizationIsCongregation ? "Usuários vinculados" : "Congregações subordinadas"}</dt>
              <dd>{selectedOrganizationCount}</dd>
            </div>
            {selectedOrganization.leader_name && <div><dt>Responsável</dt><dd>{selectedOrganization.leader_name}</dd></div>}
          </dl>
          {selectedOrganizationIsCongregation ? (
            <section className="admin-drawer-relations" aria-labelledby="organization-parent-title">
              <h3 id="organization-parent-title">Sede responsável</h3>
              {selectedOrganizationParent ? (
                <button type="button" className="admin-drawer-unit-link" onClick={(event) => openOrganizationDetails(selectedOrganizationParent, event.currentTarget)}>
                  <span><strong>{selectedOrganizationParent.name}</strong><small>{organizationLevelLabels[selectedOrganizationParent.organization_level]}</small></span>
                  <ChevronRight size={17} aria-hidden="true"/>
                </button>
              ) : <p className="admin-drawer-empty">Esta unidade não possui sede responsável.</p>}
            </section>
          ) : (
            <section className="admin-drawer-relations" aria-labelledby="organization-children-title">
              <h3 id="organization-children-title">Unidades subordinadas</h3>
              {selectedOrganizationChildren.length ? selectedOrganizationChildren.map((child) => (
                <button key={child.id} type="button" className="admin-drawer-unit-link" onClick={(event) => openOrganizationDetails(child, event.currentTarget)}>
                  <span><strong>{child.name}</strong><small>{organizationLevelLabels[child.organization_level]} · {child.city}{child.state ? ` · ${child.state}` : ""}</small></span>
                  <ChevronRight size={17} aria-hidden="true"/>
                </button>
              )) : <p className="admin-drawer-empty">Nenhuma unidade subordinada.</p>}
            </section>
          )}
        </div>
        <footer className="admin-drawer-footer">
          <button type="button" className="admin-primary-button" onClick={editSelectedOrganization}>Editar unidade</button>
        </footer>
      </section>
    </div>}

    {editingOrganization && <div className="admin-modal-backdrop" role="presentation">
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="organization-modal-title">
        <div className="admin-modal-heading">
          <div><p className="eyebrow">UNIDADE</p><h2 id="organization-modal-title">Editar unidade</h2><p>{editingOrganization.name}</p></div>
          <button type="button" className="admin-icon-button" aria-label="Fechar" onClick={() => setEditingOrganization(null)}>×</button>
        </div>
        <form onSubmit={saveOrganizationEdits} className="admin-form admin-modal-form">
          <label>Nome da unidade<input required value={organizationDraft.name} onChange={(event) => setOrganizationDraft({ ...organizationDraft, name: event.target.value })} /></label>
          <label>Cidade<input required value={organizationDraft.city} onChange={(event) => setOrganizationDraft({ ...organizationDraft, city: event.target.value })} /></label>
          <label>UF<input required maxLength={2} value={organizationDraft.state} onChange={(event) => setOrganizationDraft({ ...organizationDraft, state: event.target.value.toUpperCase().slice(0, 2) })} /></label>
          <label>Tipo de organização<select value={organizationDraft.organizationType} onChange={(event) => setOrganizationDraft({ ...organizationDraft, organizationType: event.target.value as OrganizationType, parent_id: null })}><option value="church">Igreja</option><option value="ong">ONG</option></select></label>
          <label>Status da conta<select value={organizationDraft.active ? "active" : "inactive"} onChange={(event) => setOrganizationDraft({ ...organizationDraft, active: event.target.value === "active" })}><option value="active">Ativa</option><option value="inactive">Inativa</option></select></label>
          <label>{organizationDraft.organizationType === "church" ? "Pastor titular" : "Diretor / Coordenador"}<input value={organizationDraft.leaderName} onChange={(event) => setOrganizationDraft({ ...organizationDraft, leaderName: event.target.value })} placeholder={organizationDraft.organizationType === "church" ? "Nome do pastor titular" : "Nome do responsável"} /></label>
          <label>Nível organizacional<select value={organizationDraft.organizationLevel} onChange={(event) => setOrganizationDraft({ ...organizationDraft, organizationLevel: event.target.value as OrganizationLevel, parent_id: null })}>{Object.entries(organizationLevelLabels).map(([level, label]) => <option key={level} value={level}>{label}</option>)}</select></label>
          <label className="admin-form-wide">Responde a
            <select id="edit-unit-parent" disabled={organizationDraft.organizationLevel === "national_hq"} required={organizationDraft.organizationLevel === "state_hq" || organizationDraft.organizationLevel === "sub_hq"} value={organizationDraft.parent_id ?? ""} onChange={(event) => setOrganizationDraft({ ...organizationDraft, parent_id: event.target.value || null })}>
              <option value="">Nenhuma (Unidade Independente)</option>
              {availableEditHeadquarters.map((headquarters) => <option key={headquarters.id} value={headquarters.id}>{headquarters.name} — {headquarters.city}/{headquarters.state ?? ""}</option>)}
            </select>
            <span className="admin-form-help">Unidades subordinadas não podem ser selecionadas para evitar ciclos na hierarquia.</span>
          </label>
          <div className="admin-modal-actions">
            <button type="button" className="admin-secondary-button" onClick={() => setEditingOrganization(null)}>Cancelar</button>
            <button type="submit" className="admin-primary-button" disabled={pending}>{pending ? "Salvando…" : "Salvar unidade"}</button>
          </div>
        </form>
      </section>
    </div>}

    {editingUser && <div className="admin-modal-backdrop" role="presentation"><section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="access-modal-title"><div className="admin-modal-heading"><div><p className="eyebrow">PERMISSÕES POR UNIDADE</p><h2 id="access-modal-title">Editar acessos</h2><p>{editingUser.name} · {editingUser.email}</p></div><button type="button" className="admin-icon-button" aria-label="Fechar" onClick={() => setEditingUser(null)}>×</button></div><div className="access-unit-list">{overview.organizations.map((unit) => {
      const assignment = draftAssignments.find((item) => item.congregationId === unit.id);
      const roleOptions = roleOptionsForOrganizationType(unit.organization_type);
      const visiblePermissions = allPermissions.filter((permission) => permission !== "hierarchy.view" || unit.is_headquarters);
      return <article className="access-unit" key={unit.id}><label className="admin-checkbox"><input type="checkbox" checked={Boolean(assignment)} onChange={() => toggleOrganization(unit)} /><span><strong>{unit.name}</strong><small>{unit.city} · {organizationTypeLabels[unit.organization_type]}</small></span></label>{assignment && <div className="access-unit-controls"><label>Perfil<select value={assignment.role} onChange={(event) => updateAssignment(unit.id, { role: event.target.value as Role })}>{roleOptions.map((roleOption) => <option key={roleOption.value} value={roleOption.value}>{roleOption.label}</option>)}</select></label><div className="permission-grid">{visiblePermissions.map((permission) => <label className="permission-toggle" key={permission}><span>{permissionLabels[permission]}</span><input type="checkbox" checked={assignment.permissions[permission]} onChange={() => togglePermission(unit.id, permission)} /></label>)}</div></div>}</article>;
    })}</div><div className="admin-modal-actions"><button type="button" className="admin-secondary-button" onClick={() => setEditingUser(null)}>Cancelar</button><button type="button" className="admin-primary-button" disabled={pending} onClick={saveAccess}>{pending ? "Salvando…" : "Salvar acessos"}</button></div></section></div>}
  </section>;
}

function AdminLoading() { return <div className="admin-loading" role="status">Carregando dados administrativos…</div>; }