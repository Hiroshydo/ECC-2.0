export type LicenseState =
  | "sem_licenca"
  | "ativa"
  | "expira_7d"
  | "expirada"
  | "assentos_cheios"
  | "bloqueada";

export type LicenseClassificationInput = {
  seatsUsed: number;
  seatsTotal: number | null;
  expiresAt: string | Date | null;
  status?: "active" | "grace_period" | "blocked" | null;
  now?: Date;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
// ASSUNÇÃO: a saúde da rede considera vencimento nos próximos 30 dias.
export const LICENSE_WARNING_WINDOW_DAYS = 30;

export function expiresWithinDays(expiresAt: string | Date | null, days: number, now = new Date()): boolean {
  if (expiresAt === null) return false;
  const expiration = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  const remaining = expiration.getTime() - now.getTime();
  return Number.isFinite(remaining) && remaining > 0 && remaining <= days * 24 * 60 * 60 * 1000;
}

export function classifyLicense({
  seatsUsed,
  seatsTotal,
  expiresAt,
  status,
  now = new Date(),
}: LicenseClassificationInput): LicenseState {
  if (status === "blocked") return "bloqueada";
  if (seatsTotal === null || expiresAt === null) return "sem_licenca";

  const expiration = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  if (status === "grace_period") return "expira_7d";
  if (Number.isNaN(expiration.getTime()) || expiration.getTime() <= now.getTime()) return "expirada";
  if (seatsUsed >= seatsTotal) return "assentos_cheios";
  if (expiration.getTime() - now.getTime() <= SEVEN_DAYS_MS) return "expira_7d";
  return "ativa";
}
