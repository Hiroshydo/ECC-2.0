"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

import { AdminPeopleDirectory } from "@/components/AdminPeopleDirectory";
import { AdminUnitAccessView } from "@/components/AdminUnitAccessView";
import { allPermissions, permissionsForRole, type Role } from "@/domain/access";
import type { OrganizationLevel, OrganizationType } from "@/domain/vocabulary";
import type {
  AdminAssignment,
  AdminOverview,
  AdminOrganization,
  AdminPermission,
  AdminPermissionSet,
  AdminUser,
} from "@/lib/admin/types";
import {
  findDuplicateUnits,
  organizationDisplayLabel,
  ORGANIZATION_LEVEL_LABELS,
  roleOptionsForOrganizationType,
} from "@/lib/admin/unit-access";

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
const allowedParentLevels: Record<OrganizationLevel, OrganizationLevel[]> = {
  national_hq: [],
  state_hq: ["national_hq"],
  sub_hq: ["national_hq", "state_hq"],
  local_congregation: ["national_hq", "state_hq", "sub_hq"],
};

function permissionsFor(role: Role): AdminPermissionSet {
  const defaults = permissionsForRole(role);
  return Object.fromEntries(
    allPermissions.map((permission) => [permission, defaults[permission] ?? false]),
  ) as AdminPermissionSet;
}

async function readApi<T>(response: Response, errorContext = "Falha ao concluir operação"): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${errorContext} (${response.status}): ${errorText}`);
  }
  const result = await response.json() as { data?: T };
  return result.data as T;
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

export function AdminManager({ currentUserId }: { currentUserId: string }) {
  const [activeTab, setActiveTab] = useState<"organizations" | "users">("organizations");
  const [overview, setOverview] = useState<AdminOverview>({ organizations: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [organizationFocusId, setOrganizationFocusId] = useState<string | null>(null);
  const [personFocusId, setPersonFocusId] = useState<string | null>(null);
  const [peopleUnitFocusId, setPeopleUnitFocusId] = useState<string | null>(null);
  const [organization, setOrganization] = useState({
    name: "",
    city: "",
    state: "",
    organizationType: "church" as OrganizationType,
    organizationLevel: "local_congregation" as OrganizationLevel,
    parent_id: null as string | null,
  });
  const [newUser, setNewUser] = useState({ name: "", email: "", congregationId: "", role: "viewer" as Role });
  const [editingOrganization, setEditingOrganization] = useState<AdminOrganization | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [draftAssignments, setDraftAssignments] = useState<AdminAssignment[]>([]);
  const [organizationDraft, setOrganizationDraft] = useState({
    name: "",
    city: "",
    state: "",
    leaderName: "",
    organizationType: "church" as OrganizationType,
    organizationLevel: "local_congregation" as OrganizationLevel,
    parent_id: null as string | null,
    active: true,
  });

  const organizationsById = useMemo(
    () => new Map(overview.organizations.map((unit) => [unit.id, unit])),
    [overview.organizations],
  );
  const excludedEditParentIds = useMemo(
    () => editingOrganization
      ? descendantOrganizationIds(editingOrganization.id, overview.organizations)
      : new Set<string>(),
    [editingOrganization, overview.organizations],
  );
  const availableCreateHeadquarters = overview.organizations.filter((unit) =>
    allowedParentLevels[organization.organizationLevel].includes(unit.organization_level)
      && unit.organization_type === organization.organizationType,
  );
  const availableEditHeadquarters = overview.organizations.filter((unit) =>
    allowedParentLevels[organizationDraft.organizationLevel].includes(unit.organization_level)
      && unit.id !== editingOrganization?.id
      && !excludedEditParentIds.has(unit.id)
      && unit.organization_type === organizationDraft.organizationType,
  );
  const createDuplicates = findDuplicateUnits(organization.name, organization.city, overview.organizations);
  const editDuplicates = findDuplicateUnits(
    organizationDraft.name,
    organizationDraft.city,
    overview.organizations,
    editingOrganization?.id,
  );
  const refreshOverview = async () => {
    const data = await readApi<AdminOverview>(await fetch("/api/admin/overview", { cache: "no-store" }));
    setOverview(data);
    setNewUser((current) => ({ ...current, congregationId: current.congregationId || data.organizations[0]?.id || "" }));
  };

  useEffect(() => {
    let active = true;
    void fetch("/api/admin/overview", { cache: "no-store" })
      .then((response) => readApi<AdminOverview>(response))
      .then((data) => {
        if (!active) return;
        setOverview(data);
        setNewUser((current) => ({ ...current, congregationId: current.congregationId || data.organizations[0]?.id || "" }));
      })
      .catch((loadError: unknown) => {
        if (active) setError(loadError instanceof Error ? loadError.message : "Falha ao carregar a gestão.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!editingOrganization && !editingUser) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (editingOrganization) setEditingOrganization(null);
      else setEditingUser(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [editingOrganization, editingUser]);

  async function createOrganization(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
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
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível cadastrar a unidade.");
    } finally {
      setPending(false);
    }
  }

  async function inviteUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const invited = await readApi<{ id: string; initialPassword: string }>(await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          assignments: newUser.congregationId
            ? [{ congregationId: newUser.congregationId, role: newUser.role, permissions: permissionsFor(newUser.role) }]
            : [],
        }),
      }));
      setNewUser((current) => ({ ...current, name: "", email: "" }));
      setShowUserForm(false);
      setNotice(`Usuário criado. Compartilhe a senha inicial por um canal seguro: ${invited.initialPassword}`);
      await refreshOverview();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível convidar o usuário.");
    } finally {
      setPending(false);
    }
  }

  async function resetUserPassword(user: AdminUser) {
    if (!window.confirm(`Redefinir a senha de ${user.email}? As sessões ativas serão encerradas.`)) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      const result = await readApi<{ temporaryPassword: string }>(await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/password`, {
        method: "POST",
      }), "Falha ao redefinir senha");
      setNotice(`Senha temporária de ${user.email}: ${result.temporaryPassword}. Entregue por um canal seguro.`);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Não foi possível redefinir a senha.");
    } finally {
      setPending(false);
    }
  }

  async function saveOrganizationEdits(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingOrganization) return;
    setPending(true);
    setError(null);
    setNotice(null);
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
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Não foi possível atualizar a unidade.");
    } finally {
      setPending(false);
    }
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
    setDraftAssignments((current) => current.map((assignment) =>
      assignment.congregationId === congregationId ? { ...assignment, ...update } : assignment,
    ));
  }

  function togglePermission(congregationId: string, permission: AdminPermission) {
    setDraftAssignments((current) => current.map((assignment) => {
      if (assignment.congregationId !== congregationId) return assignment;
      const enabled = !assignment.permissions[permission];
      const permissions = { ...assignment.permissions, [permission]: enabled };
      if (permission === "financial.read" && !enabled) {
        for (const key of allPermissions.filter((item) => !item.startsWith("hierarchy."))) permissions[key] = false;
      } else if (permission !== "financial.read" && !permission.startsWith("hierarchy.") && enabled) {
        permissions["financial.read"] = true;
      }
      return { ...assignment, permissions };
    }));
  }

  async function saveAccess() {
    if (!editingUser) return;
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await readApi<{ updated: boolean }>(await fetch(`/api/admin/users/${encodeURIComponent(editingUser.id)}/access`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignments: draftAssignments }),
      }));
      setNotice(`Acessos de ${editingUser.name} atualizados.`);
      setEditingUser(null);
      await refreshOverview();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível atualizar os acessos.");
    } finally {
      setPending(false);
    }
  }

  function openPersonFromUnit(userId: string) {
    setPersonFocusId(userId);
    setPeopleUnitFocusId(null);
    setActiveTab("users");
  }

  function openUnitFromPerson(unitId: string) {
    setOrganizationFocusId(unitId);
    setPersonFocusId(null);
    setPeopleUnitFocusId(null);
    setActiveTab("organizations");
  }

  function manageUnitPeople(unitId: string) {
    setPeopleUnitFocusId(unitId);
    setActiveTab("users");
  }

  function invitePersonToUnit(unitId: string, role?: Role) {
    setNewUser((current) => ({ ...current, congregationId: unitId, role: role ?? current.role }));
    setShowUserForm(true);
    setPeopleUnitFocusId(unitId);
    setActiveTab("users");
  }

  const inviteForm = showUserForm ? (
    <form className="admin-form user-invite-form" onSubmit={inviteUser}>
      <label>Nome<input required value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} /></label>
      <label>E-mail<input required type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} /></label>
      <label>Unidade inicial
        <select value={newUser.congregationId} onChange={(event) => setNewUser({ ...newUser, congregationId: event.target.value })}>
          <option value="">Sem unidade</option>
          {overview.organizations.map((unit) => <option key={unit.id} value={unit.id}>{organizationDisplayLabel(unit, overview.organizations)}</option>)}
        </select>
      </label>
      <label>Perfil inicial
        <select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value as Role })}>
          {roleOptionsForOrganizationType(organizationsById.get(newUser.congregationId)?.organization_type ?? "church").map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      </label>
      <button type="submit" className="admin-primary-button" disabled={pending}>{pending ? "Enviando convite..." : "Convidar pessoa"}</button>
      <p className="admin-form-note">A senha inicial será mostrada após o cadastro. Compartilhe-a por um canal seguro.</p>
    </form>
  ) : null;

  return (
    <section className="admin-page">
      <div className="admin-heading">
        <p className="eyebrow">CONTROLE DA PLATAFORMA</p>
        <h1>Administração</h1>
        <p>Gerencie unidades e pessoas com acesso à plataforma.</p>
      </div>
      <div className="admin-tabs" role="tablist" aria-label="Áreas de administração">
        <button id="admin-units-tab" type="button" role="tab" aria-controls="admin-units-panel" aria-selected={activeTab === "organizations"} className={activeTab === "organizations" ? "is-active" : ""} onClick={() => {
          setPersonFocusId(null);
          setPeopleUnitFocusId(null);
          setActiveTab("organizations");
        }}>Unidades</button>
        <button id="admin-people-tab" type="button" role="tab" aria-controls="admin-people-panel" aria-selected={activeTab === "users"} className={activeTab === "users" ? "is-active" : ""} onClick={() => {
          setOrganizationFocusId(null);
          setPersonFocusId(null);
          setPeopleUnitFocusId(null);
          setActiveTab("users");
        }}>Pessoas</button>
      </div>
      {error && <div className="admin-alert error" role="alert">{error}</div>}
      {notice && <div className="admin-alert success" role="status">{notice}</div>}

      {activeTab === "organizations" && (
        <section id="admin-units-panel" className="admin-section" role="tabpanel" aria-labelledby="admin-units-tab">
          <div className="admin-section-heading">
            <div><h2>Hierarquia de unidades</h2><p>Estrutura de sedes e unidades subordinadas.</p></div>
            <button type="button" className="admin-primary-button" onClick={() => setShowOrganizationForm((visible) => !visible)}>{showOrganizationForm ? "Cancelar" : "+ Nova unidade"}</button>
          </div>
          {showOrganizationForm && (
            <form className="admin-form" onSubmit={createOrganization}>
              <label>Nome<input required value={organization.name} onChange={(event) => setOrganization({ ...organization, name: event.target.value })} /></label>
              <label>Cidade<input required value={organization.city} onChange={(event) => setOrganization({ ...organization, city: event.target.value })} /></label>
              <label>Estado<input required maxLength={2} value={organization.state} onChange={(event) => setOrganization({ ...organization, state: event.target.value.toUpperCase().slice(0, 2) })} /></label>
              <label>Tipo<select value={organization.organizationType} onChange={(event) => setOrganization({ ...organization, organizationType: event.target.value as OrganizationType, parent_id: null })}><option value="church">Igreja</option><option value="ong">ONG</option></select></label>
              <label>Nível Organizacional<select value={organization.organizationLevel} onChange={(event) => setOrganization({ ...organization, organizationLevel: event.target.value as OrganizationLevel, parent_id: null })}>{Object.entries(ORGANIZATION_LEVEL_LABELS).map(([level, label]) => <option key={level} value={level}>{label}</option>)}</select></label>
              <label className="admin-form-wide">Responde a
                <select id="new-unit-parent" disabled={organization.organizationLevel === "national_hq"} required={organization.organizationLevel === "state_hq" || organization.organizationLevel === "sub_hq"} value={organization.parent_id ?? ""} onChange={(event) => setOrganization({ ...organization, parent_id: event.target.value || null })}>
                  <option value="">Nenhuma (Unidade Independente)</option>
                  {availableCreateHeadquarters.map((unit) => <option key={unit.id} value={unit.id}>{organizationDisplayLabel(unit, overview.organizations)}</option>)}
                </select>
                <span className="admin-form-help">Define a qual matriz esta unidade presta contas.</span>
              </label>
              {createDuplicates.length > 0 && (
                <p className="admin-duplicate-warning" role="status">
                  Já existe unidade com este nome e cidade: {createDuplicates.map((unit) => organizationDisplayLabel(unit, overview.organizations)).join("; ")}. Ela será diferenciada pelo nível e identificador curto.
                </p>
              )}
              <button type="submit" className="admin-primary-button" disabled={pending}>{pending ? "Salvando..." : "Cadastrar unidade"}</button>
            </form>
          )}
          {loading
            ? <AdminLoading />
            : (
              <AdminUnitAccessView
                key={organizationFocusId ?? "units"}
                organizations={overview.organizations}
                users={overview.users}
                loading={loading}
                initialUnitId={organizationFocusId}
                onEditUnit={openOrganizationEditor}
                onOpenPerson={openPersonFromUnit}
                onManagePeople={manageUnitPeople}
                onInvitePerson={invitePersonToUnit}
              />
            )}
        </section>
      )}

      {activeTab === "users" && (
        <section id="admin-people-panel" className="admin-section" role="tabpanel" aria-labelledby="admin-people-tab">
          {loading ? <AdminLoading /> : (
            <AdminPeopleDirectory
              key={`${personFocusId ?? "people"}:${peopleUnitFocusId ?? "all"}`}
              organizations={overview.organizations}
              users={overview.users}
              loading={loading}
              currentUserId={currentUserId}
              initialPersonId={personFocusId}
              initialUnitId={peopleUnitFocusId}
              inviteOpen={showUserForm}
              inviteForm={inviteForm}
              onToggleInvite={() => setShowUserForm((visible) => !visible)}
              onOpenAccessEditor={openAccessEditor}
              onResetPassword={resetUserPassword}
              onOpenUnit={openUnitFromPerson}
              onRefreshOverview={refreshOverview}
              onNotify={setNotice}
              onError={setError}
            />
          )}
        </section>
      )}

      {editingOrganization && (
        <div className="admin-modal-backdrop" role="presentation">
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
              <label>Nível organizacional<select value={organizationDraft.organizationLevel} onChange={(event) => setOrganizationDraft({ ...organizationDraft, organizationLevel: event.target.value as OrganizationLevel, parent_id: null })}>{Object.entries(ORGANIZATION_LEVEL_LABELS).map(([level, label]) => <option key={level} value={level}>{label}</option>)}</select></label>
              <label className="admin-form-wide">Responde a
                <select id="edit-unit-parent" disabled={organizationDraft.organizationLevel === "national_hq"} required={organizationDraft.organizationLevel === "state_hq" || organizationDraft.organizationLevel === "sub_hq"} value={organizationDraft.parent_id ?? ""} onChange={(event) => setOrganizationDraft({ ...organizationDraft, parent_id: event.target.value || null })}>
                  <option value="">Nenhuma (Unidade Independente)</option>
                  {availableEditHeadquarters.map((unit) => <option key={unit.id} value={unit.id}>{organizationDisplayLabel(unit, overview.organizations)}</option>)}
                </select>
                <span className="admin-form-help">Unidades subordinadas e a própria unidade não aparecem para evitar ciclos na hierarquia.</span>
              </label>
              {editDuplicates.length > 0 && (
                <p className="admin-duplicate-warning" role="status">
                  Já existe unidade com este nome e cidade: {editDuplicates.map((unit) => organizationDisplayLabel(unit, overview.organizations)).join("; ")}. A identificação na lista incluirá o nível e um código curto.
                </p>
              )}
              <div className="admin-modal-actions">
                <button type="button" className="admin-secondary-button" onClick={() => setEditingOrganization(null)}>Cancelar</button>
                <button type="submit" className="admin-primary-button" disabled={pending}>{pending ? "Salvando..." : "Salvar unidade"}</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {editingUser && (
        <div className="admin-modal-backdrop" role="presentation">
          <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="access-modal-title">
            <div className="admin-modal-heading">
              <div><p className="eyebrow">PERMISSÕES POR UNIDADE</p><h2 id="access-modal-title">Editar acessos</h2><p>{editingUser.name} · {editingUser.email}</p></div>
              <button type="button" className="admin-icon-button" aria-label="Fechar" onClick={() => setEditingUser(null)}>×</button>
            </div>
            <div className="access-unit-list">
              {overview.organizations.map((unit) => {
                const assignment = draftAssignments.find((item) => item.congregationId === unit.id);
                const roleOptions = roleOptionsForOrganizationType(unit.organization_type);
                const visiblePermissions = allPermissions.filter((permission) => permission !== "hierarchy.view" || unit.is_headquarters);
                return (
                  <article className="access-unit" key={unit.id}>
                    <label className="admin-checkbox">
                      <input type="checkbox" checked={Boolean(assignment)} onChange={() => toggleOrganization(unit)} />
                      <span><strong>{organizationDisplayLabel(unit, overview.organizations)}</strong><small>{unit.city} · {organizationTypeLabels[unit.organization_type]}</small></span>
                    </label>
                    {assignment && (
                      <div className="access-unit-controls">
                        <label>Perfil
                          <select value={assignment.role} onChange={(event) => updateAssignment(unit.id, { role: event.target.value as Role })}>
                            {roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                          </select>
                        </label>
                        <div className="permission-grid">
                          {visiblePermissions.map((permission) => (
                            <label className="permission-toggle" key={permission}>
                              <span>{permissionLabels[permission]}</span>
                              <input type="checkbox" checked={assignment.permissions[permission]} onChange={() => togglePermission(unit.id, permission)} />
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="admin-modal-actions">
              <button type="button" className="admin-secondary-button" onClick={() => setEditingUser(null)}>Cancelar</button>
              <button type="button" className="admin-primary-button" disabled={pending} onClick={() => void saveAccess()}>{pending ? "Salvando..." : "Salvar acessos"}</button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function AdminLoading() {
  return <div className="admin-loading" role="status">Carregando dados administrativos...</div>;
}
