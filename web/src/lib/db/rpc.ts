import "server-only";

import { withAdminContext, withUserContext } from "@/lib/db/pool";

function functionCall(functionName: string, params: Record<string, unknown>) {
  if (!/^[a-z][a-z0-9_]*$/.test(functionName)) {
    throw new Error("invalid_database_function_name");
  }

  const entries = Object.entries(params);
  const namedArguments = entries.map(([name], index) => {
    if (!/^p_[a-z][a-z0-9_]*$/.test(name)) throw new Error("invalid_database_function_argument");
    return `${name} => $${index + 1}`;
  });
  return {
    text: `select to_jsonb(public.${functionName}(${namedArguments.join(", ")})) as result`,
    values: entries.map(([, value]) => value),
  };
}

export async function callUserFunction<T = unknown>(
  userId: string,
  functionName: string,
  params: Record<string, unknown>,
): Promise<T> {
  const call = functionCall(functionName, params);

  return withUserContext(userId, async (client) => {
    const result = await client.query<{ result: T }>(call.text, call.values);
    return result.rows[0]?.result;
  });
}

export async function callAdminFunction<T = unknown>(
  functionName: string,
  params: Record<string, unknown>,
): Promise<T> {
  const call = functionCall(functionName, params);
  return withAdminContext(async (client) => {
    const result = await client.query<{ result: T }>(call.text, call.values);
    return result.rows[0]?.result;
  });
}
