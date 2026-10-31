import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

import { query, withUserContext } from "@/lib/db/pool";
import type { Congregation, Membership, MembershipPermissions, Role } from "@/domain/access";
import type { OrganizationType } from "@/domain/vocabulary";

export type AuthenticatedMembership = Membership & { congregation: Congregation };
export type AppUser = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
};

const SESSION_COOKIE = "ecclesia_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

type CongregationRow = { id: string; name: string; city: string; active: boolean; state?: string | null; parent_id?: string | null; organization_type?: OrganizationType; is_headquarters?: boolean };
type PermissionOverrideRow = { financial_read: boolean; financial_write: boolean; financial_approve: boolean; closing_submit: boolean; audit_read: boolean; hierarchy_view?: boolean; hierarchy_financial_read?: boolean };

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("SESSION_SECRET_must_be_at_least_32_characters");
  return secret;
}

function signPayload(payload: string) {
  return createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string) {
  const payload = Buffer.from(JSON.stringify({
    userId,
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  })).toString("base64url");
  return `${payload}.${signPayload(payload)}`;
}

function readSessionUserId(token: string | undefined) {
  if (!token) return null;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expected = Buffer.from(signPayload(payload));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      userId?: unknown;
      expiresAt?: unknown;
    };
    if (typeof session.userId !== "string" || typeof session.expiresAt !== "number") return null;
    if (session.expiresAt <= Math.floor(Date.now() / 1000)) return null;
    return session.userId;
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export async function getCurrentUser(): Promise<AppUser | null> {
  const cookieStore = await cookies();
  const userId = readSessionUserId(cookieStore.get(SESSION_COOKIE)?.value);
  if (!userId) return null;

  const result = await query<{
    id: string;
    email: string | null;
    user_metadata: Record<string, unknown>;
    app_metadata: Record<string, unknown>;
  }>(
    `select id, email,
            coalesce(raw_user_meta_data, '{}'::jsonb) as user_metadata,
            coalesce(raw_app_meta_data, '{}'::jsonb) as app_metadata
       from auth.users
      where id = $1 and deleted_at is null`,
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function getUserMemberships(user: AppUser): Promise<AuthenticatedMembership[]> {
  const rows = await withUserContext(user.id, async (client) => {
    const result = await client.query(
      `select m.congregation_id, m.role,
              to_jsonb(c) as congregations,
              case when po.user_id is null then null else to_jsonb(po) end as permission_overrides
         from public.memberships m
         join public.congregations c on c.id = m.congregation_id
         left join public.membership_permission_overrides po
           on po.user_id = m.user_id and po.congregation_id = m.congregation_id
        where m.user_id = $1`,
      [user.id],
    );
    return result.rows;
  });
  return toMemberships(user, rows);
}

export function toMemberships(user: AppUser, rows: Array<{
  congregation_id: string;
  role: string;
  congregations: CongregationRow | CongregationRow[] | null;
  permission_overrides?: PermissionOverrideRow | PermissionOverrideRow[] | null;
}>): AuthenticatedMembership[] {
  return rows
    .map((row) => ({
      ...row,
      congregation: Array.isArray(row.congregations) ? row.congregations[0] : row.congregations,
      permissionOverride: Array.isArray(row.permission_overrides) ? row.permission_overrides[0] : row.permission_overrides,
    }))
    .filter((row): row is typeof row & { congregation: CongregationRow } => Boolean(row.congregation))
    .map((row) => {
      const permissionOverrides = row.permissionOverride;
      const permissions: MembershipPermissions | undefined = permissionOverrides ? {
        "financial.read": permissionOverrides.financial_read,
        "financial.write": permissionOverrides.financial_write,
        "financial.approve": permissionOverrides.financial_approve,
        "closing.submit": permissionOverrides.closing_submit,
        "audit.read": permissionOverrides.audit_read,
        "hierarchy.view": permissionOverrides.hierarchy_view ?? false,
        "hierarchy.financial.read": permissionOverrides.hierarchy_financial_read ?? false,
      } : undefined;
      return {
        userId: user.id,
        congregationId: row.congregation_id,
        role: row.role as Role,
        permissions,
        congregation: {
          id: row.congregation.id,
          name: row.congregation.name,
          city: row.congregation.city,
          active: row.congregation.active,
          state: row.congregation.state,
          parentId: row.congregation.parent_id ?? null,
          organizationType: row.congregation.organization_type,
          isHeadquarters: row.congregation.is_headquarters,
        },
      };
    });
}