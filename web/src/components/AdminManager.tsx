"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Node } from "@xyflow/react";

import { allPermissions, permissionsForRole, type Role } from "@/domain/access";
import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { CongregationFlowMap } from "@/modules/core/canaa/components/CongregationFlowMap";
import type { CongregationNodeData } from "@/modules/core/canaa/types";
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

function permissionsFor(role: Role): AdminPermissionSet {
  const defaults = permissionsForRole(role);
  return Object.fromEntries(allPermissions.map((permission) => [permission, defaults[permission] ?? false])) as AdminPermissionSet;
}

function previewLicenseDate(daysValue: string): string | null {
  const days = Number(daysValue);
  if (!Number.isInteger(days) || days < 1 || days > 3650) return null;
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + days);
  return expiresAt.toLocaleDateString("pt-BR");
}

async function readApi<T>(response: Response, errorContext = "Falha ao concluir operação"): Promise<T> {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${errorContext} (${response.status}): ${errorText}`);
  }
  const result = await response.json() as { data?: T; error?: string };
  return result.data as T;
}

export function AdminManager({ focusOrganizationId }: { focusOrganizationId?: string }) {
  const [activeTab, setActiveTab] = useState<"organizations" | "users">("organizations");
  const [overview, setOverview] = useState<AdminOverview>({ organizations: [], users: [] });
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showOrganizationForm, setShowOrganizationForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [organization, setOrganization] = useState({ name: "", city: "", state: "", organizationType: "church" as OrganizationType, organizationLevel: "local_congregation" as OrganizationLevel, parent_id: null as string | null });
  const [newUser, setNewUser] = useState({ name: "", email: "", congregationId: "", role: "viewer" as Role });
  const [editingOrganization, setEditingOrganization] = useState<AdminOrganization | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editingLicenseId, setEditingLicenseId] = useState<string | null>(null);
  const [licenseDraft, setLicenseDraft] = useState({ days: "30", maxOperators: "5", status: "active" as "active" | "grace_period" | "blocked" });
  const [licensePreviewExpiresAt, setLicensePreviewExpiresAt] = useState<string | null>(null);
  const [draftAssignments, setDraftAssignments] = useState<AdminAssignment[]>([]);
  const [organizationDraft, setOrganizationDraft] = useState({ name: "", city: "", state: "", leaderName: "", organizationType: "church" as OrganizationType, organizationLevel: "local_congregation" as OrganizationLevel, parent_id: null as string | null, active: true });

  const availableCreateHeadquarters = overview.organizations.filter((unit) =>
    allowedParentLevels[organization.organizationLevel].includes(unit.organization_level) && unit.organization_type === organization.organizationType
  );
  const availableEditHeadquarters = overview.organizations.filter((unit) =>
    allowedParentLevels[organizationDraft.organizationLevel].includes(unit.organization_level) && unit.id !== editingOrganization?.id && unit.organization_type === organizationDraft.organizationType
  );
  const organizationNodes: Node<CongregationNodeData>[] = overview.organizations.map((unit) => ({
    id: unit.id,
    type: "congregation",
    position: { x: 0, y: 0 },
    data: {
      id: unit.id,
      name: unit.name,
      parentId: unit.parent_id ?? null,
      parentLabel: unit.parent_id
        ? `Vinculada a ${overview.organizations.find((parent) => parent.id === unit.parent_id)?.name ?? "unidade não disponível"}`
        : "Unidade Raiz",
      active: unit.active,
      organizationType: unit.organization_type,
      city: unit.city,
      state: unit.state,
      leaderName: unit.leader_name,
      licenseStatus: unit.license_status,
      operatorCount: unit.active_operators ?? null,
    },
  }));

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
        const focusedUnit = data.organizations.find((unit) => unit.id === focusOrganizationId);
        if (focusedUnit) {
          setEditingLicenseId(focusedUnit.id);
          setLicenseDraft({
            days: String(focusedUnit.license_cycle_days ?? 30),
            maxOperators: String(focusedUnit.max_operators ?? 5),
            status: focusedUnit.license_status ?? "active",
          });
          setLicensePreviewExpiresAt(previewLicenseDate(String(focusedUnit.license_cycle_days ?? 30)));
        }
      })
      .catch((loadError: unknown) => { if (active) setError(loadError instanceof Error ? loadError.message : "Falha ao carregar a gestão."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [focusOrganizationId]);

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
      const createdUser = await readApi<{ id: string; temporaryPassword: string }>(await fetch("/api/admin/users", {
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
      setNotice(`Usuário criado. Senha temporária (copie e compartilhe por um canal seguro): ${createdUser.temporaryPassword}`);
      await refreshOverview();
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Não foi possível convidar o usuário."); }
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

  function openLicenseEditor(unit: AdminOrganization) {
    setEditingLicenseId((current) => current === unit.id ? null : unit.id);
    setLicenseDraft({
      days: String(unit.license_cycle_days ?? 30),
      maxOperators: String(unit.max_operators ?? 5),
      status: unit.license_status ?? "active",
    });
    setLicensePreviewExpiresAt(previewLicenseDate(String(unit.license_cycle_days ?? 30)));
    setError(null);
  }

  function updateLicenseDays(days: string) {
    setLicenseDraft((current) => ({ ...current, days }));
    setLicensePreviewExpiresAt(previewLicenseDate(days));
  }

  async function saveLicense(event: FormEvent<HTMLFormElement>, unit: AdminOrganization) {
    event.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    try {
      await readApi<{ id: string }>(await fetch(`/api/admin/congregations/${encodeURIComponent(unit.id)}/license`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          days: Number(licenseDraft.days),
          maxOperators: Number(licenseDraft.maxOperators),
          status: licenseDraft.status,
        }),
      }), "Falha ao salvar licença");
      setNotice(`Licença de ${unit.name} atualizada.`);
      setEditingLicenseId(null);
      await refreshOverview();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Não foi possível salvar a licença.");
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
    <div className="admin-heading"><div className="admin-heading__identity"><ModuleIcon module="canaa-access" variant="icon" size={40} decorative /><div><p className="eyebrow">GESTÃO DE UNIDADES, LICENÇAS E ACESSOS</p><h1>Canaã Access</h1><p>Administre a estrutura e os perfis de acesso da plataforma.</p></div></div></div>
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
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5" htmlFor="new-unit-parent">Sede / Matriz Responsável</label>
          <select id="new-unit-parent" disabled={organization.organizationLevel === "national_hq"} required={organization.organizationLevel === "state_hq" || organization.organizationLevel === "sub_hq"} value={organization.parent_id ?? ""} onChange={(event) => setOrganization({ ...organization, parent_id: event.target.value || null })} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
            <option value="">Nenhuma (Unidade Independente)</option>
            {availableCreateHeadquarters.map((headquarters) => <option key={headquarters.id} value={headquarters.id}>{headquarters.name} — {headquarters.city}/{headquarters.state ?? ""}</option>)}
          </select>
          <p className="mt-1 text-xs text-slate-500">Define a qual matriz esta congregação presta contas e responde administrativamente.</p>
        </div>
        <button type="submit" className="admin-primary-button" disabled={pending}>{pending ? "Salvando…" : "Cadastrar unidade"}</button>
      </form>}
      {loading ? <AdminLoading /> : overview.organizations.length ? <>
        <div className="organization-grid">{overview.organizations.map((unit) => {
          const expiresAt = unit.license_expires_at ? new Date(unit.license_expires_at) : null;
          return <article className="organization-card" key={unit.id}>
            <div className="organization-card-top"><span className={`organization-type ${unit.organization_type}`}>{organizationTypeLabels[unit.organization_type]}</span><div className="admin-card-actions"><span className={`organization-status ${unit.active ? "active" : "inactive"}`}>{unit.active ? "Ativa" : "Inativa"}</span><button type="button" className="admin-link-button" onClick={() => openOrganizationEditor(unit)}>Editar</button></div></div>
            <h3>{unit.name}</h3>
            <p>{unit.city}{unit.state ? ` · ${unit.state}` : ""}</p>
            <span className="headquarters-badge">{organizationLevelLabels[unit.organization_level]}</span>
            <div className="organization-license">
              <span>{unit.license_status ? `Licença ${unit.license_status === "grace_period" ? "em carência" : unit.license_status === "blocked" ? "bloqueada" : "ativa"}` : "Licença não configurada"}</span>
              <small>{unit.max_operators !== null && unit.max_operators !== undefined ? `${unit.active_operators ?? 0} de ${unit.max_operators} operadores · ` : ""}{expiresAt && Number.isFinite(expiresAt.getTime()) ? `Vence em ${expiresAt.toLocaleDateString("pt-BR")}` : "Sem vencimento configurado"}</small>
              <button type="button" className="admin-link-button" onClick={() => openLicenseEditor(unit)}>{editingLicenseId === unit.id ? "Fechar licença" : "Configurar licença"}</button>
              {editingLicenseId === unit.id && <form className="license-editor" onSubmit={(event) => void saveLicense(event, unit)}>
                <span className="license-editor__label">Adicionar dias de licença</span>
                <div className="license-editor__quick-days">{[15, 30, 90, 365].map((days) => <button key={days} type="button" className="admin-secondary-button" onClick={() => updateLicenseDays(String(days))}>+{days} dias</button>)}</div>
                <label>Dias<input type="number" min="1" max="3650" required value={licenseDraft.days} onChange={(event) => updateLicenseDays(event.target.value)} /></label>
                <label>Cota máxima de operadores<input type="number" min="0" max="10000" required value={licenseDraft.maxOperators} onChange={(event) => setLicenseDraft((current) => ({ ...current, maxOperators: event.target.value }))} /></label>
                <label>Status<select value={licenseDraft.status} onChange={(event) => setLicenseDraft((current) => ({ ...current, status: event.target.value as typeof current.status }))}><option value="active">Ativa</option><option value="grace_period">Período de carência</option><option value="blocked">Bloqueada</option></select></label>
                <small>Vencimento após salvar: {licensePreviewExpiresAt ?? "Informe os dias"}</small>
                <button type="submit" className="admin-primary-button" disabled={pending}>{pending ? "Salvando..." : "Salvar licença"}</button>
              </form>}
            </div>
          </article>;
        })}</div>
        <div className="admin-global-map"><h3>Visão global da estrutura</h3><CongregationFlowMap nodes={organizationNodes} /></div>
      </> : <div className="admin-empty">Nenhuma unidade cadastrada.</div>}
    </section>}

    {activeTab === "users" && <section className="admin-section" role="tabpanel">
      <div className="admin-section-heading"><div><h2>Usuários &amp; Permissões</h2><p>Convide pessoas e controle seu acesso por unidade.</p></div><button type="button" className="admin-primary-button" onClick={() => setShowUserForm(!showUserForm)}>{showUserForm ? "Cancelar" : "+ Novo usuário"}</button></div>
      {showUserForm && <form className="admin-form user-invite-form" onSubmit={inviteUser}>
        <label>Nome<input required value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} /></label>
        <label>E-mail<input required type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} /></label>
        <label>Unidade inicial<select value={newUser.congregationId} onChange={(event) => setNewUser({ ...newUser, congregationId: event.target.value })}><option value="">Sem unidade</option>{overview.organizations.map((unit) => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</select></label>
        <label>Perfil inicial<select value={newUser.role} onChange={(event) => setNewUser({ ...newUser, role: event.target.value as Role })}>{(newUser.congregationId ? roleOptionsForOrganizationType(overview.organizations.find((unit) => unit.id === newUser.congregationId)?.organization_type ?? "church") : roleOptionsForOrganizationType("church")).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
        <button type="submit" className="admin-primary-button" disabled={pending}>{pending ? "Enviando convite…" : "Enviar convite"}</button>
        <p className="admin-form-note">A pessoa receberá um link para definir a própria senha.</p>
      </form>}
      {loading ? <AdminLoading /> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Usuário</th><th>Perfil</th><th>Unidades</th><th>Acesso</th></tr></thead><tbody>{overview.users.map((user) => <tr key={user.id}><td><div className="admin-user-cell"><span className="admin-avatar">{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><span><strong>{user.name}</strong><small>{user.email || "E-mail não informado"}</small></span></div></td><td>{roleLabels[user.role]}</td><td>{user.assignments.length}</td><td><button type="button" className="admin-link-button" onClick={() => openAccessEditor(user)}>Editar acessos</button></td></tr>)}</tbody></table></div>}
    </section>}

    {editingOrganization && <div className="admin-modal-backdrop" role="presentation">
      <section className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="organization-modal-title">
        <div className="admin-modal-heading">
          <div><p className="eyebrow">UNIDADE</p><h2 id="organization-modal-title">Editar unidade</h2><p>{editingOrganization.name}</p></div>
          <button type="button" className="admin-icon-button" aria-label="Fechar" onClick={() => setEditingOrganization(null)}>×</button>
        </div>
        <form onSubmit={saveOrganizationEdits} className="space-y-4 p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Nome da unidade</label>
              <input required value={organizationDraft.name} onChange={(event) => setOrganizationDraft({ ...organizationDraft, name: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div className="col-span-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Cidade</label>
                <input required value={organizationDraft.city} onChange={(event) => setOrganizationDraft({ ...organizationDraft, city: event.target.value })} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
              <div className="col-span-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">UF</label>
                <input required maxLength={2} value={organizationDraft.state} onChange={(event) => setOrganizationDraft({ ...organizationDraft, state: event.target.value.toUpperCase().slice(0, 2) })} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-center uppercase text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Tipo de Organização</label>
                <select value={organizationDraft.organizationType} onChange={(event) => setOrganizationDraft({ ...organizationDraft, organizationType: event.target.value as OrganizationType, parent_id: null })} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"><option value="church">Igreja</option><option value="ong">ONG</option></select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">Status da Conta</label>
                <select value={organizationDraft.active ? "active" : "inactive"} onChange={(event) => setOrganizationDraft({ ...organizationDraft, active: event.target.value === "active" })} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"><option value="active">Ativa</option><option value="inactive">Inativa</option></select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">{organizationDraft.organizationType === "church" ? "Pastor Titular" : "Diretor / Coordenador"}</label>
              <input value={organizationDraft.leaderName} onChange={(event) => setOrganizationDraft({ ...organizationDraft, leaderName: event.target.value })} placeholder={organizationDraft.organizationType === "church" ? "Nome do pastor titular" : "Nome do responsável"} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5" htmlFor="edit-organization-level">Nível Organizacional</label>
            <select id="edit-organization-level" value={organizationDraft.organizationLevel} onChange={(event) => setOrganizationDraft({ ...organizationDraft, organizationLevel: event.target.value as OrganizationLevel, parent_id: null })} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
              {Object.entries(organizationLevelLabels).map(([level, label]) => <option key={level} value={level}>{label}</option>)}
            </select>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5" htmlFor="edit-unit-parent">Sede / Matriz Responsável</label>
              <select id="edit-unit-parent" disabled={organizationDraft.organizationLevel === "national_hq"} required={organizationDraft.organizationLevel === "state_hq" || organizationDraft.organizationLevel === "sub_hq"} value={organizationDraft.parent_id ?? ""} onChange={(event) => setOrganizationDraft({ ...organizationDraft, parent_id: event.target.value || null })} className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 shadow-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="">Nenhuma (Unidade Independente)</option>
                {availableEditHeadquarters.map((headquarters) => <option key={headquarters.id} value={headquarters.id}>{headquarters.name} — {headquarters.city}/{headquarters.state ?? ""}</option>)}
              </select>
              <p className="mt-1 text-xs text-slate-500">Define a qual matriz esta congregação presta contas e responde administrativamente.</p>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" className="border border-slate-200 px-4 py-2 rounded-lg text-slate-700 hover:bg-slate-50" onClick={() => setEditingOrganization(null)}>Cancelar</button>
            <button type="submit" className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-emerald-700 shadow-sm" disabled={pending}>{pending ? "Salvando…" : "Salvar unidade"}</button>
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