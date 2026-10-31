const statusLabels: Record<string, string> = {
  open: "Aberto",
  closed: "Fechado",
  pending: "Pendente",
  requested: "Pendente",
  approved: "Aprovado",
  confirmed: "Confirmado",
  sent: "Enviado",
  questioned: "Questionado",
  cancelled: "Cancelado",
};

const errorMessages: Record<string, string> = {
  closed_period_requires_reopening: "Este período está fechado. Reabra o período para realizar esta operação.",
  closed_period_requires_correction_or_reopening: "Este período está fechado. Reabra o período para realizar esta operação.",
  cash_insufficient_balance: "Saldo insuficiente no caixa para realizar esta saída.",
};

export function presentStatus(status: string | null | undefined, fallback = "Sem informação") {
  if (!status) return fallback;
  return statusLabels[status] ?? fallback;
}

export function presentError(error: unknown, fallback: string) {
  const technicalMessage = error instanceof Error ? error.message : String(error);
  console.error("[Ecclesia Finance] operação rejeitada:", technicalMessage);
  return errorMessages[technicalMessage] ?? fallback;
}
