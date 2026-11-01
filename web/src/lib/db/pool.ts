import "server-only";

import { Pool, types, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

let applicationPool: Pool | undefined;
let administrativePool: Pool | undefined;

types.setTypeParser(1082, (value) => value);

function createPool(connectionString: string | undefined, variableName: string) {
  if (!connectionString) throw new Error(`${variableName}_not_configured`);
  return new Pool({ connectionString, max: 10, idleTimeoutMillis: 30_000 });
}

function getApplicationPool() {
  applicationPool ??= createPool(process.env.DATABASE_URL, "DATABASE_URL");
  return applicationPool;
}

function getAdministrativePool() {
  administrativePool ??= createPool(process.env.DATABASE_ADMIN_URL, "DATABASE_ADMIN_URL");
  return administrativePool;
}

export function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  return getApplicationPool().query<T>(text, values);
}

export function adminQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  values: unknown[] = [],
): Promise<QueryResult<T>> {
  return getAdministrativePool().query<T>(text, values);
}

export async function withUserContext<T>(
  userId: string,
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getApplicationPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL ROLE authenticated");
    await client.query("SELECT set_config('request.jwt.claim.sub', $1, true)", [userId]);
    await client.query("SELECT set_config('request.jwt.claim.role', 'authenticated', true)");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Database transaction rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function withAdminTransaction<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getAdministrativePool().connect();
  try {
    await client.query("BEGIN");
    const result = await operation(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Administrative database rollback failed:", rollbackError);
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function withAdminContext<T>(
  operation: (client: PoolClient) => Promise<T>,
): Promise<T> {
  return withAdminTransaction(async (client) => {
    await client.query("SELECT set_config('request.jwt.claim.role', 'service_role', true)");
    await client.query("SELECT set_config('request.jwt.claims', '{\"role\":\"service_role\"}', true)");
    return operation(client);
  });
}
