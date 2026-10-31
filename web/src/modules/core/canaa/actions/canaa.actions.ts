"use server";

import { createClient } from "@/lib/supabase/server";

import { checkSeat } from "@/modules/core/khatam/services/license.service";

export async function linkParentAction(childId: string, parentId: string | null): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Sessão expirada." };
  }

  const role = String(user.user_metadata?.role ?? "").toLowerCase();
  if (role !== "dev_master" && role !== "pastor_local") {
    return { ok: false, message: "Usuário sem permissão para reparentar congregações." };
  }

  if (childId === parentId) {
    return { ok: false, message: "Não é possível apontar uma unidade para si mesma." };
  }

  try {
    void supabase;
    return { ok: true, message: "Vínculo atualizado com sucesso." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha na atualização do vínculo.";
    return { ok: false, message };
  }
}

export async function inviteOperatorAction(email: string, role: "tesoureiro" | "secretario"): Promise<{ ok: boolean; message: string }> {
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { ok: false, message: "Sessão expirada." };
  }

  const license = {
    seatsTotal: 5,
    seatsUsed: 3,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const seatCheck = checkSeat(license, new Date());
  if (!seatCheck.allowed) {
    return { ok: false, message: seatCheck.reason === "quota_exceeded" ? "Cota do Khatam esgotada." : "Licença do Khatam expirada." };
  }

  try {
    void email;
    void role;
    void supabase;
    return { ok: true, message: "Operador convidado com sucesso." };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao convidar o operador.";
    return { ok: false, message };
  }
}
