"use client";

import { useState } from "react";

import { ModuleIcon } from "@/components/brand/ModuleIcon";

type FinancialMode = "local" | "consolidated";
type Movement = {
  id: string;
  occurred_on: string;
  kind: "income" | "expense";
  label: string;
  amount_cents: number;
};
type UnitMetric = {
  unit_id: string;
  parent_id: string | null;
  name: string;
  level: "national_hq" | "state_hq" | "sub_hq" | "local_congregation";
  total_income: number;
  total_expense: number;
  balance: number;
  subtree_total_income: number;
  subtree_total_expense: number;
  subtree_balance: number;
  recent_movements: Movement[];
};
type MetricsResponse = {
  total_income: number;
  total_expense: number;
  balance: number;
  units: UnitMetric[];
};

type Props = {
  unitId: string;
  unitName: string;
  startDate: string;
  endDate: string;
  localBalance: number;
  localIncome: number;
  localExpenses: number;
  localTransfers: number;
  canReadConsolidated: boolean;
  incomeLabel: string;
};

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const dateLabel = (value: string) => new Date(`${value}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC" });
const levelLabels: Record<UnitMetric["level"], string> = {
  national_hq: "Sede Nacional",
  state_hq: "Sede Estadual",
  sub_hq: "Sub-Sede / Regional",
  local_congregation: "Congregação Local",
};

export function HierarchicalDashboard({
  unitId,
  unitName,
  startDate,
  endDate,
  localBalance,
  localIncome,
  localExpenses,
  localTransfers,
  canReadConsolidated,
  incomeLabel,
}: Props) {
  const [mode, setMode] = useState<FinancialMode>("local");
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function showConsolidated() {
    if (!canReadConsolidated || pending) return;
    setPending(true);
    setError(null);
    try {
      const query = new URLSearchParams({ unitId, mode: "consolidated", startDate, endDate });
      const response = await fetch(`/api/financial/hierarchical-metrics?${query}`, { cache: "no-store" });
      const result = await response.json() as { data?: MetricsResponse; error?: string };
      if (!response.ok || !result.data) throw new Error(result.error ?? `Falha ao carregar visão consolidada (${response.status}).`);
      setMetrics(result.data);
      setSelectedUnitId(null);
      setMode("consolidated");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Não foi possível carregar a visão consolidada.");
    } finally {
      setPending(false);
    }
  }

  function showLocal() {
    setMode("local");
    setSelectedUnitId(null);
    setError(null);
  }

  const root = metrics?.units.find((unit) => unit.unit_id === unitId);
  const selectedUnit = metrics?.units.find((unit) => unit.unit_id === selectedUnitId) ?? root;
  const currentUnit = selectedUnit ?? null;
  const children = metrics?.units.filter((unit) => unit.parent_id === currentUnit?.unit_id) ?? [];
  const descendantsCount = metrics ? metrics.units.filter((candidate) => {
    let parentId = candidate.parent_id;
    while (parentId) {
      if (parentId === currentUnit?.unit_id) return true;
      parentId = metrics.units.find((unit) => unit.unit_id === parentId)?.parent_id ?? null;
    }
    return false;
  }).length : 0;

  const breadcrumbs: UnitMetric[] = [];
  if (currentUnit && metrics) {
    let cursor: UnitMetric | undefined = currentUnit;
    while (cursor) {
      breadcrumbs.unshift(cursor);
      cursor = cursor.parent_id ? metrics.units.find((unit) => unit.unit_id === cursor?.parent_id) : undefined;
    }
  }

  const displayedBalance = mode === "consolidated" ? currentUnit?.subtree_balance ?? 0 : localBalance;
  const displayedIncome = mode === "consolidated" ? currentUnit?.subtree_total_income ?? 0 : localIncome;
  const displayedExpenses = mode === "consolidated" ? currentUnit?.subtree_total_expense ?? 0 : localExpenses;

  return <>
    <div className="hierarchy-dashboard-toolbar">
      <div className="hierarchy-mode-control" role="group" aria-label="Modo de visualização financeira">
        <button type="button" aria-pressed={mode === "local"} className={mode === "local" ? "is-active" : ""} onClick={showLocal}>Caixa Local</button>
        <button type="button" aria-pressed={mode === "consolidated"} className={mode === "consolidated" ? "is-active" : ""} disabled={!canReadConsolidated || pending} title={!canReadConsolidated ? "Permissão consolidada não concedida para esta unidade" : undefined} onClick={() => void showConsolidated()}>{pending ? "Carregando…" : "Visão Consolidada"}</button>
      </div>
      {mode === "consolidated" && currentUnit && <nav className="hierarchy-breadcrumb" aria-label="Navegação da hierarquia">
        {breadcrumbs.map((unit, index) => <span key={unit.unit_id}>
          {index > 0 && <span aria-hidden="true">›</span>}
          {index === breadcrumbs.length - 1 ? <strong>{unit.name}</strong> : <button type="button" onClick={() => setSelectedUnitId(unit.unit_id === unitId ? null : unit.unit_id)}>{unit.name}</button>}
        </span>)}
        {selectedUnitId && <button type="button" className="hierarchy-clear-filter" onClick={() => setSelectedUnitId(null)}>Limpar filtro</button>}
      </nav>}
    </div>
    {error && <div className="notice warning" role="alert">{error}</div>}
    <div className="metrics">
      <SummaryMetric label="Saldo atual" value={money(displayedBalance)} theme="balance" detail={mode === "local" ? "Saldo calculado no fechamento" : `Saldo líquido de ${currentUnit?.name ?? unitName}`} />
      <SummaryMetric label={incomeLabel} value={money(displayedIncome)} theme="entries" detail={mode === "local" ? "Entradas da unidade ativa" : `Receitas em ${currentUnit?.name ?? unitName}`} />
      <SummaryMetric label="Despesas" value={money(displayedExpenses)} theme="expenses" detail={mode === "local" ? "Despesas da unidade ativa" : `Despesas em ${currentUnit?.name ?? unitName}`} />
      {mode === "local"
        ? <SummaryMetric label="Repasses" value={money(localTransfers)} theme="transfers" detail="Repasses registrados no período" />
        : <SummaryMetric label="Unidades Integradas" value={String(descendantsCount)} theme="transfers" detail={`Unidades subordinadas a ${currentUnit?.name ?? unitName}`} />}
    </div>
    {mode === "consolidated" && metrics && currentUnit && <div className="hierarchy-dashboard-grid">
      <section className="panel hierarchy-comparison">
        <div className="panel-title"><div style={{ display: "flex", alignItems: "center", gap: 10 }}><ModuleIcon module="hiram" variant="icon" size={28} decorative /><div><h2>Arrecadação por unidade</h2><p>{currentUnit.name} · selecione uma unidade para detalhar</p></div></div></div>
        {children.length ? <div className="hierarchy-bars" role="list" aria-label="Arrecadação das unidades subordinadas">
          {children.map((unit) => {
            const maximum = Math.max(1, ...children.map((item) => item.subtree_total_income));
            const height = Math.max(5, unit.subtree_total_income / maximum * 150);
            return <button type="button" className="hierarchy-bar-item" key={unit.unit_id} onClick={() => setSelectedUnitId(unit.unit_id)} aria-label={`${unit.name}, ${money(unit.subtree_total_income)} em arrecadação consolidada`}>
              <span className="hierarchy-bar-value">{money(unit.subtree_total_income)}</span>
              <span className="hierarchy-bar-track"><span className="hierarchy-bar" style={{ height: `${height}px` }} /></span>
              <strong>{unit.name}</strong>
              <small>{levelLabels[unit.level]}</small>
            </button>;
          })}
        </div> : <p className="hierarchy-empty">Esta unidade não possui unidades subordinadas cadastradas.</p>}
      </section>
      <section className="panel hierarchy-movements">
        <div className="panel-title"><div><h2>Lançamentos de {currentUnit.name}</h2><p>{dateLabel(startDate)} a {dateLabel(endDate)} · últimos registros</p></div></div>
        {currentUnit.recent_movements.length ? currentUnit.recent_movements.map((movement) => <article className="hierarchy-movement" key={`${movement.kind}-${movement.id}`}>
          <time>{dateLabel(movement.occurred_on)}</time><span>{movement.label}</span><strong className={movement.kind === "income" ? "amount-in" : "amount-out"}>{movement.kind === "expense" ? "−" : "+"} {money(movement.amount_cents)}</strong>
        </article>) : <p className="hierarchy-empty">Nenhum lançamento no período selecionado.</p>}
      </section>
    </div>}
  </>;
}

function SummaryMetric({ label, value, theme, detail }: { label: string; value: string; theme: string; detail: string }) {
  const icon = theme === "balance"
    ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 16.5V7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9" /><path d="M4 13h16" /><path d="M8 19h8" /><path d="M12 7.5V18" /></svg>
    : theme === "entries"
      ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v12" /><path d="m5 15 7 5 7-5" /><path d="M5 9l7-5 7 5" /></svg>
      : theme === "expenses"
        ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V8" /><path d="m5 9 7-5 7 5" /><path d="M5 15l7 5 7-5" /></svg>
        : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16" /><path d="M7 4v6" /><path d="M17 20v-6" /><path d="m7 12 5 5 5-5" /></svg>;

  const badgeText = theme === "balance" ? "Positivo" : theme === "entries" ? "Entradas" : theme === "expenses" ? "Despesas" : "Repasses";
  const sparklinePath = theme === "balance"
    ? "M0 18 C12 10, 18 12, 24 8 S41 2, 48 9 S62 14, 74 4"
    : theme === "entries"
      ? "M0 18 C10 13, 18 16, 24 11 S38 5, 48 8 S62 4, 74 6"
      : theme === "expenses"
        ? "M0 10 C12 16, 20 15, 26 13 S42 17, 48 10 S63 6, 74 12"
        : "M0 14 C8 14, 18 10, 24 8 S38 12, 48 8 S64 7, 74 10";

  return <article className={`metric metric-${theme}`}>
    <div className="metric-topline">
      <div className="metric-label-wrap">
        <span className={`metric-icon metric-icon-${theme}`} aria-hidden="true">{icon}</span>
        <small>{label}</small>
      </div>
    </div>
    <div className="metric-value-row"><strong>{value}</strong></div>
    <div className="metric-footer">
      <span className={`metric-badge metric-badge-${theme}`}>{badgeText}</span>
      <span className="metric-detail">{detail}</span>
      <svg className="metric-sparkline" viewBox="0 0 74 26" preserveAspectRatio="none" aria-hidden="true">
        <path d={sparklinePath} />
      </svg>
    </div>
  </article>;
}
