import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { can } from "@/domain/access";
import { createClient } from "@/lib/supabase/server";
import { toMemberships } from "@/lib/auth/session";
import { presentStatus } from "@/lib/presentation";
import { getVocabulary } from "@/domain/vocabulary";
import { HierarchicalDashboard } from "@/components/HierarchicalDashboard";
import { AlertTriangle, ArrowLeftRight, Landmark, ReceiptText } from "lucide-react";

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

function currentPeriod(value?: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(value ?? "");
  const parsedYear = match ? Number(match[1]) : NaN;
  const parsedMonth = match ? Number(match[2]) : NaN;
  const isValid = Number.isInteger(parsedYear) && Number.isInteger(parsedMonth) && parsedMonth >= 1 && parsedMonth <= 12;
  const year = isValid ? parsedYear : new Date().getUTCFullYear();
  const month = isValid ? parsedMonth : new Date().getUTCMonth() + 1;
  const now = new Date();
  const selected = value !== undefined;
  const invalid = selected && !isValid;
  return {
    start: new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10),
    end: new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10),
    invalid,
    current: !selected && !invalid ? now.toISOString().slice(0, 7) : `${year}-${String(month).padStart(2, "0")}`,
  };
}

function periodLabel(value: string) {
  const label = new Date(`${value}T12:00:00Z`).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });
  return label.charAt(0).toLocaleUpperCase("pt-BR") + label.slice(1);
}

export default async function Home({ searchParams }: { searchParams: Promise<{ period?: string | string[] }> }) {
  const params = await searchParams;
  const periodParam = typeof params.period === "string" ? params.period : undefined;
  const selectedPeriod = currentPeriod(periodParam);
  const supabase = await createClient();
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
  let memberships: ReturnType<typeof toMemberships> = [];
  let activeMembership: ReturnType<typeof toMemberships>[number] | null = null;

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    console.error("Dashboard auth validation failed:", authError);
    dashboardError = "Não foi possível validar o acesso ao dashboard.";
  } else if (!user) {
    redirect("/login");
  } else {
    try {
      const { data: membershipRows, error: membershipError } = await supabase
        .from("memberships")
        .select("congregation_id, role, congregations(id, name, city, state, active, organization_type, is_headquarters), permission_overrides:membership_permission_overrides(financial_read, financial_write, financial_approve, closing_submit, audit_read, hierarchy_view, hierarchy_financial_read)")
        .eq("user_id", user.id);

      if (membershipError) {
        console.error("Dashboard membership query failed:", membershipError);
        dashboardError = "Não foi possível carregar as congregações do utilizador.";
      } else {
        memberships = toMemberships(user, membershipRows ?? []);
        const activeId = (await cookies()).get("active_congregation_id")?.value;
        activeMembership = memberships.find((membership) => membership.congregationId === activeId) ?? memberships[0] ?? null;
      }
    } catch (error) {
      console.error("Dashboard membership load failed:", error);
      dashboardError = "Não foi possível carregar as congregações do utilizador.";
    }
  }

  const { start, end } = selectedPeriod;
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
      const [summaryResult, entriesResult, expensesResult, transfersResult, missingEntriesResult, missingExpensesResult, missingTransfersResult, pendingTransfersResult, monthlySummaryResult, categoryTotalsResult] = await Promise.all([
        supabase.from("congregation_monthly_summary").select("opening_balance, entries, expenses, transfers, adjustments, closing_balance, closing_status").eq("congregation_id", activeMembership.congregationId).eq("reference_period", start).maybeSingle(),
        supabase.from("entries").select("id, occurred_on, amount_cents, category, origin").eq("congregation_id", activeMembership.congregationId).gte("occurred_on", start).lte("occurred_on", end).order("occurred_on", { ascending: false }).limit(5),
        supabase.from("expenses").select("id, occurred_on, amount_cents, category, description").eq("congregation_id", activeMembership.congregationId).gte("occurred_on", start).lte("occurred_on", end).order("occurred_on", { ascending: false }).limit(5),
        supabase.from("headquarters_transfers").select("id, occurred_on, reference_period, amount_sent_cents, destination_name, status").eq("origin_congregation_id", activeMembership.congregationId).gte("reference_period", start).lte("reference_period", end).order("reference_period", { ascending: false }).limit(5),
        supabase.from("entries").select("id", { count: "exact", head: true }).eq("congregation_id", activeMembership.congregationId).gte("occurred_on", start).lte("occurred_on", end).is("receipt_id", null),
        supabase.from("expenses").select("id", { count: "exact", head: true }).eq("congregation_id", activeMembership.congregationId).gte("occurred_on", start).lte("occurred_on", end).is("receipt_id", null),
        supabase.from("headquarters_transfers").select("id", { count: "exact", head: true }).eq("origin_congregation_id", activeMembership.congregationId).gte("reference_period", start).lte("reference_period", end).is("receipt_id", null),
        supabase.from("headquarters_transfers").select("id", { count: "exact", head: true }).eq("origin_congregation_id", activeMembership.congregationId).eq("status", "sent"),
        supabase.from("congregation_monthly_summary").select("reference_period, entries, expenses").eq("congregation_id", activeMembership.congregationId).gte("reference_period", chartStart).lte("reference_period", start).order("reference_period", { ascending: true }),
        supabase.from("congregation_monthly_entry_categories").select("category, amount_cents").eq("congregation_id", activeMembership.congregationId).eq("reference_period", start),
      ]);

      const failedQuery = [summaryResult, entriesResult, expensesResult, transfersResult, missingEntriesResult, missingExpensesResult, missingTransfersResult, pendingTransfersResult, monthlySummaryResult, categoryTotalsResult].find((result) => result.error);
      if (failedQuery?.error) {
        console.error("Dashboard data query failed:", failedQuery.error);
        dashboardError = dashboardError ?? "Não foi possível carregar os dados financeiros.";
      } else {
        summary = (summaryResult.data ?? emptySummary) as Summary;
        entries = (entriesResult.data ?? []) as Movement[];
        expenses = (expensesResult.data ?? []) as Movement[];
        transfers = (transfersResult.data ?? []) as Movement[];
        missingReceipts = (missingEntriesResult.count ?? 0) + (missingExpensesResult.count ?? 0) + (missingTransfersResult.count ?? 0);
        pendingTransfersCount = pendingTransfersResult.count ?? 0;
        monthlySummaries = (monthlySummaryResult.data ?? []) as MonthlySummary[];
        categoryTotals = (categoryTotalsResult.data ?? []) as EntryCategoryTotal[];

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
      }
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
  const recentCategory = (category: string | undefined) => {
    if (!category) return "Entrada";
    const normalized = category.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[\s-]+/g, "_");
    if (["tithe", "tithe_donation", "recurring_donation", "doacao_recorrente", "dizimo", "dizimos"].includes(normalized)) return terms.recurringIncome;
    if (["offering", "doacao_livre", "oferta", "ofertas"].includes(normalized)) return terms.freeIncome;
    if (["campaign", "campanha", "campanhas"].includes(normalized)) return terms.campaigns;
    if (["donation", "doacao"].includes(normalized)) return activeMembership.congregation.organizationType === "ong" ? terms.recurringIncome : "Doação";
    if (["other", "outra", "outro"].includes(normalized)) return activeMembership.congregation.organizationType === "ong" ? terms.freeIncome : "Outra";
    if (["event", "evento"].includes(normalized)) return terms.gathering;
    return category;
  };
  const recent = [...entries.map((item) => ({ ...item, kind: "Entrada", title: recentCategory(item.category), detail: item.origin ?? "Entrada registrada", amount: item.amount_cents ?? 0 })), ...expenses.map((item) => ({ ...item, kind: "Despesa", title: item.description ?? item.category ?? "Despesa", detail: item.category ?? "Despesa registrada", amount: -(item.amount_cents ?? 0) })), ...transfers.map((item) => ({ ...item, kind: "Repasse", title: item.destination_name ?? "Repasse", detail: "Repasse administrativo", amount: -(item.amount_sent_cents ?? 0) }))].sort((left, right) => String(right.occurred_on ?? right.reference_period).localeCompare(String(left.occurred_on ?? left.reference_period))).slice(0, 5);
  const canWrite = can(activeMembership, "financial.write");
  const canReadConsolidated = can(activeMembership, "hierarchy.financial.read");

  return (
    <section className="dashboard-page">
      {dashboardError && <div className="notice warning">{dashboardError}</div>}
      {selectedPeriod.invalid && <div className="notice warning" role="status">O período informado é inválido. Exibindo o mês atual.</div>}
      <div className="dashboard-topbar">
        <div className="heading"><div><p className="eyebrow">{periodLabel(start)}</p><h1>Dashboard</h1><p>{activeMembership.congregation.name} · acompanhe a prestação de contas da {terms.unitSingular.toLocaleLowerCase("pt-BR")} ativa.</p></div><form className="dashboard-period-filter" method="get"><label htmlFor="dashboard-period">Período</label><div><input id="dashboard-period" name="period" type="month" value={selectedPeriod.current} max={new Date().toISOString().slice(0, 7)} /><button type="submit">Aplicar</button></div></form></div>
        <HierarchicalDashboard unitId={activeMembership.congregationId} unitName={activeMembership.congregation.name} startDate={start} endDate={end} localBalance={summary.closing_balance} localIncome={summary.entries} localExpenses={summary.expenses} localTransfers={summary.transfers} canWrite={canWrite} canReadConsolidated={canReadConsolidated} incomeLabel={terms.dashboardEntries}/>
      </div>
      <div className="analytics-grid"><section className="panel analytics-panel"><div className="panel-title"><div><h2>Fluxo de caixa</h2><p>Entradas e despesas · últimos 6 meses</p></div><div className="chart-legend"><span><i className="legend-entry"/>Entradas</span><span><i className="legend-expense"/>Despesas</span></div></div><CashFlowChart data={chartData}/></section><section className="panel analytics-panel"><div className="panel-title"><div><h2>Composição das entradas</h2><p>{periodLabel(start)} · distribuição por categoria</p></div></div><EntryCompositionChart data={categoryComposition.length ? categoryComposition : [{ label: terms.freeIncome, value: 0, color: "#059669" }, { label: "Outros", value: 0, color: "#94a3b8" }]}/></section></div>
      <div className="dashboard-grid">
        <section className="panel closing-summary">
          <div className="panel-title closing-summary-header">
            <div className="panel-heading">
              <span className="panel-heading-icon" aria-hidden="true"><Landmark size={18}/></span>
              <div><h2>Fechamento do período</h2><p>Resumo publicado pelo backend financeiro.</p></div>
            </div>
            <Link className="pill closing-status-link" href={`/fechamento?period=${selectedPeriod.current}`} title={summary.closing_status === "closed" ? "Período fechado. Acesse para consultar o fechamento." : "Acesse para conferir o status e as ações disponíveis para este período."} aria-label={`Status ${presentStatus(summary?.closing_status, "Sem fechamento")}. Abrir fechamento do período.`}>{presentStatus(summary?.closing_status, "Sem fechamento")}</Link>
          </div>
          {summary ? <div className="equation">
            <Row label="Saldo inicial" value={summary.opening_balance}/>
            <Row label="+ Entradas" value={summary.entries} positive/>
            <Row label="- Despesas" value={-summary.expenses}/>
            <Row label="- Repasses" value={-summary.transfers}/>
            <Row label="+ Ajustes" value={summary.adjustments} positive/>
            <div className="total"><b>= Saldo atual</b><strong>{money(summary.closing_balance)}</strong></div>
          </div> : <EmptyState text="Ainda não há resumo financeiro para este período."/>}
        </section>
        <section className="panel attention-panel">
          <div className="panel-title">
            <div className="panel-heading">
              <span className="panel-heading-icon attention-heading-icon" aria-hidden="true"><AlertTriangle size={18}/></span>
              <div><h2>Atenção necessária</h2><p>Itens identificados nos registros reais.</p></div>
            </div>
          </div>
          <ul className="attention">
            <li>
              <span className={`attention-icon ${missingReceipts ? "warning" : "clear"}`} aria-hidden="true"><ReceiptText size={17}/></span>
              <div><b>{missingReceipts === 1 ? "1 comprovante ausente" : `${missingReceipts} comprovantes ausentes`}</b><small>{missingReceipts ? "Entradas, despesas e repasses sem documento vinculado" : "Todos os registros têm comprovante vinculado."}</small></div>
              {missingReceipts ? <details className="attention-count-menu"><summary className="attention-count has-items" aria-label="Escolher lista para revisar comprovantes ausentes">{missingReceipts}</summary><div className="attention-shortcuts" aria-label="Listas para revisar"><Link href="/entradas">Entradas</Link><Link href="/despesas">Despesas</Link><Link href="/repasses">Repasses</Link></div></details> : <span className="attention-count">{missingReceipts}</span>}
            </li>
            <li>
              <span className="attention-icon transfer" aria-hidden="true"><ArrowLeftRight size={17}/></span>
              <div><b>{pendingTransfersCount === 1 ? "1 repasse pendente" : `${pendingTransfersCount} repasses pendentes`}</b><small>{pendingTransfersCount ? "Aguardando confirmação do destino" : "Nenhum repasse aguarda confirmação."}</small></div>
              {pendingTransfersCount ? <Link className="attention-count has-items" href="/repasses" aria-label="Ver repasses pendentes">{pendingTransfersCount}</Link> : <span className="attention-count">{pendingTransfersCount}</span>}
            </li>
          </ul>
        </section>
      </div>
      <section className="panel recent-panel">
        <div className="panel-title recent-panel-title"><div><h2>Últimos lançamentos</h2><p>Registros mais recentes da congregação ativa.</p></div></div>
        {recent.length ? recent.map((item) => <article className="movement" key={`${item.kind}-${item.id}`}><time>{movementDate(item.occurred_on ?? item.reference_period)}</time><div className="movement-copy"><b>{item.title}</b><small>{item.detail}</small></div><span className={`movement-type ${item.kind.toLowerCase()}`}>{item.kind}</span><strong className={item.amount >= 0 ? "amount-in" : "amount-out"}>{item.amount < 0 ? "−" : "+"} {money(Math.abs(item.amount))}</strong></article>) : <EmptyState text={`Nenhuma movimentação registrada em ${periodLabel(start)}`} description="Inicie o movimento financeiro da congregação lançando uma entrada ou abrindo o caixa do mês." showQuickActions={canWrite}/>}
      </section>
    </section>
  );
}

type FlowPoint = { label: string; entries: number; expenses: number };
type CompositionSegment = { label: string; value: number; color: string };

function CashFlowChart({ data }: { data: FlowPoint[] }) {
  const chartHeight = 150;
  const baseline = 174;
  const maximum = Math.max(1, ...data.flatMap((item) => [item.entries, item.expenses]));
  const hasActivity = data.some((item) => item.entries > 0 || item.expenses > 0);
  const previousMonthsAreEmpty = data.length > 1 && data.slice(0, -1).every((item) => item.entries === 0 && item.expenses === 0);

  return <div className={`cash-flow-chart${hasActivity ? "" : " is-empty"}`}><svg viewBox="0 0 640 220" role="img" aria-label="Gráfico de barras comparando entradas e despesas nos últimos seis meses">
    {[0, 1, 2, 3].map((line) => {
      const y = baseline - (chartHeight / 3) * line;
      return <line key={line} x1="30" x2="620" y1={y} y2={y} className="chart-gridline"/>;
    })}
    {!hasActivity && <g aria-hidden="true"><rect x="128" y="74" width="384" height="48" rx="12" className="chart-empty-backdrop"/><text x="320" y="103" textAnchor="middle" className="chart-empty-label">Nenhuma movimentação nos últimos seis meses</text></g>}
    {hasActivity && previousMonthsAreEmpty && <g aria-hidden="true"><rect x="68" y="76" width="392" height="44" rx="11" className="chart-empty-backdrop"/><text x="264" y="103" textAnchor="middle" className="chart-empty-label">Sem movimentações nos meses anteriores</text></g>}
    {data.map((item, index) => {
      const groupX = 48 + index * 96;
      const entryHeight = item.entries ? Math.max(2, item.entries / maximum * chartHeight) : 0;
      const expenseHeight = item.expenses ? Math.max(2, item.expenses / maximum * chartHeight) : 0;
      return <g key={item.label}>
        {!entryHeight && !expenseHeight && <circle cx={groupX + 25} cy={baseline} r="2.5" className="chart-zero-marker"/>}
        <rect x={groupX} y={baseline - entryHeight} width="22" height={entryHeight} rx="5" className="chart-bar-entry"/>
        <rect x={groupX + 28} y={baseline - expenseHeight} width="22" height={expenseHeight} rx="5" className="chart-bar-expense"/>
        <text x={groupX + 25} y="202" textAnchor="middle" className="chart-axis-label">{item.label}</text>
      </g>;
    })}
  </svg></div>;
}

function EntryCompositionChart({ data }: { data: CompositionSegment[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return <div className="composition-chart composition-bars" role="group" aria-label={`Composição das entradas: ${money(total)}`}>
    <div className="composition-total"><span>Total de entradas</span><strong>{money(total)}</strong></div>
    <ul className="composition-legend">{data.map((item) => {
      const percentage = total ? item.value / total * 100 : 0;
      return <li key={item.label}>
        <div className="composition-row-header">
          <span className="composition-label"><i style={{ backgroundColor: item.color }}/>{item.label}</span>
          <strong>{money(item.value)}</strong>
          <small>{Math.round(percentage)}%</small>
        </div>
        <div className="composition-bar-track" aria-hidden="true"><span className="composition-bar-fill" style={{ width: `${percentage}%`, backgroundColor: item.color }}/></div>
      </li>;
    })}</ul>
  </div>;
}

function Row({ label, value, positive = false }: { label: string; value: number; positive?: boolean }) { return <div className="row"><span>{label}</span><b className={positive ? "positive" : ""}>{money(value)}</b></div>; }
function EmptyState({ text, description = "O dashboard não cria dados; ele apenas apresenta o que existe no Supabase.", showQuickActions = false }: { text: string; description?: string; showQuickActions?: boolean }) {
  return <div className="empty-state"><strong>{text}</strong><span>{description}</span>{showQuickActions && <nav className="quick-actions" aria-label="Ações rápidas"><Link className="quick-action primary" href="/entradas"><span aria-hidden="true">+</span> Nova Entrada</Link><Link className="quick-action secondary" href="/despesas"><span aria-hidden="true">+</span> Nova Despesa</Link><Link className="quick-action tertiary" href="/caixa">Abrir Caixa</Link></nav>}</div>;
}

