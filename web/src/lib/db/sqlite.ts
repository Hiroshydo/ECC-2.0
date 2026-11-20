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
  globalThis.eccSqliteDatabase = database;
  return database;
}
