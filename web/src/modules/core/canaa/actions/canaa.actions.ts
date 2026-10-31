"use server";

import { randomBytes } from "node:crypto";

import { can, isMasterAdmin, type Role } from "@/domain/access";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { withAdminContext, withAdminTransaction } from "@/lib/db/pool";
import { checkSeat } from "@/modules/core/khatam/services/license.shared";
import { getLicense } from "@/modules/core/khatam/services/license.service";

type ActionResult = { ok: boolean; message: string };
type InviteRole = Extract<Role, "treasurer" | "auditor">;

async function loadActorMemberships() {
  const user = await getCurrentUser();
  if (!user) return { user: null, memberships: [], membershipError: null };
  try {
    return { user, memberships: await getUserMemberships(user), membershipError: null };
  } catch (error) {
    console.error("Canaã membership load failed:", error);
    return { user, memberships: null, membershipError: error instanceof Error ? error.message : "database_error" };
  }
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

  try {
    const updated = await withAdminContext(async (client) => {
      await client.query("lock table public.congregations in share row exclusive mode");
      const { rows } = await client.query<{ id: string; parent_id: string | null }>(
        "select id, parent_id from public.congregations",
      );
      const parentById = new Map(rows.map((row) => [row.id, row.parent_id]));
      if (!parentById.has(childId) || (parentId && !parentById.has(parentId))) {
        return { error: "Congregação não encontrada." };
      }

      const visited = new Set<string>();
      let ancestor = parentId;
      while (ancestor) {
        if (ancestor === childId) return { error: "Esse vínculo criaria um ciclo na hierarquia." };
        if (visited.has(ancestor)) return { error: "Não disponível: a hierarquia existente contém um ciclo." };
        visited.add(ancestor);
        ancestor = parentById.get(ancestor) ?? null;
      }

      const previousParentId = parentById.get(childId) ?? null;
      const result = await client.query(
        "update public.congregations set parent_id = $1 where id = $2",
        [parentId, childId],
      );
      if (!result.rowCount) return { error: "Congregação não encontrada." };

      await client.query(
        `insert into public.audit_events
           (actor_id, congregation_id, action, entity, entity_id, before_data, after_data, reason)
         values ($1, $2, 'updated', 'congregations', $2, $3::jsonb, $4::jsonb, 'congregation_parent_linked')`,
        [user.id, childId, JSON.stringify({ parent_id: previousParentId }), JSON.stringify({ parent_id: parentId })],
      );
      return { error: null };
    });
    if (updated.error) return { ok: false, message: updated.error };
  } catch (error) {
    console.error("Canaã hierarchy update failed:", error);
    return { ok: false, message: `Não foi possível atualizar o vínculo: ${error instanceof Error ? error.message : "erro no banco de dados"}` };
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

  const role: InviteRole = requestedRole;
  const temporaryPassword = randomBytes(32).toString("base64url");
  try {
    await withAdminTransaction(async (client) => {
      const result = await client.query<{ id: string }>(
        `insert into auth.users (
           id, aud, role, email, encrypted_password, email_confirmed_at,
           raw_app_meta_data, raw_user_meta_data, created_at, updated_at
         )
         values (
           gen_random_uuid(), 'authenticated', 'authenticated', $1,
           extensions.crypt($2, extensions.gen_salt('bf')), now(),
           '{"provider":"email","providers":["email"]}'::jsonb, '{}'::jsonb, now(), now()
         )
         returning id`,
        [normalizedEmail, temporaryPassword],
      );
      const invitedId = result.rows[0]?.id;
      if (!invitedId) throw new Error("user_creation_failed");

      await client.query(
        "insert into public.memberships (user_id, congregation_id, role) values ($1, $2, $3)",
        [invitedId, congregationId, role],
      );
      await client.query(
        `insert into public.audit_events
           (actor_id, congregation_id, action, entity, entity_id, after_data, reason)
         values ($1, $2, 'created', 'memberships', $3, $4::jsonb, 'operator_invited')`,
        [user.id, congregationId, invitedId, JSON.stringify({ user_id: invitedId, role })],
      );
      return invitedId;
    });

    return {
      ok: true,
      message: `Operador criado. Senha temporária (compartilhe por um canal seguro): ${temporaryPassword}`,
    };
  } catch (error) {
    console.error("Canaã operator creation failed:", error);
    return { ok: false, message: `Não foi possível criar o acesso: ${error instanceof Error ? error.message : "erro no banco de dados"}` };
  }
}
