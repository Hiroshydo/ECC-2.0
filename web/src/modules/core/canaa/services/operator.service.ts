import "server-only";

import { adminQuery } from "@/lib/db/pool";
import type { Role } from "@/domain/access";
import type { LocalOperator } from "@/modules/core/canaa/types";

export async function getCongregationOperators(congregationId: string): Promise<LocalOperator[]> {
  const result = await adminQuery<{
    id: string;
    name: string | null;
    email: string | null;
    role: Role;
  }>(
    `select membership.user_id as id,
            coalesce(auth_user.raw_user_meta_data ->> 'full_name',
                     auth_user.raw_user_meta_data ->> 'name',
                     auth_user.email,
                     'Usuário') as name,
            auth_user.email,
            membership.role
       from public.memberships membership
       join auth.users auth_user on auth_user.id = membership.user_id
      where membership.congregation_id = $1
        and auth_user.deleted_at is null
      order by name`,
    [congregationId],
  );
  return result.rows.map((operator) => ({
    id: operator.id,
    name: operator.name ?? "Usuário",
    email: operator.email ?? "",
    role: operator.role,
    active: true,
  }));
}

export async function getCongregationOperatorCounts(congregationIds: string[]): Promise<Map<string, number>> {
  if (congregationIds.length === 0) return new Map();
  const result = await adminQuery<{ congregation_id: string; operator_count: number }>(
    `select congregation_id, count(*)::int as operator_count
       from public.memberships
      where congregation_id = any($1::uuid[])
      group by congregation_id`,
    [congregationIds],
  );
  return new Map(result.rows.map((row) => [row.congregation_id, row.operator_count]));
}
