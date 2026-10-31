import { withUserContext } from "@/lib/db/pool";

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

export async function loadReportData(userId: string, congregationId: string, period: string, responsible: string | null): Promise<ReportData> {
  const { start, end } = periodBounds(period);
  const reportRows = await withUserContext(userId, async (client) => {
    const congregationResult = await client.query("select name, city from public.congregations where id = $1", [congregationId]);
    const summaryResult = await client.query(
      "select opening_balance, entries, expenses, transfers, adjustments, closing_balance, closing_status from public.congregation_monthly_summary where congregation_id = $1 and reference_period = $2",
      [congregationId, start],
    );
    const entriesResult = await client.query(
      "select occurred_on, category, origin, payment_method, purpose, amount_cents from public.entries where congregation_id = $1 and occurred_on between $2 and $3 order by occurred_on",
      [congregationId, start, end],
    );
    const expensesResult = await client.query(
      "select occurred_on, category, description, vendor, payment_method, purpose, cost_center, amount_cents, status from public.expenses where congregation_id = $1 and occurred_on between $2 and $3 order by occurred_on",
      [congregationId, start, end],
    );
    const transfersResult = await client.query(
      "select occurred_on, destination_name, reference_period, reason, amount_sent_cents, amount_received_cents, status from public.headquarters_transfers where origin_congregation_id = $1 and reference_period between $2 and $3 order by reference_period",
      [congregationId, start, end],
    );
    const adjustmentsResult = await client.query(
      "select created_at, reason, entity_type, amount_cents, created_by, status from public.financial_adjustments where congregation_id = $1 and reference_period = $2 order by created_at",
      [congregationId, start],
    );
    const reversalsResult = await client.query(
      "select created_at, entity_type, entity_id, reason, amount_cents, created_by, status from public.financial_reversals where congregation_id = $1 and reference_period = $2 order by created_at",
      [congregationId, start],
    );
    const closingsResult = await client.query(
      "select reference_period, status, closed_at as closing_at, submitted_by, approved_by from public.monthly_closings where congregation_id = $1 and reference_period = $2",
      [congregationId, start],
    );
    const cashPeriodsResult = await client.query(
      `select p.id, p.reference_period, p.opening_balance_cents, p.status, p.cash_register_id
         from public.physical_cash_periods p
         join public.physical_cash_registers r on r.id = p.cash_register_id
        where r.congregation_id = $1 and p.reference_period = $2`,
      [congregationId, start],
    );
    const auditsResult = await client.query(
      "select occurred_at, action, entity, entity_id, reason from public.audit_events where congregation_id = $1 and occurred_at >= $2 and occurred_at <= $3 order by occurred_at",
      [congregationId, `${start}T00:00:00Z`, `${end}T23:59:59Z`],
    );
    const cashPeriodIds = cashPeriodsResult.rows.map((item) => item.id);
    const cashMovementsResult = cashPeriodIds.length
      ? await client.query(
        "select created_at, movement_type, reason, amount_cents, cash_period_id from public.physical_cash_movements where cash_period_id = any($1::uuid[]) order by created_at",
        [cashPeriodIds],
      )
      : { rows: [] };
    return {
      congregation: congregationResult.rows[0] ?? null,
      summary: summaryResult.rows[0] ?? null,
      entries: entriesResult.rows,
      expenses: expensesResult.rows,
      transfers: transfersResult.rows,
      adjustments: adjustmentsResult.rows,
      reversals: reversalsResult.rows,
      closing: closingsResult.rows[0] ?? null,
      audit: auditsResult.rows,
      cashMovements: cashMovementsResult.rows,
    };
  });
  const summary = reportRows.summary;
  const closingBalance = summary?.closing_balance ?? 0;
  return {
    organization: "Ecclesia Finance",
    congregation: reportRows.congregation ?? { name: "Congregação", city: "" },
    period,
    generatedAt: new Date().toISOString(),
    responsible,
    summary: { openingBalance: summary?.opening_balance ?? 0, entries: summary?.entries ?? 0, expenses: summary?.expenses ?? 0, transfers: summary?.transfers ?? 0, adjustments: summary?.adjustments ?? 0, reversals: reportRows.reversals.reduce((total, item) => total + Number(item.amount_cents ?? 0), 0), closingBalance, status: summary?.closing_status ?? null },
    entries: reportRows.entries, expenses: reportRows.expenses, transfers: reportRows.transfers, adjustments: reportRows.adjustments, reversals: reportRows.reversals, cashMovements: reportRows.cashMovements, closing: reportRows.closing, audit: reportRows.audit,
  };
}