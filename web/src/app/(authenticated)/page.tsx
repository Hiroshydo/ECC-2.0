import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { can } from "@/domain/access";
import { getCurrentUser, getUserMemberships } from "@/lib/auth/session";
import { withUserContext } from "@/lib/db/pool";
import { presentStatus } from "@/lib/presentation";
import { getVocabulary } from "@/domain/vocabulary";
import { HierarchicalDashboard } from "@/components/HierarchicalDashboard";

export const dynamic = "force-dynamic";

type Summary = {
  opening_balance: number;
  entries: number;
  expenses: number;
  transfers: number;
  adjustments: number;
  closing_balance: number;
  closing_status: string | null;
};

type Movement = { id: string; occurred_on: string | null; reference_period?: string; amount_cents?: number; amount_sent_cents?: number; category?: string; description?: string; origin?: string; destination_name?: string };
type MonthlySummary = { reference_period: string; entries: number; expenses: number };
type EntryCategoryTotal = { category: string; amount_cents: number };

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const movementDate = (value: string | null | undefined) => {
  if (!value) return "Data não informada";
  const normalized = value.length === 10 ? `${value}T12:00:00Z` : value;
  return new Date(normalized).toLocaleDateString("pt-BR", { timeZone: "UTC" });
};

function currentPeriod() {
  const now = new Date();
  return {
    start: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10),
    end: new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).toISOString().slice(0, 10),
  };
}

function periodLabel(value: string) {
  const label = new Date(`${value}T12:00:00Z`).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const emptySummary: Summary = {
    opening_balance: 0,
    entries: 0,
    expenses: 0,
    transfers: 0,
    adjustments: 0,
    closing_balance: 0,
    closing_status: null,
  };
  const emptySixMonthFlow = Array.from({ length: 6 }, (_, index) => {
    const month = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 5 + index, 1));
    return { label: month.toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" }).replace(".", ""), entries: 0, expenses: 0 };
  });

  let dashboardError: string | null = null;
  let memberships: Awaited<ReturnType<typeof getUserMemberships>> = [];
  let activeMembership: Awaited<ReturnType<typeof getUserMemberships>>[number] | null = null;

  try {
    memberships = await getUserMemberships(user);
    const activeId = (await cookies()).get("active_congregation_id")?.value;
    activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0] ?? null;
  } catch (error) {
    console.error("Dashboard membership query failed:", error);
    dashboardError = "Não foi possível carregar as congregações do utilizador.";
  }

  const { start, end } = currentPeriod();
  const chartStart = new Date(Date.UTC(new Date(start).getUTCFullYear(), new Date(start).getUTCMonth() - 5, 1)).toISOString().slice(0, 10);

  let summary: Summary = emptySummary;
  let entries: Movement[] = [];
  let expenses: Movement[] = [];
  let transfers: Movement[] = [];
  let missingReceipts = 0;
  let pendingTransfersCount = 0;
  let monthlySummaries: MonthlySummary[] = [];
  let categoryTotals: EntryCategoryTotal[] = [];
  let chartData: FlowPoint[] = emptySixMonthFlow;
  let categoryComposition: CompositionSegment[] = [];

  if (activeMembership) {
    try {
      const dashboardData = await withUserContext(user.id, async (client) => {
        const [summaryResult, entriesResult, expensesResult, transfersResult, missingEntriesResult, missingExpensesResult, missingTransfersResult, pendingTransfersResult, monthlySummaryResult, categoryTotalsResult] = await Promise.all([
          client.query("select opening_balance, entries, expenses, transfers, adjustments, closing_balance, closing_status from public.congregation_monthly_summary where congregation_id = $1 and reference_period = $2", [activeMembership.congregationId, start]),
          client.query("select id, occurred_on, amount_cents, category, origin from public.entries where congregation_id = $1 and occurred_on between $2 and $3 order by occurred_on desc limit 5", [activeMembership.congregationId, start, end]),
          client.query("select id, occurred_on, amount_cents, category, description from public.expenses where congregation_id = $1 and occurred_on between $2 and $3 order by occurred_on desc limit 5", [activeMembership.congregationId, start, end]),
          client.query("select id, occurred_on, reference_period, amount_sent_cents, destination_name, status from public.headquarters_transfers where origin_congregation_id = $1 and reference_period between $2 and $3 order by reference_period desc limit 5", [activeMembership.congregationId, start, end]),
          client.query("select count(*)::integer as count from public.entries where congregation_id = $1 and occurred_on between $2 and $3 and receipt_id is null", [activeMembership.congregationId, start, end]),
          client.query("select count(*)::integer as count from public.expenses where congregation_id = $1 and occurred_on between $2 and $3 and receipt_id is null", [activeMembership.congregationId, start, end]),
          client.query("select count(*)::integer as count from public.headquarters_transfers where origin_congregation_id = $1 and reference_period between $2 and $3 and receipt_id is null", [activeMembership.congregationId, start, end]),
          client.query("select count(*)::integer as count from public.headquarters_transfers where origin_congregation_id = $1 and status = 'sent'", [activeMembership.congregationId]),
          client.query("select reference_period, entries, expenses from public.congregation_monthly_summary where congregation_id = $1 and reference_period between $2 and $3 order by reference_period", [activeMembership.congregationId, chartStart, start]),
          client.query("select category, amount_cents from public.congregation_monthly_entry_categories where congregation_id = $1 and reference_period = $2", [activeMembership.congregationId, start]),
        ]);
        return {
          summary: summaryResult.rows[0] ?? emptySummary,
          entries: entriesResult.rows,
          expenses: expensesResult.rows,
          transfers: transfersResult.rows,
          missingReceipts: missingEntriesResult.rows[0].count + missingExpensesResult.rows[0].count + missingTransfersResult.rows[0].count,
          pendingTransfersCount: pendingTransfersResult.rows[0].count,
          monthlySummaries: monthlySummaryResult.rows,
          categoryTotals: categoryTotalsResult.rows,
        };
      });
      summary = dashboardData.summary as Summary;
      entries = dashboardData.entries as Movement[];
      expenses = dashboardData.expenses as Movement[];
      transfers = dashboardData.transfers as Movement[];
      missingReceipts = dashboardData.missingReceipts;
      pendingTransfersCount = dashboardData.pendingTransfersCount;
      monthlySummaries = dashboardData.monthlySummaries as MonthlySummary[];
      categoryTotals = dashboardData.categoryTotals as EntryCategoryTotal[];

        chartData = Array.from({ length: 6 }, (_, index) => {
          const date = new Date(Date.UTC(new Date(start).getUTCFullYear(), new Date(start).getUTCMonth() - 5 + index, 1));
          const referencePeriod = date.toISOString().slice(0, 10);
          const summaryForMonth = monthlySummaries.find((item) => item.reference_period === referencePeriod);
          return { label: date.toLocaleDateString("pt-BR", { month: "short", timeZone: "UTC" }).replace(".", ""), entries: summaryForMonth?.entries ?? 0, expenses: summaryForMonth?.expenses ?? 0 };
        });

        const recurringCategories = ["tithe", "tithe_donation", "recurring_donation", "doacao_recorrente", "dizimo", "dizimos"];
        const freeCategories = ["offering", "donation", "campaign", "doacao_livre", "oferta", "ofertas", "campanha", "campanhas"];
        const normalizedCategory = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\s-]+/g, "_");
        const terms = getVocabulary(activeMembership.congregation.organizationType ?? "church");
        categoryComposition = [
          { label: terms.recurringIncome, value: categoryTotals.filter((item) => recurringCategories.includes(normalizedCategory(item.category))).reduce((sum, item) => sum + item.amount_cents, 0), color: "#059669" },
          { label: terms.freeIncome, value: categoryTotals.filter((item) => freeCategories.includes(normalizedCategory(item.category))).reduce((sum, item) => sum + item.amount_cents, 0), color: "#0f766e" },
          { label: "Outros", value: categoryTotals.filter((item) => !recurringCategories.includes(normalizedCategory(item.category)) && !freeCategories.includes(normalizedCategory(item.category))).reduce((sum, item) => sum + item.amount_cents, 0), color: "#94a3b8" },
        ];
    } catch (error) {
      console.error("Dashboard financial queries failed:", error);
      dashboardError = dashboardError ?? "Não foi possível carregar os dados financeiros desta congregação.";
      summary = emptySummary;
      entries = [];
      expenses = [];
      transfers = [];
      missingReceipts = 0;
      pendingTransfersCount = 0;
      chartData = emptySixMonthFlow;
      categoryComposition = [];
    }
  }

  if (!activeMembership) {
    return (
      <section className="module-page">
        {dashboardError && <div className="notice warning">{dashboardError}</div>}
        <p className="eyebrow">ACESSO</p>
        <h1>Dashboard</h1>
        <p>Seu usuário não possui uma congregação ativa ou a base de dados não respondeu corretamente.</p>
      </section>
    );
  }

  const terms = getVocabulary(activeMembership.congregation.organizationType ?? "church");
  const recent = [...entries.map((item) => ({ ...item, kind: "Entrada", title: item.category ?? "Entrada", detail: item.origin ?? "Entrada registrada", amount: item.amount_cents ?? 0 })), ...expenses.map((item) => ({ ...item, kind: "Despesa", title: item.description ?? item.category ?? "Despesa", detail: item.category ?? "Despesa registrada", amount: -(item.amount_cents ?? 0) })), ...transfers.map((item) => ({ ...item, kind: "Repasse", title: item.destination_name ?? "Repasse", detail: "Repasse administrativo", amount: -(item.amount_sent_cents ?? 0) }))].sort((left, right) => String(right.occurred_on ?? right.reference_period).localeCompare(String(left.occurred_on ?? left.reference_period))).slice(0, 5);
  const canWrite = can(activeMembership, "financial.write");
  const canReadConsolidated = can(activeMembership, "hierarchy.financial.read");

  return (
    <section className="dashboard-page">
      {dashboardError && <div className="notice warning">{dashboardError}</div>}
      <div className="dashboard-topbar">
        <div className="heading"><div><p className="eyebrow">{periodLabel(start)}</p><h1>Dashboard</h1><p>{activeMembership.congregation.name} · acompanhe a prestação de contas da {terms.unitSingular.toLocaleLowerCase("pt-BR")} ativa.</p></div></div>
        <HierarchicalDashboard unitId={activeMembership.congregationId} unitName={activeMembership.congregation.name} startDate={start} endDate={end} localBalance={summary.closing_balance} localIncome={summary.entries} localExpenses={summary.expenses} localTransfers={summary.transfers} canReadConsolidated={canReadConsolidated} incomeLabel={terms.dashboardEntries}/>
      </div>
      <div className="analytics-grid"><section className="panel analytics-panel"><div className="panel-title"><div><h2>Fluxo de caixa</h2><p>Entradas e despesas · últimos 6 meses</p></div><div className="chart-legend"><span><i className="legend-entry"/>Entradas</span><span><i className="legend-expense"/>Despesas</span></div></div><CashFlowChart data={chartData}/></section><section className="panel analytics-panel"><div className="panel-title"><div><h2>Composição das entradas</h2><p>{periodLabel(start)} · distribuição por categoria</p></div></div><EntryCompositionChart data={categoryComposition.length ? categoryComposition : [{ label: terms.freeIncome, value: 0, color: "#059669" }, { label: "Outros", value: 0, color: "#94a3b8" }]}/></section></div>
      <div className="dashboard-grid"><section className="panel"><div className="panel-title"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><ModuleIcon module="elias" variant="icon" size={28} decorative /><div><h2>Fechamento do período</h2><p>Resumo publicado pelo backend financeiro.</p></div></div><span className="pill">{presentStatus(summary?.closing_status, "Sem fechamento")}</span></div>{summary ? <div className="equation"><Row label="Saldo inicial" value={summary.opening_balance}/><Row label="+ Entradas" value={summary.entries} positive/><Row label="- Despesas" value={-summary.expenses}/><Row label="- Repasses" value={-summary.transfers}/><Row label="+ Ajustes" value={summary.adjustments} positive/><div className="total"><b>= Saldo atual</b><strong>{money(summary.closing_balance)}</strong></div></div> : <EmptyState text="Ainda não há resumo financeiro para este período."/>}</section><section className="panel"><div className="panel-title"><div><h2>Atenção necessária</h2><p>Itens identificados nos registros reais.</p></div></div><ul className="attention"><li><span className="signal amber">!</span><div><b>{missingReceipts} comprovante(s) ausente(s)</b><small>Entradas, despesas e repasses sem documento vinculado</small></div></li><li><span className="signal blue">↗</span><div><b>{pendingTransfersCount} repasse(s) enviado(s)</b><small>Aguardando confirmação do destino</small></div></li></ul></section></div>
      <section className="panel recent-panel"><div className="panel-title"><div><h2>Últimos lançamentos</h2><p>Registros mais recentes da congregação ativa.</p></div></div>{recent.length ? recent.map((item) => <article className="movement" key={`${item.kind}-${item.id}`}><time>{movementDate(item.occurred_on ?? item.reference_period)}</time><div className="movement-copy"><b>{item.title}</b><small>{item.detail}</small></div><span className={`movement-type ${item.kind.toLowerCase()}`}>{item.kind}</span><strong className={item.amount >= 0 ? "amount-in" : "amount-out"}>{item.amount < 0 ? "−" : "+"} {money(Math.abs(item.amount))}</strong></article>) : <EmptyState text={`Nenhuma movimentação registrada em ${periodLabel(start)}`} description="Inicie o movimento financeiro da congregação lançando uma entrada ou abrindo o caixa do mês." showQuickActions={canWrite}/>}</section>
    </section>
  );
}

type FlowPoint = { label: string; entries: number; expenses: number };
type CompositionSegment = { label: string; value: number; color: string };

function CashFlowChart({ data }: { data: FlowPoint[] }) {
  const chartHeight = 150;
  const baseline = 174;
  const maximum = Math.max(1, ...data.flatMap((item) => [item.entries, item.expenses]));

  return <div className="cash-flow-chart"><svg viewBox="0 0 640 220" role="img" aria-label="Gráfico de barras comparando entradas e despesas nos últimos seis meses">
    {[0, 1, 2, 3].map((line) => {
      const y = baseline - (chartHeight / 3) * line;
      return <line key={line} x1="30" x2="620" y1={y} y2={y} className="chart-gridline"/>;
    })}
    {data.map((item, index) => {
      const groupX = 48 + index * 96;
      const entryHeight = item.entries ? Math.max(2, item.entries / maximum * chartHeight) : 0;
      const expenseHeight = item.expenses ? Math.max(2, item.expenses / maximum * chartHeight) : 0;
      return <g key={item.label}>
        <rect x={groupX} y={baseline - entryHeight} width="22" height={entryHeight} rx="5" className="chart-bar-entry"/>
        <rect x={groupX + 28} y={baseline - expenseHeight} width="22" height={expenseHeight} rx="5" className="chart-bar-expense"/>
        <text x={groupX + 25} y="202" textAnchor="middle" className="chart-axis-label">{item.label}</text>
      </g>;
    })}
  </svg></div>;
}

function EntryCompositionChart({ data }: { data: CompositionSegment[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  let accumulated = 0;

  return <div className="composition-chart">
    <div className="donut-wrap"><svg viewBox="0 0 120 120" role="img" aria-label={`Composição das entradas: ${money(total)}`}>
      <circle cx="60" cy="60" r={radius} className="donut-track"/>
      {total > 0 && data.filter((item) => item.value > 0).map((item) => {
        const length = item.value / total * circumference;
        const offset = accumulated;
        accumulated += length;
        return <circle key={item.label} cx="60" cy="60" r={radius} fill="none" stroke={item.color} strokeWidth="13" strokeDasharray={`${length} ${circumference - length}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)"/>;
      })}
      <text x="60" y="57" textAnchor="middle" className="donut-total">{money(total)}</text>
      <text x="60" y="70" textAnchor="middle" className="donut-caption">Entradas</text>
    </svg></div>
    <ul className="composition-legend">{data.map((item) => <li key={item.label}><span className="composition-label"><i style={{ backgroundColor: item.color }}/>{item.label}</span><strong>{money(item.value)}</strong><small>{total ? `${Math.round(item.value / total * 100)}%` : "0%"}</small></li>)}</ul>
  </div>;
}

function Row({ label, value, positive = false }: { label: string; value: number; positive?: boolean }) { return <div className="row"><span>{label}</span><b className={positive ? "positive" : ""}>{money(value)}</b></div>; }
function EmptyState({ text, description = "O dashboard não cria dados; ele apenas apresenta o que existe no PostgreSQL local.", showQuickActions = false }: { text: string; description?: string; showQuickActions?: boolean }) {
  return <div className="empty-state"><strong>{text}</strong><span>{description}</span>{showQuickActions && <nav className="quick-actions" aria-label="Ações rápidas"><Link className="quick-action primary" href="/entradas"><span aria-hidden="true">+</span> Nova Entrada</Link><Link className="quick-action secondary" href="/despesas"><span aria-hidden="true">+</span> Nova Despesa</Link><Link className="quick-action tertiary" href="/caixa">Abrir Caixa</Link></nav>}</div>;
}
