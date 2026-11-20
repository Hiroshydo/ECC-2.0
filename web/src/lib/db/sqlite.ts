import "server-only";

import { mkdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";

declare global {
  var eccSqliteDatabase: DatabaseSync | undefined;
}

export function getDatabasePath(): string {
  const configuredPath = process.env.ECC_SQLITE_PATH;
  if (configuredPath) return isAbsolute(configuredPath) ? configuredPath : resolve(/*turbopackIgnore: true*/ process.cwd(), configuredPath);
  const dataRoot = process.env.LOCALAPPDATA || process.cwd();
  return resolve(dataRoot, "ECC-2.0", "ecclesia.sqlite");
}

export function getDatabase(): DatabaseSync {
  if (globalThis.eccSqliteDatabase) return globalThis.eccSqliteDatabase;

  const databasePath = getDatabasePath();
  mkdirSync(dirname(databasePath), { recursive: true });
  const database = new DatabaseSync(databasePath);
  database.exec("PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;");
  database.exec(readFileSync(resolve(process.cwd(), "database", "schema.sql"), "utf8"));
  const transferColumns = new Set(
    (database.prepare("PRAGMA table_info(headquarters_transfers)").all() as Array<{ name: string }>).map((column) => column.name),
  );
  if (!transferColumns.has("amount_requested_cents")) {
    database.exec("ALTER TABLE headquarters_transfers ADD COLUMN amount_requested_cents INTEGER CHECK (amount_requested_cents > 0)");
  }
  if (!transferColumns.has("amount_approved_cents")) {
    database.exec("ALTER TABLE headquarters_transfers ADD COLUMN amount_approved_cents INTEGER CHECK (amount_approved_cents > 0)");
  }
  if (!transferColumns.has("approved_at")) {
    database.exec("ALTER TABLE headquarters_transfers ADD COLUMN approved_at TEXT");
  }
  database.exec(`
    UPDATE headquarters_transfers
    SET amount_requested_cents = amount_sent_cents
    WHERE amount_requested_cents IS NULL AND amount_sent_cents IS NOT NULL;
    UPDATE headquarters_transfers
    SET amount_approved_cents = amount_sent_cents,
        approved_at = coalesce(approved_at, created_at)
    WHERE status IN ('approved', 'sent', 'confirmed', 'questioned')
      AND amount_approved_cents IS NULL
      AND amount_sent_cents IS NOT NULL;
  `);
  globalThis.eccSqliteDatabase = database;
  return database;
}
