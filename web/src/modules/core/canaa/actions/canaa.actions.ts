"use server";

import { can, isMasterAdmin, type Role } from "@/domain/access";
import { toMemberships } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { checkSeat } from "@/modules/core/khatam/services/license.shared";
import { getLicense } from "@/modules/core/khatam/services/license.service";

type ActionResult = { ok: boolean; message: string };
type InviteRole = Extract<Role, "treasurer" | "auditor">;

async function loadActorMemberships() {
  const sessionClient = await createClient();
  const { data: { user }, error: userError } = await sessionClient.auth.getUser();
  if (userError || !user) return { user: null, memberships: [], membershipError: userError?.message ?? null };

  const { data, error } = await sessionClient
    .from("memberships")
    .select("congregation_id, role, congregations!inner(id, name, city, active, state, parent_id, organization_type, is_headquarters), permission_overrides:membership_permission_overrides(financial_read, financial_write, financial_approve, closing_submit, audit_read, hierarchy_view, hierarchy_financial_read)")
    .eq("user_id", user.id);
  if (error) return { user, memberships: null, membershipError: error.message };

  return {
    user,
    memberships: toMemberships(user, data ?? []),
    membershipError: null,
  };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export async function linkParentAction(childId: string, parentId: string | null): Promise<ActionResult> {
  const { user, memberships, membershipError: membershipQueryError } = await loadActorMemberships();
  if (!user) return { ok: false, message: "Sessão expirada." };
  if (memberships === null) return { ok: false, message: `Não disponível: falha ao consultar memberships (${membershipQueryError ?? "erro desconhecido"}).` };
  if (!isUuid(childId) || (parentId !== null && !isUuid(parentId))) {
    return { ok: false, message: "Identificador de congregação inválido." };
  }
  if (childId === parentId) return { ok: false, message: "Não é possível apontar uma unidade para si mesma." };

  const masterAdmin = isMasterAdmin(user);
  const childMembership = memberships.find((membership) => membership.congregationId === childId);
  const parentMembership = parentId ? memberships.find((membership) => membership.congregationId === parentId) : null;
  if (!masterAdmin && (!childMembership || !can(childMembership, "hierarchy.view") || (parentId && (!parentMembership || !can(parentMembership, "hierarchy.view"))))) {
    return { ok: false, message: "Sem permissão para alterar esta hierarquia." };
  }

  const adminClient = createServiceClient();
  if (!adminClient) return { ok: false, message: "Não disponível: SUPABASE_SERVICE_ROLE_KEY ausente." };

  const { data: congregationRows, error: graphError } = await adminClient
    .from("congregations")
    .select("id, parent_id");
  if (graphError) return { ok: false, message: `Não disponível: não foi possível validar a hierarquia (${graphError.message}).` };

  const parentById = new Map((congregationRows ?? []).map((row) => [row.id, row.parent_id]));
  if (!parentById.has(childId) || (parentId && !parentById.has(parentId))) {
    return { ok: false, message: "Congregação não encontrada." };
  }

  const visited = new Set<string>();
  let ancestor = parentId;
  while (ancestor) {
    if (ancestor === childId) return { ok: false, message: "Esse vínculo criaria um ciclo na hierarquia." };
    if (visited.has(ancestor)) return { ok: false, message: "Não disponível: a hierarquia existente contém um ciclo." };
    visited.add(ancestor);
    ancestor = parentById.get(ancestor) ?? null;
  }

  const previousParentId = parentById.get(childId) ?? null;
  const { error: updateError } = await adminClient
    .from("congregations")
    .update({ parent_id: parentId })
    .eq("id", childId);
  if (updateError) return { ok: false, message: `Não foi possível atualizar o vínculo: ${updateError.message}` };

  const { error: auditError } = await adminClient.from("audit_events").insert({
    actor_id: user.id,
    congregation_id: childId,
    action: "updated",
    entity: "congregations",
    entity_id: childId,
    before_data: { parent_id: previousParentId },
    after_data: { parent_id: parentId },
    reason: "congregation_parent_linked",
  });
  if (auditError) {
    const { error: rollbackError } = await adminClient
      .from("congregations")
      .update({ parent_id: previousParentId })
      .eq("id", childId);
    if (rollbackError) console.error("Canaã hierarchy rollback failed:", rollbackError);
    return { ok: false, message: `Não foi possível registrar a auditoria do vínculo: ${auditError.message}` };
  }

  return { ok: true, message: "Vínculo atualizado e auditado." };
}

export async function inviteOperatorAction(email: string, requestedRole: string, congregationId: string): Promise<ActionResult> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, message: "Informe um e-mail válido." };
  }
  if (requestedRole !== "treasurer" && requestedRole !== "auditor") {
    return { ok: false, message: "Papel inválido. Use Tesoureiro ou Auditor." };
  }
  if (!isUuid(congregationId)) return { ok: false, message: "Congregação ativa inválida." };

  const { user, memberships, membershipError: membershipQueryError } = await loadActorMemberships();
  if (!user) return { ok: false, message: "Sessão expirada." };
  if (memberships === null) return { ok: false, message: `Não disponível: falha ao consultar memberships (${membershipQueryError ?? "erro desconhecido"}).` };

  const masterAdmin = isMasterAdmin(user);
  const activeMembership = memberships.find((membership) => membership.congregationId === congregationId);
  if (!masterAdmin && (!activeMembership || !can(activeMembership, "financial.write"))) {
    return { ok: false, message: "Sem permissão para convidar operadores nesta congregação." };
  }

  const license = await getLicense(congregationId);
  if (!license) return { ok: false, message: "Licença Khatam não configurada." };
  const seatCheck = checkSeat(license);
  if (!seatCheck.allowed) {
    return {
      ok: false,
      message: seatCheck.reason === "quota_exceeded" ? "Cota do Khatam esgotada." : "Licença do Khatam expirada.",
    };
  }

  const adminClient = createServiceClient();
  if (!adminClient) return { ok: false, message: "Não disponível: SUPABASE_SERVICE_ROLE_KEY ausente." };

  const role: InviteRole = requestedRole;
  const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(normalizedEmail);
  if (inviteError) return { ok: false, message: `Não foi possível enviar o convite: ${inviteError.message}` };
  if (!inviteData.user) return { ok: false, message: "Não foi possível obter o usuário convidado." };

  const invitedUserId = inviteData.user.id;
  const { error: membershipError } = await adminClient.from("memberships").insert({
    user_id: invitedUserId,
    congregation_id: congregationId,
    role,
  });
  if (membershipError) {
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(invitedUserId);
    if (deleteError) console.error("Canaã invite cleanup failed:", deleteError);
    return { ok: false, message: `Não foi possível criar o acesso: ${membershipError.message}` };
  }

  const { error: auditError } = await adminClient.from("audit_events").insert({
    actor_id: user.id,
    congregation_id: congregationId,
    action: "created",
    entity: "memberships",
    entity_id: invitedUserId,
    after_data: { user_id: invitedUserId, role },
    reason: "operator_invited",
  });
  if (auditError) {
    const { error: membershipDeleteError } = await adminClient
      .from("memberships")
      .delete()
      .eq("user_id", invitedUserId)
      .eq("congregation_id", congregationId);
    const { error: userDeleteError } = await adminClient.auth.admin.deleteUser(invitedUserId);
    if (membershipDeleteError) console.error("Canaã membership rollback failed:", membershipDeleteError);
    if (userDeleteError) console.error("Canaã invite rollback failed:", userDeleteError);
    return { ok: false, message: `Não foi possível registrar a auditoria do convite: ${auditError.message}` };
  }

  return { ok: true, message: "Operador convidado e acesso auditado." };
}
