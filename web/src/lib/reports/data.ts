import type { SupabaseClient } from "@supabase/supabase-js";

export type ReportData = {
  organization: string;
  congregation: { name: string; city: string };
  period: string;
  generatedAt: string;
  responsible: string | null;
  summary: { openingBalance: number; entries: number; expenses: number; transfers: number; adjustments: number; reversals: number; closingBalance: number; status: string | null };
  entries: Array<Record<string, unknown>>;
  expenses: Array<Record<string, unknown>>;
  transfers: Array<Record<string, unknown>>;
  adjustments: Array<Record<string, unknown>>;
  reversals: Array<Record<string, unknown>>;
  cashMovements: Array<Record<string, unknown>>;
  closing: Record<string, unknown> | null;
  audit: Array<Record<string, unknown>>;
};

export function periodBounds(period: string) {
  const [year, month] = period.split("-").map(Number);
  const start = `${period}-01`;
  const end = new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
  return { start, end };
}

export async function loadReportData(supabase: SupabaseClient, congregationId: string, period: string, responsible: string | null): Promise<ReportData> {
  const { start, end } = periodBounds(period);
  const [congregationResult, summaryResult, entriesResult, expensesResult, transfersResult, adjustmentsResult, reversalsResult, closingsResult, auditsResult, cashPeriodsResult] = await Promise.all([
    supabase.from("congregations").select("name, city").eq("id", congregationId).maybeSingle(),
    supabase.from("congregation_monthly_summary").select("opening_balance, entries, expenses, transfers, adjustments, closing_balance, closing_status").eq("congregation_id", congregationId).eq("reference_period", start).maybeSingle(),
    supabase.from("entries").select("occurred_on, category, origin, payment_method, purpose, amount_cents").eq("congregation_id", congregationId).gte("occurred_on", start).lte("occurred_on", end).order("occurred_on"),
    supabase.from("expenses").select("occurred_on, category, description, vendor, payment_method, purpose, cost_center, amount_cents, status").eq("congregation_id", congregationId).gte("occurred_on", start).lte("occurred_on", end).order("occurred_on"),
    supabase.from("headquarters_transfers").select("occurred_on, destination_name, reference_period, reason, amount_sent_cents, amount_received_cents, status").eq("origin_congregation_id", congregationId).gte("reference_period", start).lte("reference_period", end).order("reference_period"),
    supabase.from("financial_adjustments").select("created_at, reason, entity_type, amount_cents, created_by, status").eq("congregation_id", congregationId).eq("reference_period", start).order("created_at"),
    supabase.from("financial_reversals").select("created_at, entity_type, entity_id, reason, amount_cents, created_by, status").eq("congregation_id", congregationId).eq("reference_period", start).order("created_at"),
    supabase.from("monthly_closings").select("reference_period, status, closing_at:closed_at, submitted_by, approved_by").eq("congregation_id", congregationId).eq("reference_period", start).maybeSingle(),
    supabase.from("audit_events").select("occurred_at, action, entity, entity_id, reason").eq("congregation_id", congregationId).gte("occurred_at", `${start}T00:00:00Z`).lte("occurred_at", `${end}T23:59:59Z`).order("occurred_at"),
    supabase.from("physical_cash_periods").select("id, reference_period, opening_balance_cents, status, cash_register_id").eq("reference_period", start),
  ]);
  const results = [congregationResult, summaryResult, entriesResult, expensesResult, transfersResult, adjustmentsResult, reversalsResult, closingsResult, auditsResult, cashPeriodsResult];
  const failed = results.find((result) => result.error);
  if (failed?.error) throw new Error(failed.error.message);
  const cashPeriodIds = (cashPeriodsResult.data ?? []).map((item) => item.id);
  const cashMovementsResult = cashPeriodIds.length ? await supabase.from("physical_cash_movements").select("created_at, movement_type, reason, amount_cents, cash_period_id").in("cash_period_id", cashPeriodIds).order("created_at") : { data: [], error: null };
  if (cashMovementsResult.error) throw new Error(cashMovementsResult.error.message);
  const summary = summaryResult.data;
  const closingBalance = summary?.closing_balance ?? 0;
  return {
    organization: "Ecclesia Finance",
    congregation: congregationResult.data ?? { name: "Congregação", city: "" },
    period,
    generatedAt: new Date().toISOString(),
    responsible,
    summary: { openingBalance: summary?.opening_balance ?? 0, entries: summary?.entries ?? 0, expenses: summary?.expenses ?? 0, transfers: summary?.transfers ?? 0, adjustments: summary?.adjustments ?? 0, reversals: (reversalsResult.data ?? []).reduce((total, item) => total + Number(item.amount_cents ?? 0), 0), closingBalance, status: summary?.closing_status ?? null },
    entries: entriesResult.data ?? [], expenses: expensesResult.data ?? [], transfers: transfersResult.data ?? [], adjustments: adjustmentsResult.data ?? [], reversals: reversalsResult.data ?? [], cashMovements: cashMovementsResult.data ?? [], closing: closingsResult.data, audit: auditsResult.data ?? [],
  };
}