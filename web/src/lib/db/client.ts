import "server-only";

import { compare, hash } from "bcryptjs";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { cookies } from "next/headers";

import { getDatabase } from "./sqlite";

export type LocalUser = {
  id: string;
  email: string;
  user_metadata: Record<string, unknown>;
  app_metadata: Record<string, unknown>;
  created_at: string | null;
};

export type DbError = { message: string; code?: string };
interface DbRow { [key: string]: DbValue }
type DbValue = string | number | boolean | null | DbRow | DbRow[] | undefined;
type DbResult<T> = { data: T | null; error: DbError | null; count?: number | null };
type Filter = { column: string; operator: "=" | ">=" | "<=" | "IN" | "IS"; value: unknown };
type Selection = { columns: string[]; relations: Array<{ alias: string; table: string; columns: string[] }> };

type CongregationRow = DbRow & {
  id: string; name: string; city: string; active: boolean; state: string | null;
  parent_id: string | null; organization_type: "church" | "ong";
  organization_level: "national_hq" | "state_hq" | "sub_hq" | "local_congregation";
  is_headquarters: boolean; leader_name: string | null;
};
type PermissionOverrideRow = DbRow & {
  financial_read: boolean; financial_write: boolean; financial_approve: boolean;
  closing_submit: boolean; audit_read: boolean; hierarchy_view?: boolean;
  hierarchy_financial_read?: boolean;
};
type MembershipRow = DbRow & {
  user_id: string; congregation_id: string; role: string;
  congregations: CongregationRow | CongregationRow[] | null;
  permission_overrides?: PermissionOverrideRow | PermissionOverrideRow[] | null;
};
type FinancialRow = DbRow & {
  id: string; congregation_id: string; occurred_on: string; amount_cents: number;
  category: string; created_at: string; status: string; receipt_id: string | null;
};
type TableRows = {
  audit_events: DbRow & { id: string; actor_id: string; congregation_id: string | null; action: string; entity: string; entity_id: string; occurred_at: string; reason: string | null; before_data: DbRow | null; after_data: DbRow | null };
  congregation_monthly_entry_categories: DbRow & { congregation_id: string; reference_period: string; category: string; amount_cents: number };
  congregation_monthly_summary: DbRow & { congregation_id: string; reference_period: string; opening_balance: number; entries: number; expenses: number; transfers: number; adjustments: number; closing_balance: number; closing_status: string | null };
  congregations: CongregationRow;
  documents: DbRow & { id: string; congregation_id: string; entity_type: string; entity_id: string; storage_path: string; file_name: string; content_type: string; uploaded_by: string; created_at: string };
  entries: FinancialRow & { origin: string; payment_method: string; purpose: string | null; recorded_by: string };
  expenses: FinancialRow & { description: string; vendor: string | null; payment_method: string; purpose: string | null; cost_center: string | null; recorded_by: string; approved_at: string | null };
  financial_adjustments: DbRow & { id: string; congregation_id: string; reference_period: string; entity_type: string; entity_id: string; amount_cents: number; reason: string; status: string; created_by: string; created_at: string };
  financial_reversals: DbRow & { id: string; congregation_id: string; reference_period: string; entity_type: string; entity_id: string; amount_cents: number; reason: string; status: string; created_by: string; created_at: string };
  headquarters_transfers: DbRow & { id: string; origin_congregation_id: string; destination_name: string; reference_period: string; amount_requested_cents: number | null; amount_approved_cents: number | null; amount_sent_cents: number | null; amount_received_cents: number | null; occurred_on: string | null; status: string; reason: string; requested_by: string; approved_by: string | null; approved_at: string | null; created_at: string; receipt_id: string | null };
  headquarters_transfer_sends: DbRow & { id: string; transfer_id: string; occurred_on: string; amount_sent_cents: number; method: string; reference: string | null; note: string | null; sent_by: string; idempotency_key: string; created_at: string };
  khatam_licenses: DbRow & { congregation_id: string; seats_total: number; expires_at: string };
  memberships: MembershipRow;
  membership_permission_overrides: PermissionOverrideRow & { user_id: string; congregation_id: string };
  monthly_closings: DbRow & { id: string; congregation_id: string; reference_period: string; opening_balance_cents: number; adjustments_cents: number; status: string; submitted_by: string | null; approved_by: string | null; closed_at: string | null };
  period_reopening_requests: DbRow & { id: string; congregation_id: string; reference_period: string; reason: string; status: string; requested_by: string; approved_by: string | null; requested_at: string; approved_at: string | null };
  physical_cash_movements: DbRow & { id: string; cash_period_id: string; movement_type: string; amount_cents: number; reason: string; created_at: string; idempotency_key: string };
  physical_cash_periods: DbRow & { id: string; cash_register_id: string; reference_period: string; opening_balance_cents: number; status: string; counted_balance_cents: number | null };
  physical_cash_registers: DbRow & { id: string; congregation_id: string; name: string; active: boolean; created_by: string };
};
type TableName = keyof TableRows;

const allowedTables = new Set([
  "audit_events", "congregation_monthly_entry_categories", "congregation_monthly_summary",
  "congregations", "documents", "entries", "expenses", "financial_adjustments",
  "financial_reversals", "headquarters_transfer_sends", "headquarters_transfers", "khatam_licenses", "memberships",
  "membership_permission_overrides", "monthly_closings", "period_reopening_requests",
  "physical_cash_movements", "physical_cash_periods", "physical_cash_registers",
]);

const booleanColumns = new Set([
  "active", "is_headquarters", "is_internal_transfer", "financial_read", "financial_write",
  "financial_approve", "closing_submit", "audit_read", "hierarchy_view", "hierarchy_financial_read",
]);

const defaultPermissions: Record<string, string[]> = {
  central_admin: ["financial.read", "financial.write", "financial.approve", "closing.submit", "audit.read"],
  congregation_admin: ["financial.read", "financial.write", "financial.approve", "closing.submit", "audit.read"],
  treasurer: ["financial.read", "financial.write", "closing.submit", "transfer.send"],
  auditor: ["financial.read", "audit.read"],
  viewer: ["financial.read"],
};

function quoteIdentifier(identifier: string): string {
  if (!/^[a-z_][a-z0-9_]*$/i.test(identifier)) throw new Error("invalid_database_identifier");
  return `"${identifier}"`;
}

function toSqlValue(value: unknown): null | string | number | bigint | Uint8Array {
  if (value === null || value === undefined) return null;
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "string" || typeof value === "number" || typeof value === "bigint") return value;
  if (value instanceof Uint8Array) return value;
  return JSON.stringify(value) ?? null;
}

function jsonValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}

function normalizeRow(row: Record<string, unknown>): DbRow {
  const normalized = { ...row };
  for (const [key, value] of Object.entries(normalized)) {
    if (booleanColumns.has(key) && (value === 0 || value === 1)) normalized[key] = value === 1;
    if (["before_data", "after_data", "user_metadata", "app_metadata", "identity_data"].includes(key)) normalized[key] = jsonValue(value);
  }
  return normalized as DbRow;
}

function splitSelection(selection: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < selection.length; index += 1) {
    if (selection[index] === "(") depth += 1;
    if (selection[index] === ")") depth -= 1;
    if (selection[index] === "," && depth === 0) {
      result.push(selection.slice(start, index).trim());
      start = index + 1;
    }
  }
  if (selection.slice(start).trim()) result.push(selection.slice(start).trim());
  return result;
}

function parseSelection(selection: string): Selection {
  const columns: string[] = [];
  const relations: Selection["relations"] = [];
  for (const token of splitSelection(selection || "*")) {
    const relationStart = token.indexOf("(");
    if (relationStart < 0) {
      const field = token.split(":").at(-1)?.trim();
      if (field && field !== "*") columns.push(field);
      continue;
    }
    const relationName = token.slice(0, relationStart).trim();
    const close = token.lastIndexOf(")");
    if (close < relationStart) throw new Error("invalid_relation_selection");
    const [alias, namedTable] = relationName.includes(":") ? relationName.split(":", 2) : [relationName, relationName];
    const table = namedTable.split("!")[0];
    relations.push({ alias: alias.split("!")[0], table, columns: splitSelection(token.slice(relationStart + 1, close)) });
  }
  return { columns, relations };
}

function filterPermission(userId: string, congregationId: string, permission: string): boolean {
  const db = getDatabase();
  const row = db.prepare(`
    SELECT m.role, o.financial_read, o.financial_write, o.financial_approve,
           o.closing_submit, o.audit_read, o.hierarchy_view, o.hierarchy_financial_read
    FROM memberships m
    LEFT JOIN membership_permission_overrides o
      ON o.user_id = m.user_id AND o.congregation_id = m.congregation_id
    WHERE m.user_id = ? AND m.congregation_id = ?
  `).get(userId, congregationId) as Record<string, unknown> | undefined;
  if (!row) return false;
  const columns: Record<string, string> = {
    "financial.read": "financial_read",
    "financial.write": "financial_write",
    "financial.approve": "financial_approve",
    "closing.submit": "closing_submit",
    "audit.read": "audit_read",
    "hierarchy.view": "hierarchy_view",
    "hierarchy.financial.read": "hierarchy_financial_read",
  };
  const column = columns[permission];
  if (column && row[column] !== null && row[column] !== undefined) {
    if (permission !== "financial.read" && row.financial_read === 0) return false;
    return row[column] === 1;
  }
  return (defaultPermissions[String(row.role)] ?? []).includes(permission);
}

function visibilityClause(table: string, userId: string | null, serviceRole: boolean): { sql: string; values: unknown[] } {
  if (serviceRole) return { sql: "", values: [] };
  if (!userId) return { sql: "0 = 1", values: [] };
  const membershipExists = `EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = ? AND m.congregation_id = `;
  const scopedTables: Record<string, string> = {
    congregations: `EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = ? AND m.congregation_id = congregations.id)`,
    memberships: "memberships.user_id = ?",
    membership_permission_overrides: "membership_permission_overrides.user_id = ?",
    physical_cash_registers: `${membershipExists}physical_cash_registers.congregation_id)`,
    physical_cash_periods: `EXISTS (SELECT 1 FROM physical_cash_registers r JOIN memberships m ON m.congregation_id = r.congregation_id WHERE m.user_id = ? AND r.id = physical_cash_periods.cash_register_id)`,
    physical_cash_movements: `EXISTS (SELECT 1 FROM physical_cash_periods p JOIN physical_cash_registers r ON r.id = p.cash_register_id JOIN memberships m ON m.congregation_id = r.congregation_id WHERE m.user_id = ? AND p.id = physical_cash_movements.cash_period_id)`,
  };
  if (table === "audit_events") {
    return {
      sql: `EXISTS (SELECT 1 FROM memberships m LEFT JOIN membership_permission_overrides o ON o.user_id=m.user_id AND o.congregation_id=m.congregation_id WHERE m.user_id=? AND m.congregation_id=audit_events.congregation_id AND coalesce(o.audit_read, CASE WHEN m.role IN ('central_admin','congregation_admin','auditor') THEN 1 ELSE 0 END)=1)`,
      values: [userId],
    };
  }
  if (table === "headquarters_transfer_sends") {
    return {
      sql: "EXISTS (SELECT 1 FROM headquarters_transfers t JOIN memberships m ON m.congregation_id=t.origin_congregation_id LEFT JOIN membership_permission_overrides o ON o.user_id=m.user_id AND o.congregation_id=m.congregation_id WHERE m.user_id=? AND t.id=headquarters_transfer_sends.transfer_id AND coalesce(o.financial_read, 1)=1)",
      values: [userId],
    };
  }
  const column = table === "headquarters_transfers" ? "origin_congregation_id" : "congregation_id";
  return {
    sql: scopedTables[table] ?? `${membershipExists}${quoteIdentifier(table)}.${quoteIdentifier(column)})`,
    values: [userId],
  };
}

function relatedRows(table: string, relation: string, row: DbRow, columns: string[]): DbValue {
  if (table !== "memberships") return null;
  const db = getDatabase();
  const selection = columns.includes("*") ? "*" : columns.map((column) => quoteIdentifier(column.split(":").at(-1) ?? column)).join(", ");
  let related: Record<string, unknown> | undefined;
  if (relation === "congregations") {
    related = db.prepare(`SELECT ${selection} FROM congregations WHERE id = ?`).get(toSqlValue(row.congregation_id)) as Record<string, unknown> | undefined;
  } else if (relation === "membership_permission_overrides") {
    related = db.prepare(`SELECT ${selection} FROM membership_permission_overrides WHERE user_id = ? AND congregation_id = ?`).get(toSqlValue(row.user_id), toSqlValue(row.congregation_id)) as Record<string, unknown> | undefined;
  }
  return related ? normalizeRow(related) : null;
}

export class LocalQuery<Row extends DbRow, Output = Row[]> implements PromiseLike<DbResult<Output>> {
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private selection = "*";
  private payload: Record<string, unknown> | Record<string, unknown>[] | null = null;
  private filters: Filter[] = [];
  private orders: Array<{ column: string; ascending: boolean }> = [];
  private maxRows: number | null = null;
  private rowOffset = 0;
  private resultMode: "many" | "single" | "maybeSingle" = "many";
  private countRequested = false;
  private headOnly = false;
  private returnRows = false;

  constructor(private readonly table: string, private readonly userId: string | null, private readonly serviceRole: boolean) {
    if (!allowedTables.has(table)) throw new Error("database_table_not_allowed");
  }

  select(selection = "*", options?: { count?: string; head?: boolean }): this {
    this.selection = selection;
    this.returnRows = this.operation !== "select";
    this.countRequested = options?.count === "exact";
    this.headOnly = options?.head === true;
    return this;
  }

  eq(column: string, value: unknown): this { return this.addFilter(column, "=", value); }
  gte(column: string, value: unknown): this { return this.addFilter(column, ">=", value); }
  lte(column: string, value: unknown): this { return this.addFilter(column, "<=", value); }
  is(column: string, value: unknown): this { return this.addFilter(column, "IS", value); }
  in(column: string, value: unknown[]): this { return this.addFilter(column, "IN", value); }
  order(column: string, options?: { ascending?: boolean }): this {
    this.orders.push({ column, ascending: options?.ascending !== false });
    return this;
  }
  limit(value: number): this {
    if (!Number.isInteger(value) || value < 0) throw new Error("invalid_query_limit");
    this.maxRows = value;
    return this;
  }
  range(from: number, to: number): this {
    if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < from) {
      throw new Error("invalid_query_range");
    }
    this.rowOffset = from;
    this.maxRows = to - from + 1;
    return this;
  }
  single(): LocalQuery<Row, Row> { this.resultMode = "single"; return this as unknown as LocalQuery<Row, Row>; }
  maybeSingle(): LocalQuery<Row, Row | null> { this.resultMode = "maybeSingle"; return this as unknown as LocalQuery<Row, Row | null>; }
  insert(values: Record<string, unknown> | Record<string, unknown>[]): this { this.operation = "insert"; this.payload = values; return this; }
  update(values: Record<string, unknown>): this { this.operation = "update"; this.payload = values; return this; }
  delete(): this { this.operation = "delete"; return this; }

  private addFilter(column: string, operator: Filter["operator"], value: unknown): this {
    quoteIdentifier(column);
    this.filters.push({ column, operator, value });
    return this;
  }

  private async execute(): Promise<DbResult<Output>> {
    try {
      const db = getDatabase();
      if (this.operation !== "select" && !this.serviceRole) throw new Error("service_role_required_for_direct_mutation");
      if (this.operation === "insert") {
        const payload = this.payload;
        const rows: Record<string, unknown>[] = Array.isArray(payload) ? payload : [payload ?? {}];
        const inserted = rows.map((row) => {
          const value = { ...row };
          if ("id" in value && value.id === undefined) delete value.id;
          if (["entries", "expenses", "headquarters_transfers", "monthly_closings", "audit_events", "documents", "financial_adjustments", "financial_reversals", "period_reopening_requests", "physical_cash_registers", "physical_cash_periods", "physical_cash_movements"].includes(this.table) && !value.id) value.id = randomUUID();
          const keys = Object.keys(value);
          if (!keys.length) throw new Error("empty_insert");
          const sql = `INSERT INTO ${quoteIdentifier(this.table)} (${keys.map(quoteIdentifier).join(", ")}) VALUES (${keys.map(() => "?").join(", ")})`;
          db.prepare(sql).run(...keys.map((key) => toSqlValue(value[key])));
          return value;
        });
        return { data: (this.returnRows ? inserted : null) as Output | null, error: null };
      }

      const where = this.buildWhere();
      if (this.operation === "update") {
        const values = this.payload;
        if (!values || Array.isArray(values)) throw new Error("invalid_update_payload");
        const keys = Object.keys(values);
        if (!keys.length) throw new Error("empty_update");
        const assignments = keys.map((key) => `${quoteIdentifier(key)} = ?`).join(", ");
        const returning = this.returnRows ? " RETURNING *" : "";
        const updated = db.prepare(`UPDATE ${quoteIdentifier(this.table)} SET ${assignments}${where.sql ? ` WHERE ${where.sql}` : ""}${returning}`)
          .all(...keys.map((key) => toSqlValue(values[key])), ...where.values.map(toSqlValue))
          .map((item) => normalizeRow(item as Record<string, unknown>));
        return { data: (this.returnRows ? updated : null) as Output | null, error: null };
      }
      if (this.operation === "delete") {
        const returning = this.returnRows ? " RETURNING *" : "";
        const deleted = db.prepare(`DELETE FROM ${quoteIdentifier(this.table)}${where.sql ? ` WHERE ${where.sql}` : ""}${returning}`)
          .all(...where.values.map(toSqlValue))
          .map((item) => normalizeRow(item as Record<string, unknown>));
        return { data: (this.returnRows ? deleted : null) as Output | null, error: null };
      }

      const parsed = parseSelection(this.selection);
      const sqlColumns = parsed.columns.length
        ? parsed.columns.map((column) => {
          const [alias, source] = column.includes(":") ? column.split(":", 2) : [column, column];
          return `${quoteIdentifier(source)}${alias !== source ? ` AS ${quoteIdentifier(alias)}` : ""}`;
        }).join(", ")
        : "*";
      const orderSql = this.orders.map((order) => `${quoteIdentifier(order.column)} ${order.ascending ? "ASC" : "DESC"}`).join(", ");
      const limitSql = this.maxRows === null ? "" : ` LIMIT ${this.maxRows} OFFSET ${this.rowOffset}`;
      const statement = db.prepare(`SELECT ${sqlColumns} FROM ${quoteIdentifier(this.table)}${where.sql ? ` WHERE ${where.sql}` : ""}${orderSql ? ` ORDER BY ${orderSql}` : ""}${limitSql}`);
      const baseRows = statement.all(...where.values.map(toSqlValue)).map((item) => normalizeRow(item as Record<string, unknown>));
      const count = this.countRequested
        ? Number(db.prepare(`SELECT count(*) AS count FROM ${quoteIdentifier(this.table)}${where.sql ? ` WHERE ${where.sql}` : ""}`).get(...where.values.map(toSqlValue))?.count ?? 0)
        : undefined;
      const rows = baseRows.map((row) => {
        for (const relation of parsed.relations) {
          row[relation.alias] = relatedRows(this.table, relation.table, row, relation.columns);
        }
        return row;
      });
      if (this.headOnly) return { data: null, error: null, count };
      if (this.resultMode === "single") {
        if (rows.length !== 1) throw new Error("expected_single_row");
        return { data: rows[0] as Output, error: null, count };
      }
      if (this.resultMode === "maybeSingle") {
        if (rows.length > 1) throw new Error("expected_at_most_one_row");
        return { data: (rows[0] ?? null) as Output | null, error: null, count };
      }
      return { data: rows as Output, error: null, count };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : "database_query_failed" } };
    }
  }

  private buildWhere(): { sql: string; values: unknown[] } {
    const clauses: string[] = [];
    const values: unknown[] = [];
    for (const filter of this.filters) {
      const column = quoteIdentifier(filter.column);
      if (filter.operator === "IN") {
        const items = filter.value as unknown[];
        clauses.push(items.length ? `${column} IN (${items.map(() => "?").join(", ")})` : "0 = 1");
        values.push(...items);
      } else if (filter.operator === "IS" && filter.value === null) {
        clauses.push(`${column} IS NULL`);
      } else {
        clauses.push(`${column} ${filter.operator} ?`);
        values.push(filter.value);
      }
    }
    const visibility = visibilityClause(this.table, this.userId, this.serviceRole);
    if (visibility.sql) {
      clauses.push(visibility.sql);
      values.push(...visibility.values);
    }
    return { sql: clauses.join(" AND "), values };
  }

  then<TResult1 = DbResult<Output>, TResult2 = never>(
    onfulfilled?: ((value: DbResult<Output>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled ?? undefined, onrejected ?? undefined);
  }
}

function mapUser(row: Record<string, unknown>): LocalUser {
  return {
    id: String(row.id),
    email: String(row.email),
    user_metadata: (jsonValue(row.user_metadata) ?? {}) as Record<string, unknown>,
    app_metadata: (jsonValue(row.app_metadata) ?? {}) as Record<string, unknown>,
    created_at: typeof row.created_at === "string" ? row.created_at : null,
  };
}

function sessionTokenHash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function getCurrentUser(token?: string): Promise<LocalUser | null> {
  const sessionToken = token ?? (await cookies()).get("ecc_session")?.value;
  if (!sessionToken) return null;
  const row = getDatabase().prepare(`
    SELECT u.id, u.email, u.user_metadata, u.app_metadata, u.created_at
    FROM local_sessions s JOIN app_users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.expires_at > ? AND u.deleted_at IS NULL
      AND (u.banned_until IS NULL OR u.banned_until <= ?)
  `).get(sessionTokenHash(sessionToken), new Date().toISOString(), new Date().toISOString()) as Record<string, unknown> | undefined;
  return row ? mapUser(row) : null;
}

export async function createLocalSession(userId: string): Promise<{ token: string; expiresAt: string }> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  getDatabase().prepare("INSERT INTO local_sessions(token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)")
    .run(sessionTokenHash(token), userId, expiresAt, new Date().toISOString());
  return { token, expiresAt };
}

export async function authenticateLocalUser(email: string, password: string): Promise<LocalUser | null> {
  const row = getDatabase().prepare(`
    SELECT id, email, password_hash, email_confirmed_at, user_metadata, app_metadata, created_at,
           banned_until, deleted_at
    FROM app_users WHERE email = ? COLLATE NOCASE
  `).get(email.trim().toLowerCase()) as Record<string, unknown> | undefined;
  if (!row || row.deleted_at || !row.email_confirmed_at) return null;
  if (typeof row.banned_until === "string" && row.banned_until > new Date().toISOString()) return null;
  if (typeof row.password_hash !== "string" || !/^\$2[aby]\$/.test(row.password_hash)) return null;
  if (!await compare(password, row.password_hash)) return null;
  return mapUser(row);
}

export class LocalSupabaseClient {
  readonly auth: {
    getUser: () => Promise<{ data: { user: LocalUser | null }; error: DbError | null }>;
    admin: {
      listUsers: (options?: { page?: number; perPage?: number }) => Promise<{ data: { users: LocalUser[] }; error: DbError | null }>;
      getUserById: (userId: string) => Promise<{ data: { user: LocalUser | null }; error: DbError | null }>;
      inviteUserByEmail: (email: string, options?: { data?: Record<string, unknown> }) => Promise<{ data: { user: LocalUser | null; initialPassword?: string }; error: DbError | null }>;
      resetUserPassword: (userId: string, actorId: string) => Promise<{ data: { temporaryPassword: string | null }; error: DbError | null }>;
      deleteUser: (userId: string) => Promise<{ error: DbError | null }>;
    };
    signOut: () => Promise<{ error: DbError | null }>;
  };

  constructor(private readonly userId: string | null, private readonly serviceRole = false) {
    this.auth = {
      getUser: async (): Promise<{ data: { user: LocalUser | null }; error: DbError | null }> => ({ data: { user: await getCurrentUser() }, error: null }),
      admin: {
        listUsers: async (options?: { page?: number; perPage?: number }) => {
          if (!this.serviceRole) return { data: { users: [] }, error: { message: "service_role_required" } };
          const page = Math.max(options?.page ?? 1, 1);
          const perPage = Math.min(Math.max(options?.perPage ?? 100, 1), 1000);
          const rows = getDatabase().prepare(`
            SELECT id, email, user_metadata, app_metadata, created_at
            FROM app_users WHERE deleted_at IS NULL ORDER BY email LIMIT ? OFFSET ?
          `).all(perPage, (page - 1) * perPage) as Record<string, unknown>[];
          return { data: { users: rows.map(mapUser) }, error: null };
        },
        getUserById: async (userId: string) => {
          if (!this.serviceRole) return { data: { user: null }, error: { message: "service_role_required" } };
          const row = getDatabase().prepare(`
            SELECT id, email, user_metadata, app_metadata, created_at
            FROM app_users WHERE id = ? AND deleted_at IS NULL
          `).get(userId) as Record<string, unknown> | undefined;
          return { data: { user: row ? mapUser(row) : null }, error: null };
        },
        inviteUserByEmail: async (email: string, options?: { data?: Record<string, unknown> }) => {
          if (!this.serviceRole) return { data: { user: null }, error: { message: "service_role_required" } };
          const normalizedEmail = email.trim().toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return { data: { user: null }, error: { message: "invalid_email" } };
          const temporaryPassword = randomBytes(18).toString("base64url");
          const id = randomUUID();
          const timestamp = new Date().toISOString();
          try {
            getDatabase().prepare(`
              INSERT INTO app_users(id, email, password_hash, email_confirmed_at, user_metadata, app_metadata, created_at, updated_at)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(id, normalizedEmail, await hash(temporaryPassword, 12), timestamp,
              JSON.stringify(options?.data ?? {}), "{}", timestamp, timestamp);
            const user: LocalUser = { id, email: normalizedEmail, user_metadata: options?.data ?? {}, app_metadata: {}, created_at: timestamp };
            return { data: { user, initialPassword: temporaryPassword }, error: null };
          } catch (error) {
            return { data: { user: null }, error: { message: error instanceof Error ? error.message : "user_invite_failed" } };
          }
        },
        resetUserPassword: async (userId: string, actorId: string) => {
          if (!this.serviceRole) return { data: { temporaryPassword: null }, error: { message: "service_role_required" } };
          const database = getDatabase();
          const user = database.prepare("SELECT 1 FROM app_users WHERE id = ? AND deleted_at IS NULL").get(userId);
          if (!user) return { data: { temporaryPassword: null }, error: { message: "user_not_found" } };
          const temporaryPassword = randomBytes(18).toString("base64url");
          try {
            const passwordHash = await hash(temporaryPassword, 12);
            withTransaction(() => {
              database.prepare("UPDATE app_users SET password_hash = ?, updated_at = ? WHERE id = ?")
                .run(passwordHash, new Date().toISOString(), userId);
              database.prepare("DELETE FROM local_sessions WHERE user_id = ?").run(userId);
              logAudit(actorId, null, "password_reset", "app_users", userId, "platform_admin_password_reset");
            });
            return { data: { temporaryPassword }, error: null };
          } catch (error) {
            return { data: { temporaryPassword: null }, error: { message: error instanceof Error ? error.message : "user_password_reset_failed" } };
          }
        },
        deleteUser: async (userId: string) => {
          if (!this.serviceRole) return { error: { message: "service_role_required" } };
          getDatabase().prepare("DELETE FROM app_users WHERE id = ?").run(userId);
          return { error: null };
        },
      },
      signOut: async () => {
        const cookieStore = await cookies();
        const token = cookieStore.get("ecc_session")?.value;
        if (token) getDatabase().prepare("DELETE FROM local_sessions WHERE token_hash = ?").run(sessionTokenHash(token));
        cookieStore.delete("ecc_session");
        return { error: null };
      },
    };
  }

  from<T extends TableName>(table: T): LocalQuery<TableRows[T]> {
    return new LocalQuery<TableRows[T]>(table, this.userId, this.serviceRole);
  }

  async rpc(name: string, params: Record<string, unknown>): Promise<DbResult<unknown>> {
    try {
      const data = runLocalRpc(name, params, this.userId, this.serviceRole);
      return { data, error: null };
    } catch (error) {
      return { data: null, error: { message: error instanceof Error ? error.message : "database_rpc_failed" } };
    }
  }
}

function requirePermission(userId: string | null, congregationId: string, permission: string): void {
  if (!userId || !filterPermission(userId, congregationId, permission)) throw new Error(`${permission.replace(".", "_")}_not_allowed`);
}

function logAudit(userId: string, congregationId: string | null, action: string, entity: string, entityId: string, reason: string, before?: unknown, after?: unknown): void {
  getDatabase().prepare(`
    INSERT INTO audit_events(id, actor_id, congregation_id, action, entity, entity_id, reason, before_data, after_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(randomUUID(), userId, congregationId, action, entity, entityId, reason,
    before === undefined ? null : JSON.stringify(before), after === undefined ? null : JSON.stringify(after));
}

function withTransaction<T>(work: () => T): T {
  const db = getDatabase();
  db.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function monthStart(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new Error("invalid_reference_period");
  return `${value.slice(0, 7)}-01`;
}

function assertDate(value: unknown): asserts value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new Error("invalid_occurrence_date");
  }
}

function dateInTimeZone(value: Date, timeZone: string): string {
  const parts = new Map(new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value).map((part) => [part.type, part.value]));
  return `${parts.get("year")}-${parts.get("month")}-${parts.get("day")}`;
}

function assertPositiveAmount(value: unknown): asserts value is number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value <= 0) throw new Error("amount_must_be_positive_cents");
}

function isPeriodClosed(congregationId: string, period: string): boolean {
  const row = getDatabase().prepare(`
    SELECT 1 FROM monthly_closings
    WHERE congregation_id = ? AND reference_period = ? AND status = 'closed'
  `).get(congregationId, monthStart(period));
  return Boolean(row);
}

function requireOpenPeriod(congregationId: string, period: string): void {
  if (isPeriodClosed(congregationId, period)) throw new Error("closed_period_requires_correction_or_reopening");
}

function getRecord(table: string, id: string): DbRow | null {
  const result = getDatabase().prepare(`SELECT * FROM ${quoteIdentifier(table)} WHERE id = ?`).get(id);
  return result ? normalizeRow(result as Record<string, unknown>) : null;
}

function getSql(sql: string, values: unknown[]): Record<string, unknown> | undefined {
  return getDatabase().prepare(sql).get(...values.map(toSqlValue)) as Record<string, unknown> | undefined;
}

function runSql(sql: string, values: unknown[]) {
  return getDatabase().prepare(sql).run(...values.map(toSqlValue));
}

function runHierarchicalMetrics(params: Record<string, unknown>, userId: string | null): DbRow {
  if (!userId || userId !== params.p_user_id) throw new Error("financial_metrics_user_mismatch");
  const unitId = String(params.p_unit_id ?? "");
  const mode = params.p_mode;
  const startDate = params.p_start_date;
  const endDate = params.p_end_date;
  if (mode !== "local" && mode !== "consolidated") throw new Error("financial_metrics_mode_invalid");
  assertDate(startDate);
  assertDate(endDate);
  if (endDate < startDate) throw new Error("financial_metrics_period_invalid");
  if (!getDatabase().prepare("SELECT 1 FROM congregations WHERE id = ?").get(unitId)) throw new Error("financial_metrics_unit_not_found");
  requirePermission(userId, unitId, mode === "local" ? "financial.read" : "hierarchy.financial.read");

  const allOrganizations = getDatabase().prepare("SELECT id, name, parent_id, organization_level FROM congregations").all() as DbRow[];
  const byId = new Map(allOrganizations.map((unit) => [String(unit.id), unit]));
  const root = byId.get(unitId);
  if (!root) throw new Error("financial_metrics_unit_not_found");
  const units: DbRow[] = [root];
  if (mode === "consolidated") {
    const visited = new Set([unitId]);
    for (let cursor = 0; cursor < units.length; cursor += 1) {
      const currentId = String(units[cursor].id);
      for (const child of allOrganizations) {
        if (child.parent_id !== currentId) continue;
        const childId = String(child.id);
        if (visited.has(childId)) continue;
        visited.add(childId);
        units.push(child);
      }
    }
  }

  const metrics = units.map((unit) => {
    const id = String(unit.id);
    const internalTransferFilter = mode === "consolidated" ? " AND is_internal_transfer = 0" : "";
    const entries = getDatabase().prepare(`
      SELECT id, occurred_on, amount_cents, category AS label
      FROM entries WHERE congregation_id = ? AND occurred_on BETWEEN ? AND ?${internalTransferFilter}
      ORDER BY occurred_on DESC, id LIMIT 10
    `).all(id, startDate, endDate) as DbRow[];
    const expenses = getDatabase().prepare(`
      SELECT id, occurred_on, amount_cents, description AS label
      FROM expenses WHERE congregation_id = ? AND occurred_on BETWEEN ? AND ?${internalTransferFilter}
      ORDER BY occurred_on DESC, id LIMIT 10
    `).all(id, startDate, endDate) as DbRow[];
    const incomeTotal = Number(getDatabase().prepare(`
      SELECT coalesce(sum(amount_cents), 0) AS total FROM entries
      WHERE congregation_id = ? AND occurred_on BETWEEN ? AND ?${internalTransferFilter}
    `).get(id, startDate, endDate)?.total ?? 0);
    const expenseTotal = Number(getDatabase().prepare(`
      SELECT coalesce(sum(amount_cents), 0) AS total FROM expenses
      WHERE congregation_id = ? AND occurred_on BETWEEN ? AND ?${internalTransferFilter}
    `).get(id, startDate, endDate)?.total ?? 0);
    const recent: Array<{ id: string; occurred_on: string; amount_cents: number; label: string; kind: "income" | "expense" }> = [
      ...entries.map((item) => ({ id: String(item.id), occurred_on: String(item.occurred_on), amount_cents: Number(item.amount_cents), label: String(item.label), kind: "income" as const })),
      ...expenses.map((item) => ({ id: String(item.id), occurred_on: String(item.occurred_on), amount_cents: Number(item.amount_cents), label: String(item.label), kind: "expense" as const })),
    ]
      .sort((left, right) => String(right.occurred_on).localeCompare(String(left.occurred_on)) || String(left.id).localeCompare(String(right.id)))
      .slice(0, 10);
    return {
      unit_id: id,
      parent_id: unit.parent_id ?? null,
      name: unit.name,
      level: unit.organization_level,
      total_income: incomeTotal,
      total_expense: expenseTotal,
      balance: incomeTotal - expenseTotal,
      recent_movements: recent,
    };
  });
  const descendantsOf = (parentId: string): typeof metrics => {
    const found: typeof metrics = [];
    const pending = [parentId];
    const visited = new Set(pending);
    while (pending.length) {
      const current = pending.pop();
      for (const unit of metrics) {
        if (unit.parent_id !== current || visited.has(unit.unit_id)) continue;
        visited.add(unit.unit_id);
        found.push(unit);
        pending.push(unit.unit_id);
      }
    }
    return found;
  };
  const withSubtotals = metrics.map((unit) => {
    const branch = [unit, ...descendantsOf(unit.unit_id)];
    const subtreeIncome = branch.reduce((total, item) => total + item.total_income, 0);
    const subtreeExpense = branch.reduce((total, item) => total + item.total_expense, 0);
    return { ...unit, subtree_total_income: subtreeIncome, subtree_total_expense: subtreeExpense, subtree_balance: subtreeIncome - subtreeExpense };
  });
  const totalIncome = metrics.reduce((total, unit) => total + unit.total_income, 0);
  const totalExpense = metrics.reduce((total, unit) => total + unit.total_expense, 0);
  return { total_income: totalIncome, total_expense: totalExpense, balance: totalIncome - totalExpense, units: withSubtotals } as unknown as DbRow;
}

function runLocalRpc(name: string, params: Record<string, unknown>, userId: string | null, serviceRole: boolean): unknown {
  const db = getDatabase();
  if (name === "has_congregation_permission") {
    return Boolean(userId && filterPermission(userId, String(params.target_congregation), String(params.target_permission)));
  }
  if (name === "get_hierarchical_financial_metrics") return runHierarchicalMetrics(params, userId);
  if (name === "admin_replace_user_access") {
    if (!serviceRole) throw new Error("admin_service_role_required");
    const actorId = String(params.p_actor_id ?? "");
    const targetUserId = String(params.p_user_id ?? "");
    const assignments = params.p_assignments;
    if (!actorId || !targetUserId || !Array.isArray(assignments)) throw new Error("admin_assignments_invalid");
    return withTransaction(() => {
      db.prepare("DELETE FROM memberships WHERE user_id = ?").run(targetUserId);
      for (const item of assignments as Record<string, unknown>[]) {
        const congregationId = String(item.congregationId);
        const role = String(item.role);
        const permissions = item.permissions as Record<string, unknown>;
        if (!db.prepare("SELECT 1 FROM congregations WHERE id = ?").get(congregationId)) throw new Error("admin_congregation_not_found");
        if (!(role in defaultPermissions)) throw new Error("admin_role_invalid");
        if (!permissions || typeof permissions !== "object") throw new Error("admin_assignments_invalid");
        if (permissions["financial.read"] !== true && Object.entries(permissions).some(([key, value]) => key !== "financial.read" && value === true && !key.startsWith("hierarchy."))) {
          throw new Error("financial_read_required_for_other_permissions");
        }
        db.prepare("INSERT INTO memberships(user_id, congregation_id, role) VALUES (?, ?, ?)").run(targetUserId, congregationId, role);
        db.prepare(`
          INSERT INTO membership_permission_overrides
          (user_id, congregation_id, financial_read, financial_write, financial_approve, closing_submit, audit_read, hierarchy_view, hierarchy_financial_read)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(targetUserId, congregationId,
          permissions["financial.read"] === true ? 1 : 0,
          permissions["financial.write"] === true ? 1 : 0,
          permissions["financial.approve"] === true ? 1 : 0,
          permissions["closing.submit"] === true ? 1 : 0,
          permissions["audit.read"] === true ? 1 : 0,
          permissions["hierarchy.view"] === true ? 1 : 0,
          permissions["hierarchy.financial.read"] === true ? 1 : 0);
      }
      logAudit(actorId, null, "updated", "memberships", targetUserId, "platform_admin_access_update", undefined, { assignments });
      return null;
    });
  }
  if (name === "create_entry" || name === "create_expense" || name === "request_transfer") {
    if (!userId) throw new Error("authentication_required");
    const congregationId = String(params.p_congregation_id ?? params.p_origin_congregation_id);
    requirePermission(userId, congregationId, "financial.write");
    const id = randomUUID();
    if (name === "create_entry") {
      assertPositiveAmount(params.p_amount_cents);
      assertDate(params.p_occurred_on);
      requireOpenPeriod(congregationId, params.p_occurred_on);
      return withTransaction(() => {
        db.prepare(`
        INSERT INTO entries(id, congregation_id, occurred_on, amount_cents, category, origin, payment_method, purpose, recorded_by, is_internal_transfer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(...[
          id, congregationId, params.p_occurred_on, params.p_amount_cents, params.p_category, params.p_origin,
          params.p_payment_method, params.p_purpose ?? null, userId, params.p_is_internal_transfer === true ? 1 : 0,
        ].map(toSqlValue));
        const entry = getRecord("entries", id);
        logAudit(userId, congregationId, "created", "entries", id, "entry_created", undefined, entry);
        return entry;
      });
    }
    if (name === "create_expense") {
      assertPositiveAmount(params.p_amount_cents);
      assertDate(params.p_occurred_on);
      requireOpenPeriod(congregationId, params.p_occurred_on);
      return withTransaction(() => {
        db.prepare(`
        INSERT INTO expenses(id, congregation_id, occurred_on, amount_cents, category, description, vendor, payment_method, purpose, cost_center, recorded_by, is_internal_transfer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(...[
          id, congregationId, params.p_occurred_on, params.p_amount_cents, params.p_category, params.p_description,
          params.p_vendor ?? null, params.p_payment_method ?? "other", params.p_purpose ?? null, params.p_cost_center ?? null,
          userId, params.p_is_internal_transfer === true ? 1 : 0,
        ].map(toSqlValue));
        const expense = getRecord("expenses", id);
        logAudit(userId, congregationId, "created", "expenses", id, "expense_created", undefined, expense);
        return expense;
      });
    }
    assertPositiveAmount(params.p_amount_sent_cents);
    assertDate(params.p_reference_period);
    if (typeof params.p_reason !== "string" || !params.p_reason.trim()) throw new Error("transfer_reason_required");
    requireOpenPeriod(congregationId, String(params.p_reference_period));
    const senderCount = Number(db.prepare(`
      SELECT count(DISTINCT m.user_id) AS count
      FROM memberships m
      JOIN app_users u ON u.id = m.user_id
      WHERE m.congregation_id = ? AND m.role = 'treasurer' AND u.deleted_at IS NULL
    `).get(congregationId)?.count ?? 0);
    if (senderCount < 2) throw new Error("transfer_send_staffing_required");
    return withTransaction(() => {
      db.prepare(`
      INSERT INTO headquarters_transfers(id, origin_congregation_id, destination_name, reference_period, amount_requested_cents, amount_sent_cents, occurred_on, status, reason, requested_by)
      VALUES (?, ?, ?, ?, ?, NULL, NULL, 'requested', ?, ?)
      `).run(...[
        id, congregationId, params.p_destination_name, monthStart(params.p_reference_period), params.p_amount_sent_cents,
        params.p_reason, userId,
      ].map(toSqlValue));
      const transfer = getRecord("headquarters_transfers", id);
      logAudit(userId, congregationId, "requested", "headquarters_transfers", id, String(params.p_reason), undefined, transfer);
      return transfer;
    });
  }
  if (name === "mark_transfer_sent") {
    if (!userId) throw new Error("authentication_required");
    const transferId = String(params.p_transfer_id ?? "");
    const idempotencyKey = String(params.p_idempotency_key ?? "");
    const occurredOn = params.p_occurred_on;
    const amountSent = params.p_amount_sent_cents;
    const method = String(params.p_method ?? "");
    const reference = typeof params.p_reference === "string" ? params.p_reference.trim() : "";
    const note = typeof params.p_note === "string" ? params.p_note.trim() : "";
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
      throw new Error("transfer_send_idempotency_key_invalid");
    }
    assertDate(occurredOn);
    assertPositiveAmount(amountSent);
    if (!["pix", "transfer", "deposit", "cash"].includes(method)) throw new Error("transfer_send_method_invalid");
    if (method === "cash" && !reference) throw new Error("transfer_send_reference_required");
    if (reference.length > 200 || note.length > 1000) throw new Error("transfer_send_details_too_long");
    return withTransaction(() => {
      const target = getRecord("headquarters_transfers", transferId);
      if (!target) throw new Error("transfer_not_found");
      if (target.requested_by === userId) throw new Error("transfer_sender_requester_conflict");
      if (target.approved_by === userId) throw new Error("transfer_sender_approver_conflict");
      if (!filterPermission(userId, String(target.origin_congregation_id), "transfer.send")) throw new Error("transfer_send_not_allowed");
      const previous = getDatabase().prepare(`
        SELECT * FROM headquarters_transfer_sends WHERE transfer_id = ?
      `).get(transferId) as DbRow | undefined;
      if (previous) {
        if (
          previous.idempotency_key === idempotencyKey
          && previous.sent_by === userId
          && previous.occurred_on === occurredOn
          && previous.amount_sent_cents === amountSent
          && previous.method === method
          && previous.reference === (reference || null)
          && previous.note === (note || null)
        ) return target;
        throw new Error("transfer_already_sent");
      }
      if (target.status !== "approved") throw new Error("transfer_not_approved");
      if (typeof target.amount_approved_cents !== "number" || target.amount_approved_cents !== amountSent) {
        throw new Error("transfer_sent_amount_must_match_approved");
      }
      const todayInSaoPaulo = dateInTimeZone(new Date(), "America/Sao_Paulo");
      if (typeof target.approved_at !== "string") throw new Error("transfer_approval_timestamp_missing");
      const approvedDate = dateInTimeZone(new Date(target.approved_at), "America/Sao_Paulo");
      if (occurredOn > todayInSaoPaulo) throw new Error("transfer_send_date_in_future");
      if (occurredOn < approvedDate) throw new Error("transfer_send_date_before_approval");
      requireOpenPeriod(String(target.origin_congregation_id), occurredOn);
      const id = randomUUID();
      const createdAt = new Date().toISOString();
      getDatabase().prepare(`
        INSERT INTO headquarters_transfer_sends
        (id, transfer_id, occurred_on, amount_sent_cents, method, reference, note, sent_by, idempotency_key, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, transferId, occurredOn, amountSent, method, reference || null, note || null, userId, idempotencyKey, createdAt);
      getDatabase().prepare(`
        UPDATE headquarters_transfers
        SET amount_sent_cents = ?, occurred_on = ?, status = 'sent'
        WHERE id = ?
      `).run(amountSent, occurredOn, transferId);
      const updated = getRecord("headquarters_transfers", transferId);
      logAudit(userId, String(target.origin_congregation_id), "sent", "headquarters_transfers", transferId, "transfer_sent", target, {
        transfer: updated,
        send: { id, occurred_on: occurredOn, amount_sent_cents: amountSent, method, reference: reference || null, note: note || null, sent_by: userId, created_at: createdAt },
      });
      return updated;
    });
  }
  if (name === "approve_expense" || name === "approve_transfer" || name === "confirm_transfer") {
    if (!userId) throw new Error("authentication_required");
    return withTransaction(() => {
      const table = name === "approve_expense" ? "expenses" : "headquarters_transfers";
      const id = String(name === "approve_expense" ? params.p_expense_id : params.p_transfer_id);
      const target = getRecord(table, id);
      if (!target) throw new Error(name === "approve_expense" ? "expense_not_found" : "transfer_not_found");
      const congregationId = String(name === "approve_expense" ? target.congregation_id : target.origin_congregation_id);
      const permission = name === "approve_expense" ? "financial.approve" : "financial.approve";
      requirePermission(userId, congregationId, permission);
      if (name === "approve_expense") {
        if (target.status !== "pending") throw new Error("expense_not_pending");
        db.prepare("UPDATE expenses SET status = 'approved', approved_by = ?, approved_at = ? WHERE id = ?")
          .run(userId, new Date().toISOString(), id);
        const updated = getRecord("expenses", id);
        logAudit(userId, congregationId, "approved", table, id, "expense_approval", target, updated);
        return updated;
      }
      if (name === "approve_transfer") {
        if (target.status !== "requested") throw new Error("transfer_not_requested");
        if (target.requested_by === userId) throw new Error("transfer_self_approval_forbidden");
        db.prepare("UPDATE headquarters_transfers SET status = 'approved', amount_approved_cents = amount_requested_cents, approved_by = ?, approved_at = ? WHERE id = ?")
          .run(userId, new Date().toISOString(), id);
        const updated = getRecord("headquarters_transfers", id);
        logAudit(userId, congregationId, "approved", table, id, "transfer_approval", target, updated);
        return updated;
      }
      const actorRole = db.prepare("SELECT role FROM memberships WHERE user_id = ? AND congregation_id = ?").get(userId, congregationId)?.role;
      if (actorRole !== "central_admin") throw new Error("headquarters_confirmation_not_allowed");
      if (target.status !== "approved" && target.status !== "sent") throw new Error("transfer_not_ready_for_confirmation");
      assertPositiveAmount(params.p_amount_received_cents);
      const nextStatus = target.amount_sent_cents === params.p_amount_received_cents ? "confirmed" : "questioned";
      db.prepare("UPDATE headquarters_transfers SET amount_received_cents = ?, status = ? WHERE id = ?")
        .run(params.p_amount_received_cents, nextStatus, id);
      const updated = getRecord("headquarters_transfers", id);
      logAudit(userId, congregationId, nextStatus, table, id, nextStatus === "confirmed" ? "transfer_reconciled" : "transfer_divergence", target, updated);
      return updated;
    });
  }
  if (name === "close_monthly_period") {
    if (!userId) throw new Error("authentication_required");
    const congregationId = String(params.p_congregation_id ?? "");
    requirePermission(userId, congregationId, "closing.submit");
    const period = monthStart(params.p_reference_period);
    return withTransaction(() => {
      const existing = db.prepare("SELECT * FROM monthly_closings WHERE congregation_id = ? AND reference_period = ?").get(congregationId, period) as DbRow | undefined;
      const id = String(existing?.id ?? randomUUID());
      db.prepare(`
        INSERT INTO monthly_closings(id, congregation_id, reference_period, status, submitted_by, approved_by, closed_at)
        VALUES (?, ?, ?, 'closed', ?, ?, ?)
        ON CONFLICT(congregation_id, reference_period) DO UPDATE SET status='closed', approved_by=excluded.approved_by, closed_at=excluded.closed_at
      `).run(id, congregationId, period, userId, userId, new Date().toISOString());
      const closing = getRecord("monthly_closings", id);
      logAudit(userId, congregationId, "closed", "monthly_closings", id, "monthly_period_closed", existing, closing);
      return closing;
    });
  }
  if (name === "create_financial_adjustment" || name === "create_financial_reversal") {
    if (!userId) throw new Error("authentication_required");
    const congregationId = String(params.p_congregation_id ?? "");
    const entityType = String(params.p_entity_type ?? "");
    const entityId = String(params.p_entity_id ?? "");
    requirePermission(userId, congregationId, "financial.approve");
    if (entityType !== "entries" && entityType !== "expenses") throw new Error(`${name === "create_financial_adjustment" ? "adjustment" : "reversal"}_entity_type_invalid`);
    const source = getRecord(entityType, entityId);
    if (!source) throw new Error(`${name === "create_financial_adjustment" ? "adjustment" : "reversal"}_entity_not_found`);
    if (source.congregation_id !== congregationId) throw new Error("correction_cross_congregation_forbidden");
    requireOpenPeriod(congregationId, String(source.occurred_on));
    if (typeof params.p_reason !== "string" || !params.p_reason.trim()) throw new Error("correction_reason_required");
    if (typeof params.p_idempotency_key !== "string" || !params.p_idempotency_key) throw new Error("correction_idempotency_key_required");
    const correctionReason = params.p_reason.trim();
    const idempotencyKey = params.p_idempotency_key;
    return withTransaction(() => {
      if (name === "create_financial_adjustment") {
        if (typeof params.p_amount_cents !== "number" || !Number.isSafeInteger(params.p_amount_cents) || params.p_amount_cents === 0) {
          throw new Error("adjustment_amount_invalid");
        }
        const adjustmentAmount = params.p_amount_cents;
        const old = getSql("SELECT * FROM financial_adjustments WHERE created_by = ? AND idempotency_key = ?", [userId, idempotencyKey]) as DbRow | undefined;
        if (old) return normalizeRow(old as Record<string, unknown>);
        const id = randomUUID();
        const period = monthStart(source.occurred_on);
        runSql(`
          INSERT INTO financial_adjustments(id, congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, created_by, idempotency_key)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [id, congregationId, period, entityType, entityId, adjustmentAmount, correctionReason, userId, idempotencyKey]);
        const adjustment = getRecord("financial_adjustments", id);
        logAudit(userId, congregationId, "posted", "financial_adjustments", id, correctionReason, undefined, adjustment);
        return adjustment;
      }
      const existing = getSql("SELECT * FROM financial_reversals WHERE entity_type = ? AND entity_id = ?", [entityType, entityId]) as DbRow | undefined;
      if (existing) {
        if (existing.created_by === userId && existing.idempotency_key === idempotencyKey) return normalizeRow(existing as Record<string, unknown>);
        throw new Error("reversal_already_exists");
      }
      const id = randomUUID();
      runSql(`
        INSERT INTO financial_reversals(id, congregation_id, reference_period, entity_type, entity_id, amount_cents, reason, created_by, idempotency_key)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [id, congregationId, monthStart(source.occurred_on), entityType, entityId, source.amount_cents, correctionReason, userId, idempotencyKey]);
      const reversal = getRecord("financial_reversals", id);
      logAudit(userId, congregationId, "posted", "financial_reversals", id, correctionReason, undefined, reversal);
      return reversal;
    });
  }
  if (name === "create_cash_register") {
    if (!userId) throw new Error("authentication_required");
    const congregationId = String(params.p_congregation_id ?? "");
    requirePermission(userId, congregationId, "financial.write");
    if (typeof params.p_name !== "string" || !params.p_name.trim()) throw new Error("cash_register_name_required");
    const registerName = params.p_name.trim();
    return withTransaction(() => {
      const id = randomUUID();
      db.prepare("INSERT INTO physical_cash_registers(id, congregation_id, name, created_by) VALUES (?, ?, ?, ?)")
        .run(id, congregationId, registerName, userId);
      const row = getRecord("physical_cash_registers", id);
      logAudit(userId, congregationId, "created", "physical_cash_registers", id, "cash_register_created", undefined, row);
      return row;
    });
  }
  if (name === "open_cash_period") {
    if (!userId) throw new Error("authentication_required");
    const registerId = String(params.p_cash_register_id ?? "");
    const register = getRecord("physical_cash_registers", registerId);
    if (!register) throw new Error("cash_register_not_found");
    const congregationId = String(register.congregation_id);
    requirePermission(userId, congregationId, "financial.write");
    if (typeof params.p_opening_balance_cents !== "number" || !Number.isSafeInteger(params.p_opening_balance_cents) || params.p_opening_balance_cents < 0) {
      throw new Error("cash_opening_amount_invalid");
    }
    const openingBalance = params.p_opening_balance_cents;
    assertDate(params.p_reference_period);
    requireOpenPeriod(congregationId, params.p_reference_period);
    return withTransaction(() => {
      const id = randomUUID();
      const period = monthStart(params.p_reference_period);
      db.prepare(`
        INSERT INTO physical_cash_periods(id, cash_register_id, reference_period, opening_balance_cents, created_by)
        VALUES (?, ?, ?, ?, ?)
      `).run(id, registerId, period, openingBalance, userId);
      const row = getRecord("physical_cash_periods", id);
      logAudit(userId, congregationId, "opened", "physical_cash_periods", id, "cash_period_opened", undefined, row);
      return row;
    });
  }
  if (name === "record_cash_movement") {
    if (!userId) throw new Error("authentication_required");
    const periodId = String(params.p_cash_period_id ?? "");
    const period = getRecord("physical_cash_periods", periodId);
    if (!period) throw new Error("cash_period_not_found");
    if (period.status !== "open") throw new Error("cash_period_not_open");
    const register = getRecord("physical_cash_registers", String(period.cash_register_id));
    if (!register) throw new Error("cash_register_not_found");
    const congregationId = String(register.congregation_id);
    requirePermission(userId, congregationId, "financial.write");
    assertPositiveAmount(params.p_amount_cents);
    if (typeof params.p_reason !== "string" || !params.p_reason.trim()) throw new Error("cash_reason_required");
    if (typeof params.p_movement_type !== "string" || !["cash_in", "cash_expense", "deposit"].includes(params.p_movement_type)) throw new Error("cash_movement_type_invalid");
    if (typeof params.p_idempotency_key !== "string" || !params.p_idempotency_key) throw new Error("cash_idempotency_key_required");
    const movementType = params.p_movement_type;
    const amount = params.p_amount_cents;
    const reason = params.p_reason.trim();
    const idempotencyKey = params.p_idempotency_key;
    requireOpenPeriod(congregationId, String(period.reference_period));
    return withTransaction(() => {
      const previous = getSql("SELECT * FROM physical_cash_movements WHERE created_by = ? AND idempotency_key = ?", [userId, idempotencyKey]) as DbRow | undefined;
      if (previous) return normalizeRow(previous as Record<string, unknown>);
      const balance = Number(db.prepare(`
        SELECT ? + coalesce(sum(CASE WHEN movement_type = 'cash_in' THEN amount_cents ELSE -amount_cents END), 0) AS balance
        FROM physical_cash_movements WHERE cash_period_id = ?
      `).get(...[period.opening_balance_cents, periodId].map(toSqlValue))?.balance ?? 0);
      if (movementType !== "cash_in" && balance < amount) throw new Error("cash_insufficient_balance");
      const id = randomUUID();
      db.prepare(`
        INSERT INTO physical_cash_movements(id, cash_period_id, movement_type, amount_cents, reason, created_by, idempotency_key)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, periodId, movementType, amount, reason, userId, idempotencyKey);
      const movement = getRecord("physical_cash_movements", id);
      logAudit(userId, congregationId, "created", "physical_cash_movements", id, reason, undefined, movement);
      return movement;
    });
  }
  if (name === "request_period_reopening") {
    if (!userId) throw new Error("authentication_required");
    const congregationId = String(params.p_congregation_id ?? "");
    requirePermission(userId, congregationId, "closing.submit");
    if (typeof params.p_reason !== "string" || !params.p_reason.trim()) throw new Error("reopening_reason_required");
    const reason = params.p_reason.trim();
    const period = monthStart(params.p_reference_period);
    if (!isPeriodClosed(congregationId, period)) throw new Error("period_not_closed");
    return withTransaction(() => {
      const id = randomUUID();
      db.prepare("INSERT INTO period_reopening_requests(id, congregation_id, reference_period, reason, requested_by) VALUES (?, ?, ?, ?, ?)")
        .run(id, congregationId, period, reason, userId);
      const row = getRecord("period_reopening_requests", id);
      logAudit(userId, congregationId, "requested", "period_reopening_requests", id, reason, undefined, row);
      return row;
    });
  }
  if (name === "approve_period_reopening") {
    if (!userId) throw new Error("authentication_required");
    const requestId = String(params.p_request_id ?? "");
    return withTransaction(() => {
      const request = getRecord("period_reopening_requests", requestId);
      if (!request) throw new Error("reopening_request_not_found");
      if (request.status !== "pending") throw new Error("reopening_request_not_pending");
      if (request.requested_by === userId) throw new Error("reopening_self_approval_forbidden");
      const congregationId = String(request.congregation_id);
      const referencePeriod = String(request.reference_period);
      const membership = getDatabase().prepare("SELECT role FROM memberships WHERE user_id = ? AND congregation_id = ?")
        .get(userId, congregationId) as { role?: string } | undefined;
      if (membership?.role !== "central_admin") throw new Error("reopening_approval_not_allowed");
      const closing = getSql(
        "SELECT * FROM monthly_closings WHERE congregation_id = ? AND reference_period = ?",
        [congregationId, referencePeriod],
      );
      if (!closing || closing.status !== "closed") throw new Error("period_not_closed");
      db.prepare("UPDATE monthly_closings SET status = 'open', closed_at = NULL, approved_by = ? WHERE congregation_id = ? AND reference_period = ?")
        .run(userId, congregationId, referencePeriod);
      const reopenedClosing = getSql(
        "SELECT * FROM monthly_closings WHERE congregation_id = ? AND reference_period = ?",
        [congregationId, referencePeriod],
      );
      db.prepare("UPDATE period_reopening_requests SET status = 'approved', approved_by = ?, approved_at = ? WHERE id = ?")
        .run(userId, new Date().toISOString(), requestId);
      const approvedRequest = getRecord("period_reopening_requests", requestId);
      logAudit(
        userId, congregationId, "approved", "period_reopening_requests", requestId, String(request.reason),
        { request, closing }, { request: approvedRequest, closing: reopenedClosing },
      );
      return approvedRequest;
    });
  }
  if (name === "count_cash") {
    if (!userId) throw new Error("authentication_required");
    const periodId = String(params.p_cash_period_id ?? "");
    const period = getRecord("physical_cash_periods", periodId);
    if (!period) throw new Error("cash_period_not_found");
    if (period.status !== "open") throw new Error("cash_period_not_open");
    const register = getRecord("physical_cash_registers", String(period.cash_register_id));
    if (!register) throw new Error("cash_register_not_found");
    const congregationId = String(register.congregation_id);
    requirePermission(userId, congregationId, "financial.write");
    const countedBalance = params.p_counted_balance_cents;
    if (typeof countedBalance !== "number" || !Number.isSafeInteger(countedBalance) || countedBalance < 0) {
      throw new Error("cash_count_invalid");
    }
    const rawDivergenceReason = params.p_divergence_reason;
    if (rawDivergenceReason !== undefined && rawDivergenceReason !== null && typeof rawDivergenceReason !== "string") {
      throw new Error("cash_divergence_reason_invalid");
    }
    const divergenceReason = typeof rawDivergenceReason === "string" ? rawDivergenceReason.trim() : "";
    return withTransaction(() => {
      const expectedBalance = Number(db.prepare(`
        SELECT ? + coalesce(sum(CASE WHEN movement_type = 'cash_in' THEN amount_cents ELSE -amount_cents END), 0) AS balance
        FROM physical_cash_movements WHERE cash_period_id = ?
      `).get(Number(period.opening_balance_cents), periodId)?.balance ?? 0);
      if (countedBalance !== expectedBalance && !divergenceReason) throw new Error("cash_divergence_reason_required");
      db.prepare(`
        UPDATE physical_cash_periods
        SET counted_balance_cents = ?, counted_by = ?, counted_at = ?, divergence_reason = ?
        WHERE id = ?
      `).run(countedBalance, userId, new Date().toISOString(), divergenceReason || null, periodId);
      const updated = getRecord("physical_cash_periods", periodId);
      logAudit(userId, congregationId, "counted", "physical_cash_periods", periodId, divergenceReason || "cash_counted", period, updated);
      return updated;
    });
  }
  if (name === "close_cash_period") {
    if (!userId) throw new Error("authentication_required");
    const periodId = String(params.p_cash_period_id ?? "");
    const period = getRecord("physical_cash_periods", periodId);
    if (!period) throw new Error("cash_period_not_found");
    const register = getRecord("physical_cash_registers", String(period.cash_register_id));
    if (!register) throw new Error("cash_register_not_found");
    const congregationId = String(register.congregation_id);
    requirePermission(userId, congregationId, "closing.submit");
    if (period.status !== "open") throw new Error("cash_period_not_open");
    if (period.counted_balance_cents === null) throw new Error("cash_count_required");
    return withTransaction(() => {
      db.prepare("UPDATE physical_cash_periods SET status = 'closed', closed_by = ?, closed_at = ? WHERE id = ?")
        .run(userId, new Date().toISOString(), periodId);
      const closedPeriod = getRecord("physical_cash_periods", periodId);
      logAudit(userId, congregationId, "closed", "physical_cash_periods", periodId, "cash_period_closed", period, closedPeriod);
      return closedPeriod;
    });
  }
  if (name === "admin_create_congregation") {
    if (!serviceRole) throw new Error("admin_service_role_required");
    const level = String(params.p_organization_level);
    const type = String(params.p_organization_type);
    const allowedLevels = ["national_hq", "state_hq", "sub_hq", "local_congregation"];
    if (!allowedLevels.includes(level) || !["church", "ong"].includes(type)) throw new Error("organization_level_invalid");
    if (typeof params.p_name !== "string" || !params.p_name.trim()) throw new Error("organization_name_required");
    if (typeof params.p_city !== "string" || !params.p_city.trim()) throw new Error("organization_city_required");
    if (typeof params.p_state !== "string" || !params.p_state.trim()) throw new Error("organization_state_required");
    const name = params.p_name.trim();
    const city = params.p_city.trim();
    const state = params.p_state.trim();
    if (params.p_is_headquarters !== (level !== "local_congregation")) throw new Error("headquarters_level_mismatch");
    const parentId = params.p_parent_id == null ? null : String(params.p_parent_id);
    const validParentLevels: Record<string, string[]> = {
      national_hq: [],
      state_hq: ["national_hq"],
      sub_hq: ["national_hq", "state_hq"],
      local_congregation: ["national_hq", "state_hq", "sub_hq"],
    };
    if (level === "national_hq" && parentId) throw new Error("national_headquarters_must_be_root");
    if (level === "state_hq" && !parentId) throw new Error("parent_organization_required");
    if (parentId) {
      const parent = db.prepare("SELECT organization_level, organization_type FROM congregations WHERE id = ?").get(parentId);
      if (!parent || parent.organization_type !== type || !validParentLevels[level].includes(String(parent.organization_level))) {
        throw new Error("parent_organization_level_invalid");
      }
    }
    const id = randomUUID();
    return withTransaction(() => {
      db.prepare(`
        INSERT INTO congregations(id, name, city, state, organization_type, is_headquarters, parent_id, organization_level)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, name, city, state, type, params.p_is_headquarters === true ? 1 : 0, parentId, level);
      const congregation = getRecord("congregations", id);
      logAudit(String(params.p_actor_id), id, "created", "congregations", id, "platform_admin_organization_create", undefined, congregation);
      return congregation;
    });
  }
  throw new Error(`unsupported_sqlite_rpc:${name}`);
}
