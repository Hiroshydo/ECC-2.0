import { presentError } from "@/lib/presentation";

export async function postJson<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json() as { data?: T; error?: string };
  if (!response.ok) throw new Error(presentError(result.error, "Não foi possível concluir a operação."));
  return result.data as T;
}
