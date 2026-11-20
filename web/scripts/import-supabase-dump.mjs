import { existsSync, mkdirSync, readFileSync, renameSync, rmSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

const sourcePath = process.argv[2] ? resolve(process.argv[2]) : resolve(process.cwd(), "..", "backup_completo.sql");
const configuredPath = process.env.ECC_SQLITE_PATH;
const targetPath = configuredPath
  ? (isAbsolute(configuredPath) ? configuredPath : resolve(process.cwd(), configuredPath))
  : resolve(process.env.LOCALAPPDATA || process.cwd(), "ECC-2.0", "ecclesia.sqlite");
const temporaryPath = `${targetPath}.importing`;

const tableMap = new Map([
  ["public.congregations", "congregations"],
  ["public.memberships", "memberships"],
  ["public.membership_permission_overrides", "membership_permission_overrides"],
  ["public.entries", "entries"],
  ["public.expenses", "expenses"],
  ["public.headquarters_transfers", "headquarters_transfers"],
  ["public.monthly_closings", "monthly_closings"],
  ["public.audit_events", "audit_events"],
  ["public.documents", "documents"],
  ["public.financial_adjustments", "financial_adjustments"],
  ["public.financial_reversals", "financial_reversals"],
  ["public.period_reopening_requests", "period_reopening_requests"],
  ["public.physical_cash_registers", "physical_cash_registers"],
  ["public.physical_cash_periods", "physical_cash_periods"],
  ["public.physical_cash_movements", "physical_cash_movements"],
  ["auth.users", "app_users"],
  ["auth.identities", "auth_identities"],
]);

const booleanColumns = new Set([
  "active", "is_headquarters", "is_internal_transfer", "financial_read", "financial_write",
  "financial_approve", "closing_submit", "audit_read", "hierarchy_view",
  "hierarchy_financial_read", "is_anonymous",
]);

function decodeCopyField(value) {
  if (value === "\\N") return null;
  let result = "";
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] !== "\\") {
      result += value[index];
      continue;
    }
    index += 1;
    const escaped = value[index];
    if (escaped === undefined) break;
    const simple = { b: "\b", f: "\f", n: "\n", r: "\r", t: "\t", v: "\v", "\\": "\\" };
    if (escaped in simple) {
      result += simple[escaped];
    } else if (escaped === "x" && /^[0-9a-f]{1,2}/i.test(value.slice(index + 1))) {
      const match = value.slice(index + 1).match(/^[0-9a-f]{1,2}/i);
      result += String.fromCharCode(Number.parseInt(match[0], 16));
      index += match[0].length;
    } else if (/[0-7]/.test(escaped)) {
      const match = value.slice(index).match(/^[0-7]{1,3}/);
      result += String.fromCharCode(Number.parseInt(match[0], 8));
      index += match[0].length - 1;
    } else {
      result += escaped;
    }
  }
  return result;
}

function parseCopyRow(line) {
  return line.split("\t").map(decodeCopyField);
}

function sqliteValue(column, value) {
  if (value === null) return null;
  if (booleanColumns.has(column)) {
    if (value === "t" || value === "true") return 1;
    if (value === "f" || value === "false") return 0;
  }
  return value;
}

function mappedRow(sourceTable, sourceColumns, values) {
  const source = Object.fromEntries(sourceColumns.map((column, index) => [column, values[index]]));
  if (sourceTable === "auth.users") {
    return {
      id: source.id,
      email: source.email,
      password_hash: source.encrypted_password ?? "",
      email_confirmed_at: source.email_confirmed_at,
      user_metadata: source.raw_user_meta_data ?? "{}",
      app_metadata: source.raw_app_meta_data ?? "{}",
      created_at: source.created_at,
      updated_at: source.updated_at,
      banned_until: source.banned_until,
      deleted_at: source.deleted_at,
      is_anonymous: sqliteValue("is_anonymous", source.is_anonymous ?? "f"),
    };
  }
  if (sourceTable === "auth.identities") {
    return {
      id: source.id,
      provider_id: source.provider_id,
      user_id: source.user_id,
      identity_data: source.identity_data ?? "{}",
      provider: source.provider,
      last_sign_in_at: source.last_sign_in_at,
      created_at: source.created_at,
      updated_at: source.updated_at,
    };
  }
  return Object.fromEntries(Object.entries(source).map(([column, value]) => [column, sqliteValue(column, value)]));
}

if (!existsSync(sourcePath)) throw new Error(`SQL backup not found: ${sourcePath}`);
if (existsSync(targetPath)) throw new Error(`SQLite database already exists; refusing to overwrite: ${targetPath}`);
if (existsSync(temporaryPath)) throw new Error(`Temporary import database already exists: ${temporaryPath}`);

const dump = readFileSync(sourcePath, "utf8").split(/\r?\n/);
const copyBlocks = new Map();
for (let index = 0; index < dump.length; index += 1) {
  const match = dump[index].match(/^COPY ([a-z_][a-z0-9_.]*) \(([^)]*)\) FROM stdin;$/i);
  if (!match || !tableMap.has(match[1])) continue;
  const rows = [];
  const columns = match[2].split(",").map((column) => column.trim().replace(/^"|"$/g, ""));
  for (index += 1; index < dump.length && dump[index] !== "\\."; index += 1) {
    if (dump[index]) rows.push(parseCopyRow(dump[index]));
  }
  copyBlocks.set(match[1], { columns, rows });
}

if (!copyBlocks.has("public.congregations") || !copyBlocks.has("auth.users")) {
  throw new Error("Backup is missing required congregation or user data sections.");
}

mkdirSync(dirname(targetPath), { recursive: true });
const schemaPath = resolve(process.cwd(), "database", "schema.sql");
const database = new DatabaseSync(temporaryPath);
const counts = new Map();
try {
  database.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = DELETE; PRAGMA busy_timeout = 5000;");
  database.exec(readFileSync(schemaPath, "utf8"));
  database.exec("BEGIN IMMEDIATE");
  const order = [
    "auth.users", "public.congregations", "auth.identities", "public.memberships",
    "public.membership_permission_overrides", "public.entries", "public.expenses",
    "public.headquarters_transfers", "public.monthly_closings", "public.audit_events",
    "public.documents", "public.financial_adjustments", "public.financial_reversals",
    "public.period_reopening_requests", "public.physical_cash_registers",
    "public.physical_cash_periods", "public.physical_cash_movements",
  ];
  for (const sourceTable of order) {
    const block = copyBlocks.get(sourceTable);
    if (!block) continue;
    const targetTable = tableMap.get(sourceTable);
    const tableColumns = new Set(database.prepare(`PRAGMA table_info("${targetTable}")`).all().map((column) => column.name));
    const columns = sourceTable.startsWith("auth.")
      ? Object.keys(mappedRow(sourceTable, block.columns, block.rows[0] ?? block.columns.map(() => null))).filter((column) => tableColumns.has(column))
      : block.columns.filter((column) => tableColumns.has(column));
    if (!columns.length) continue;
    const insert = database.prepare(
      `INSERT INTO "${targetTable}" (${columns.map((column) => `"${column}"`).join(", ")}) VALUES (${columns.map(() => "?").join(", ")})`,
    );
    for (const sourceValues of block.rows) {
      if (sourceValues.length !== block.columns.length) throw new Error(`Malformed COPY row in ${sourceTable}.`);
      const row = mappedRow(sourceTable, block.columns, sourceValues);
      insert.run(...columns.map((column) => row[column] ?? null));
    }
    counts.set(targetTable, block.rows.length);
  }
  const violations = database.prepare("PRAGMA foreign_key_check").all();
  if (violations.length) throw new Error(`Backup contains ${violations.length} broken application foreign-key reference(s).`);
  database.exec("COMMIT");
  database.exec("PRAGMA journal_mode = WAL;");
  database.close();
  renameSync(temporaryPath, targetPath);
} catch (error) {
  try { database.exec("ROLLBACK"); } catch {}
  database.close();
  rmSync(temporaryPath, { force: true });
  throw error;
}

console.log(`Imported application data into ${targetPath}`);
for (const [table, count] of counts) console.log(`${table}: ${count} rows`);
console.log("Authentication passwords remain hashed; no Supabase system schemas or secrets were executed or imported.");
