"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal, Search, Users, X } from "lucide-react";

import { allPermissions, permissionsForRole, type Role } from "@/domain/access";
import type { AdminAssignment, AdminOrganization, AdminPermission, AdminPermissionSet, AdminUser } from "@/lib/admin/types";
import { MAX_OVERVIEW_USERS, organizationDisplayLabel, ROLE_ORDER, roleLabelFor } from "@/lib/admin/unit-access";

const PAGE_SIZE = 25;

const permissionList = allPermissions as AdminPermission[];

type Props = {
  organizations: AdminOrganization[];
  users: AdminUser[];
  loading: boolean;
  currentUserId: string;
  overviewIsCapped: boolean;
  initialPersonId: string | null;
  initialUnitId: string | null;
  inviteOpen: boolean;
  inviteForm: ReactNode;
  onToggleInvite: () => void;
  onOpenAccessEditor: (user: AdminUser) => void;
  onResetPassword: (user: AdminUser) => Promise<void>;
  onOpenUnit: (unitId: string) => void;
  onRefreshOverview: () => Promise<void>;
  onNotify: (message: string | null) => void;
  onError: (message: string | null) => void;
};

function normalize(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLocaleLowerCase("pt-BR");
}

function permissionsFor(role: Role): AdminPermissionSet {
  const defaults = permissionsForRole(role);
  return Object.fromEntries(permissionList.map((permission) => [permission, defaults[permission] ?? false])) as AdminPermissionSet;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Falha inesperada na operação.";
}

async function assertApiSuccess(response: Response, context: string): Promise<void> {
  if (response.ok) return;
  const detail = await response.text();
  throw new Error(`${context} (${response.status}): ${detail}`);
}

export function AdminPeopleDirectory({
  organizations,
  users,
  loading,
  currentUserId,
  overviewIsCapped,
  initialPersonId,
  initialUnitId,
  inviteOpen,
  inviteForm,
  onToggleInvite,
  onOpenAccessEditor,
  onResetPassword,
  onOpenUnit,
  onRefreshOverview,
  onNotify,
  onError,
}: Props) {
  const [query, setQuery] = useState("");
  const [unitFilter, setUnitFilter] = useState(initialUnitId ?? "all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [accessFilter, setAccessFilter] = useState<"all" | "assigned" | "unassigned">("all");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [personId, setPersonId] = useState<string | null>(initialPersonId);
  const personTriggerRef = useRef<HTMLButtonElement | null>(null);
  const [bulkDialog, setBulkDialog] = useState<"role" | "remove" | null>(null);
  const [bulkUnitId, setBulkUnitId] = useState("");
  const [bulkRole, setBulkRole] = useState<Role>("viewer");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkPasswords, setBulkPasswords] = useState<Array<{ name: string; password: string }>>([]);

  const organizationsById = useMemo(
    () => new Map(organizations.map((organization) => [organization.id, organization])),
    [organizations],
  );
  const normalizedQuery = normalize(query);
  const filteredUsers = useMemo(() => users.filter((user) => {
    const assignments = unitFilter === "all"
      ? user.assignments
      : user.assignments.filter((assignment) => assignment.congregationId === unitFilter);
    if (accessFilter === "assigned" && user.assignments.length === 0) return false;
    if (accessFilter === "unassigned" && user.assignments.length > 0) return false;
    if (unitFilter !== "all" && assignments.length === 0) return false;
    if (roleFilter !== "all" && !assignments.some((assignment) => {
      const organization = organizationsById.get(assignment.congregationId);
      return organization && `${organization.organization_type}:${assignment.role}` === roleFilter;
    })) return false;
    if (!normalizedQuery) return true;
    return normalize(`${user.name} ${user.email}`).includes(normalizedQuery);
  }), [users, unitFilter, accessFilter, roleFilter, normalizedQuery, organizationsById]);

  const pageCount = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const visibleUsers = filteredUsers.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
  const selectedUsers = visibleUsers.filter((user) => selectedIds.has(user.id));
  const selectedPerson = users.find((user) => user.id === personId) ?? null;
  const bulkEligibleUnits = organizations.filter((organization) =>
    selectedUsers.some((user) => user.assignments.some((assignment) => assignment.congregationId === organization.id)),
  );
  const bulkUnit = organizationsById.get(bulkUnitId) ?? null;
  const bulkRemoveCount = bulkUnit
    ? selectedUsers.filter((user) => user.assignments.some((assignment) => assignment.congregationId === bulkUnit.id)).length
    : 0;
  const organizationsTypes = Array.from(new Set(organizations.map((organization) => organization.organization_type)));

  useEffect(() => {
    if (!personId) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || document.querySelector('[role="dialog"][aria-modal="true"]')) return;
      setPersonId(null);
      requestAnimationFrame(() => personTriggerRef.current?.focus());
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [personId]);

  function clearSelection() {
    setSelectedIds(new Set());
  }

  function changeFilters(change: () => void) {
    change();
    setPage(1);
    clearSelection();
    setBulkPasswords([]);
  }

  function setPageAndClear(nextPage: number) {
    setPage(nextPage);
    clearSelection();
  }

  function togglePerson(userId: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  function toggleVisiblePage(checked: boolean) {
    setSelectedIds(checked ? new Set(visibleUsers.map((user) => user.id)) : new Set());
  }

  function openPerson(user: AdminUser, trigger: HTMLButtonElement) {
    personTriggerRef.current = trigger;
    setPersonId(user.id);
  }

  function closePerson() {
    setPersonId(null);
    requestAnimationFrame(() => personTriggerRef.current?.focus());
  }

  function openBulkDialog(kind: "role" | "remove") {
    const availableUnits = kind === "remove" ? bulkEligibleUnits : organizations;
    const preferredUnit = unitFilter !== "all" && availableUnits.some((unit) => unit.id === unitFilter)
      ? unitFilter
      : availableUnits[0]?.id ?? "";
    setBulkUnitId(preferredUnit);
    setBulkRole("viewer");
    setBulkDialog(kind);
    onError(null);
  }

  async function refreshAfterWrites(succeeded: number, failures: string[]) {
    if (succeeded > 0) {
      try {
        await onRefreshOverview();
      } catch (error) {
        failures.push(`As alterações foram gravadas, mas a lista não pôde ser atualizada: ${errorMessage(error)}`);
      }
    }
    if (failures.length) onError(`${succeeded} operação(ões) concluída(s). Falhas: ${failures.join("; ")}`);
    else onNotify(`${succeeded} pessoa(s) atualizada(s).`);
    clearSelection();
    setBulkDialog(null);
  }

  async function submitBulkRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bulkUnit || !selectedUsers.length || bulkSubmitting) return;
    setBulkSubmitting(true);
    onError(null);
    const failures: string[] = [];
    let succeeded = 0;
    try {
      for (const user of selectedUsers) {
        const existing = user.assignments.find((assignment) => assignment.congregationId === bulkUnit.id);
        const nextAssignment: AdminAssignment = existing
          ? { ...existing, role: bulkRole }
          : { congregationId: bulkUnit.id, role: bulkRole, permissions: permissionsFor(bulkRole) };
        const assignments = existing
          ? user.assignments.map((assignment) => assignment.congregationId === bulkUnit.id ? nextAssignment : assignment)
          : [...user.assignments, nextAssignment];
        try {
          const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/access`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignments }),
          });
          await assertApiSuccess(response, `Falha ao atualizar ${user.name}`);
          succeeded += 1;
        } catch (error) {
          failures.push(`${user.name}: ${errorMessage(error)}`);
        }
      }
      await refreshAfterWrites(succeeded, failures);
    } finally {
      setBulkSubmitting(false);
    }
  }

  async function submitBulkRemove(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!bulkUnit || bulkRemoveCount === 0 || bulkSubmitting) return;
    if (!window.confirm(`Remover o vínculo com "${bulkUnit.name}" de ${bulkRemoveCount} pessoa(s)? Os outros vínculos serão mantidos.`)) return;
    setBulkSubmitting(true);
    onError(null);
    const failures: string[] = [];
    let succeeded = 0;
    try {
      for (const user of selectedUsers) {
        const assignments = user.assignments.filter((assignment) => assignment.congregationId !== bulkUnit.id);
        if (assignments.length === user.assignments.length) continue;
        try {
          const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/access`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assignments }),
          });
          await assertApiSuccess(response, `Falha ao remover vínculo de ${user.name}`);
          succeeded += 1;
        } catch (error) {
          failures.push(`${user.name}: ${errorMessage(error)}`);
        }
      }
      await refreshAfterWrites(succeeded, failures);
    } finally {
      setBulkSubmitting(false);
    }
  }

  async function resetSelectedPasswords() {
    if (!selectedUsers.length || bulkSubmitting) return;
    const resetTargets = selectedUsers.filter((user) => user.id !== currentUserId);
    const skippedSelf = resetTargets.length !== selectedUsers.length;
    if (!resetTargets.length) {
      onError("A senha da sessão atual não pode ser redefinida por esta operação.");
      return;
    }
    if (!window.confirm(`Redefinir as senhas de ${resetTargets.length} pessoa(s)? As senhas temporárias serão exibidas após a conclusão.${skippedSelf ? " A sua conta será ignorada." : ""}`)) return;
    setBulkSubmitting(true);
    onError(null);
    setBulkPasswords([]);
    const failures = skippedSelf ? ["Sua própria conta foi ignorada pela regra do servidor."] : [];
    const passwords: Array<{ name: string; password: string }> = [];
    try {
      for (const user of resetTargets) {
        try {
          const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/password`, { method: "POST" });
          await assertApiSuccess(response, `Falha ao redefinir a senha de ${user.name}`);
          const result = await response.json() as { data?: { temporaryPassword?: string } };
          if (!result.data?.temporaryPassword) throw new Error("A API não retornou a senha temporária.");
          passwords.push({ name: user.name, password: result.data.temporaryPassword });
        } catch (error) {
          failures.push(`${user.name}: ${errorMessage(error)}`);
        }
      }
      setBulkPasswords(passwords);
      if (failures.length) onError(`${passwords.length} senha(s) redefinida(s). Falhas: ${failures.join("; ")}`);
      else onNotify(`${passwords.length} senha(s) redefinida(s). Guarde as senhas temporárias exibidas abaixo.`);
      clearSelection();
    } finally {
      setBulkSubmitting(false);
    }
  }

  return (
    <section className="admin-people-view" aria-label="Diretório de pessoas">
      {overviewIsCapped && (
        <div className="admin-alert warning" role="status">
          A API retornou o limite de {MAX_OVERVIEW_USERS.toLocaleString("pt-BR")} pessoas. Este diretório pode estar incompleto.
        </div>
      )}
      <div className="admin-people-layout">
        <section className="admin-people-directory" aria-labelledby="admin-people-heading">
          <div className="admin-section-heading admin-people-heading">
            <div>
              <h2 id="admin-people-heading">Pessoas</h2>
              <p>{filteredUsers.length} pessoa(s)</p>
            </div>
            <label className="admin-search-field">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Buscar pessoa por nome ou e-mail</span>
              <input
                type="search"
                value={query}
                placeholder="Buscar por nome ou e-mail"
                onChange={(event) => changeFilters(() => setQuery(event.target.value))}
              />
            </label>
            <button type="button" className="admin-primary-button" onClick={onToggleInvite}>
              {inviteOpen ? "Cancelar convite" : "+ Nova pessoa"}
            </button>
          </div>
          {inviteForm}
          <div className="admin-people-filters">
            <label>
              Unidade
              <select value={unitFilter} onChange={(event) => changeFilters(() => setUnitFilter(event.target.value))}>
                <option value="all">Todas as unidades</option>
                {organizations.map((organization) => (
                  <option key={organization.id} value={organization.id}>{organizationDisplayLabel(organization, organizations)}</option>
                ))}
              </select>
            </label>
            <label>
              Perfil
              <select value={roleFilter} onChange={(event) => changeFilters(() => setRoleFilter(event.target.value))}>
                <option value="all">Todos os perfis</option>
                {organizationsTypes.flatMap((type) => ROLE_ORDER.map((role) => (
                  <option key={`${type}:${role}`} value={`${type}:${role}`}>
                    {type === "church" ? "Igreja" : "ONG"} · {roleLabelFor(role, type)}
                  </option>
                )))}
              </select>
            </label>
            <label>
              Acesso
              <select
                value={accessFilter}
                onChange={(event) => changeFilters(() => setAccessFilter(event.target.value as "all" | "assigned" | "unassigned"))}
              >
                <option value="all">Todas as situações de acesso</option>
                <option value="assigned">Com unidade</option>
                <option value="unassigned">Sem unidade</option>
              </select>
            </label>
          </div>

          {selectedUsers.length > 0 && (
            <div className="admin-people-bulk" aria-live="polite">
              <span>{selectedUsers.length} selecionada(s) nesta página</span>
              <button type="button" className="secondary-button" onClick={() => openBulkDialog("role")}>Atribuir perfil</button>
              <button type="button" className="secondary-button" onClick={resetSelectedPasswords} disabled={bulkSubmitting}>Redefinir senhas</button>
              <button type="button" className="secondary-button" onClick={() => openBulkDialog("remove")}>Remover vínculo</button>
            </div>
          )}

          <div className="admin-table-wrap admin-people-table-wrap">
            <table className="admin-table admin-people-table">
              <thead>
                <tr>
                  <th scope="col">
                    <input
                      type="checkbox"
                      aria-label="Selecionar pessoas desta página"
                      checked={visibleUsers.length > 0 && visibleUsers.every((user) => selectedIds.has(user.id))}
                      onChange={(event) => toggleVisiblePage(event.target.checked)}
                    />
                  </th>
                  <th scope="col">Pessoa</th>
                  <th scope="col">Unidades e perfis</th>
                  <th scope="col">Acesso</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => (
                  <tr key={user.id} className={personId === user.id ? "is-selected" : undefined}>
                    <td>
                      <input
                        type="checkbox"
                        aria-label={`Selecionar ${user.name}`}
                        checked={selectedIds.has(user.id)}
                        onChange={() => togglePerson(user.id)}
                      />
                    </td>
                    <td>
                      <button
                        ref={personId === user.id ? personTriggerRef : undefined}
                        type="button"
                        className="admin-person-link"
                        onClick={(event) => openPerson(user, event.currentTarget)}
                      >
                        <strong>{user.name}</strong>
                        <span>{user.email}</span>
                      </button>
                    </td>
                    <td>
                      {user.assignments.length === 0 ? <span className="admin-muted">Nenhuma unidade</span> : (
                        <div className="admin-person-role-list">
                          {user.assignments.map((assignment) => {
                            const organization = organizationsById.get(assignment.congregationId);
                            if (!organization) return null;
                            return (
                              <span key={assignment.congregationId}>
                                {roleLabelFor(assignment.role, organization.organization_type)} · {organizationDisplayLabel(organization, organizations)}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td>{user.assignments.length ? "Com unidade" : "Sem unidade"}</td>
                  </tr>
                ))}
                {!loading && visibleUsers.length === 0 && (
                  <tr><td colSpan={4} className="admin-empty-cell">Nenhuma pessoa encontrada com estes filtros.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="admin-people-pagination">
            <span>Página {currentPage} de {pageCount}</span>
            <button type="button" className="admin-icon-button" aria-label="Página anterior" onClick={() => setPageAndClear(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
              <ChevronLeft size={17} aria-hidden="true" />
            </button>
            <button type="button" className="admin-icon-button" aria-label="Próxima página" onClick={() => setPageAndClear(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount}>
              <ChevronRight size={17} aria-hidden="true" />
            </button>
          </div>
          {bulkPasswords.length > 0 && (
            <section className="admin-bulk-passwords" aria-labelledby="admin-bulk-passwords-title">
              <h3 id="admin-bulk-passwords-title">Senhas temporárias</h3>
              <p>Copie e entregue cada senha à pessoa correspondente. Elas não serão exibidas novamente.</p>
              <ul>
                {bulkPasswords.map((item) => <li key={item.name}><strong>{item.name}</strong><code>{item.password}</code></li>)}
              </ul>
            </section>
          )}
        </section>

        <aside className={`admin-person-panel${selectedPerson ? " is-open" : ""}`} aria-label="Detalhes da pessoa" aria-live="polite">
          {selectedPerson ? (
            <>
              <div className="admin-person-panel-heading">
                <div>
                  <p className="eyebrow">PESSOA</p>
                  <h2>{selectedPerson.name}</h2>
                  <p>{selectedPerson.email}</p>
                </div>
                <button type="button" className="admin-icon-button" aria-label={`Fechar detalhes de ${selectedPerson.name}`} onClick={closePerson}>
                  <X size={18} aria-hidden="true" />
                </button>
              </div>
              <div className="admin-person-panel-actions">
                <button type="button" className="primary-button" onClick={() => onOpenAccessEditor(selectedPerson)}>Editar acessos</button>
                <details className="admin-action-menu">
                  <summary aria-label={`Mais ações para ${selectedPerson.name}`}><MoreHorizontal size={19} aria-hidden="true" /></summary>
                  <div className="admin-action-menu-items">
                    <button type="button" disabled={selectedPerson.id === currentUserId} aria-label={selectedPerson.id === currentUserId ? "A senha da sessão atual não pode ser redefinida por aqui" : `Redefinir senha de ${selectedPerson.name}`} onClick={() => void onResetPassword(selectedPerson)}>Redefinir senha</button>
                  </div>
                </details>
              </div>
              <section className="admin-person-access-list">
                <h3><Users size={16} aria-hidden="true" /> Unidades e perfis</h3>
                {selectedPerson.assignments.length ? (
                  <ul>
                    {selectedPerson.assignments.map((assignment) => {
                      const organization = organizationsById.get(assignment.congregationId);
                      if (!organization) return null;
                      return (
                        <li key={assignment.congregationId}>
                          <button type="button" onClick={() => onOpenUnit(organization.id)}>
                            <strong>{organizationDisplayLabel(organization, organizations)}</strong>
                            <span>{roleLabelFor(assignment.role, organization.organization_type)} · {organization.organization_type === "church" ? "Igreja" : "ONG"}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : <p className="admin-muted">Esta pessoa ainda não possui vínculos com unidades.</p>}
              </section>
            </>
          ) : (
            <div className="admin-person-panel-empty">
              <Users size={26} aria-hidden="true" />
              <h3>Selecione uma pessoa</h3>
              <p>O painel mostra os vínculos e permite editar acessos em um único lugar.</p>
            </div>
          )}
        </aside>
      </div>

      {bulkDialog && (
        <div className="admin-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !bulkSubmitting) setBulkDialog(null);
        }}>
          <section className="admin-modal admin-bulk-modal" role="dialog" aria-modal="true" aria-labelledby="admin-bulk-title">
            <div className="admin-modal-header">
              <div>
                <p className="eyebrow">AÇÃO EM MASSA</p>
                <h2 id="admin-bulk-title">{bulkDialog === "role" ? "Atribuir perfil" : "Remover vínculo"}</h2>
              </div>
              <button type="button" className="admin-icon-button" aria-label="Fechar" onClick={() => setBulkDialog(null)} disabled={bulkSubmitting}><X size={18} aria-hidden="true" /></button>
            </div>
            <form onSubmit={bulkDialog === "role" ? submitBulkRole : submitBulkRemove}>
              <p>A operação será aplicada somente às {selectedUsers.length} pessoa(s) selecionada(s) nesta página.</p>
              <label className="admin-field">
                Unidade
                <select value={bulkUnitId} onChange={(event) => setBulkUnitId(event.target.value)} required>
                  {(bulkDialog === "role" ? organizations : bulkEligibleUnits).map((organization) => (
                    <option key={organization.id} value={organization.id}>{organizationDisplayLabel(organization, organizations)}</option>
                  ))}
                </select>
              </label>
              {bulkDialog === "role" && bulkUnit && (
                <label className="admin-field">
                  Perfil para {bulkUnit.organization_type === "church" ? "Igreja" : "ONG"}
                  <select value={bulkRole} onChange={(event) => setBulkRole(event.target.value as Role)}>
                    {ROLE_ORDER.map((role) => <option key={role} value={role}>{roleLabelFor(role, bulkUnit.organization_type)}</option>)}
                  </select>
                  <small>Vínculos existentes mantêm suas permissões personalizadas. Novos vínculos recebem as permissões padrão do perfil.</small>
                </label>
              )}
              {bulkDialog === "remove" && (
                <p className="admin-bulk-warning">{bulkRemoveCount} vínculo(s) serão removidos; os demais vínculos das pessoas serão preservados.</p>
              )}
              <div className="admin-modal-actions">
                <button type="button" className="secondary-button" onClick={() => setBulkDialog(null)} disabled={bulkSubmitting}>Cancelar</button>
                <button type="submit" className="primary-button" disabled={bulkSubmitting || !bulkUnitId || (bulkDialog === "remove" && bulkRemoveCount === 0)}>
                  {bulkSubmitting ? "Processando..." : bulkDialog === "role" ? "Aplicar perfil" : "Remover vínculos"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}
