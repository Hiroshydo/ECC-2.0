const BUSINESS_TIME_ZONE = "America/Sao_Paulo";

export function getCurrentBusinessDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    month: "2-digit",
    timeZone: BUSINESS_TIME_ZONE,
    year: "numeric",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const { year, month, day } = values;
  if (!year || !month || !day) {
    throw new Error("Não foi possível determinar a data do fuso de negócio.");
  }
  return `${year}-${month}-${day}`;
}

export function getCurrentBusinessPeriod(now = new Date()): string {
  return `${getCurrentBusinessDate(now).slice(0, 7)}-01`;
}

export function getBusinessPeriodBounds(date = getCurrentBusinessDate()): { start: string; end: string } {
  const [year, month] = date.split("-").map(Number);
  if (!year || !month || month > 12) {
    throw new Error(`Período de negócio inválido: ${date}`);
  }
  return {
    start: `${date.slice(0, 7)}-01`,
    end: new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10),
  };
}
