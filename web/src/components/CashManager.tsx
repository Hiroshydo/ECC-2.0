"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/lib/api/client";
import { presentStatus } from "@/lib/presentation";

type Register = { id: string; name: string; active: boolean };
type Period = { id: string; cash_register_id: string; reference_period: string; opening_balance_cents: number; status: string };
type Movement = { id: string; cash_period_id: string; movement_type: string; amount_cents: number; reason: string; created_at: string };

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const movementLabel: Record<string, string> = { cash_in: "Entrada", cash_expense: "Saída", deposit: "Depósito" };

export function CashManager({ registers, periods, movements, congregationId, period, canWrite }: { registers: Register[]; periods: Period[]; movements: Movement[]; congregationId: string; period: string; canWrite: boolean }) {
  const router = useRouter();
  const [opening, setOpening] = useState(false);
  const [movementOpen, setMovementOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const currentPeriodIds = new Set(periods.map((item) => item.id));
  const currentMovements = movements.filter((item) => currentPeriodIds.has(item.cash_period_id));
  const balances = new Map(periods.map((item) => [item.id, item.opening_balance_cents + currentMovements.filter((movement) => movement.cash_period_id === item.id).reduce((balance, movement) => balance + (movement.movement_type === "cash_in" ? movement.amount_cents : -movement.amount_cents), 0)]));

  function submitOpening(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(null); setError(null);
    const form = new FormData(event.currentTarget);
    startTransition(async () => {
      try {
        const register = registers.find((item) => item.id === String(form.get("registerId")));
        const created = register ?? await postJson<Register>("/api/cash/registers", { congregationId, name: String(form.get("name")) });
        await postJson("/api/cash/periods", { cashRegisterId: created.id, referencePeriod: period, openingBalanceCents: Math.round(Number(form.get("openingBalance")) * 100) });
        setMessage("Caixa aberto com sucesso."); setOpening(false); router.refresh();
      } catch (submitError) { setError(submitError instanceof Error ? submitError.message : "Não foi possível abrir o caixa."); }
    });
  }

  function submitMovement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(null); setError(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    startTransition(async () => {
      try {
        await postJson("/api/cash/movements", { cashPeriodId: String(form.get("cashPeriodId")), movementType: String(form.get("movementType")), amountCents: Math.round(Number(form.get("amount")) * 100), reason: String(form.get("reason")), idempotencyKey: crypto.randomUUID() });
        setMessage("Movimentação registrada com sucesso."); setMovementOpen(false); formElement.reset(); router.refresh();
      } catch (movementError) { setError(movementError instanceof Error ? movementError.message : "Não foi possível registrar a movimentação."); }
    });
  }

  return <>
    <div className="module-actions"><div><p className="eyebrow">CAIXA FÍSICO · {period.slice(0, 7)}</p><h1>Caixa</h1><p>Controle os valores físicos da congregação ativa.</p></div>{canWrite && <div className="action-group"><button type="button" className="secondary-button" onClick={() => setOpening(!opening)}>{opening ? "Fechar" : "Abrir caixa"}</button>{periods.some((item) => item.status === "open") && <button type="button" className="primary-button" onClick={() => setMovementOpen(!movementOpen)}>{movementOpen ? "Fechar" : "+ Movimentação"}</button>}</div>}</div>
    {message && <div className="notice success">{message}</div>}{error && <div className="notice error">{error}</div>}
    {opening && canWrite && <form className="entry-form" onSubmit={submitOpening}><div className="form-grid"><label>Caixa existente<select name="registerId" defaultValue=""><option value="">Criar novo caixa</option>{registers.filter((register) => register.active && !periods.some((item) => item.cash_register_id === register.id)).map((register) => <option key={register.id} value={register.id}>{register.name}</option>)}</select></label><label>Nome do novo caixa<input name="name" type="text" placeholder="Obrigatório ao criar" /></label><label>Saldo inicial (R$)<input name="openingBalance" type="number" min="0" step="0.01" defaultValue="0" required /></label></div><button className="primary-button" type="submit" disabled={pending}>{pending ? "Abrindo..." : "Confirmar abertura"}</button></form>}
    {movementOpen && canWrite && <form className="entry-form" onSubmit={submitMovement}><div className="form-grid"><label>Período de caixa<select name="cashPeriodId" required>{periods.filter((item) => item.status === "open").map((item) => <option key={item.id} value={item.id}>{registers.find((register) => register.id === item.cash_register_id)?.name ?? item.cash_register_id}</option>)}</select></label><label>Tipo<select name="movementType" required><option value="cash_in">Entrada de dinheiro</option><option value="cash_expense">Saída / despesa</option><option value="deposit">Depósito</option></select></label><label>Valor (R$)<input name="amount" type="number" min="0.01" step="0.01" required /></label><label className="wide-field">Motivo<input name="reason" type="text" required /></label></div><button className="primary-button" type="submit" disabled={pending}>{pending ? "Registrando..." : "Registrar movimentação"}</button></form>}
    <div className="cash-register-grid">{registers.map((register) => { const cashPeriod = periods.find((item) => item.cash_register_id === register.id); return <section className="panel cash-card" key={register.id}><div className="panel-title"><div><h2>{register.name}</h2><p>{cashPeriod ? `Período ${cashPeriod.reference_period}` : "Sem período aberto"}</p></div><span className={`pill ${cashPeriod?.status === "open" ? "success" : ""}`}>{cashPeriod ? presentStatus(cashPeriod.status) : "Não aberto"}</span></div>{cashPeriod && <><strong className="cash-balance">{money(balances.get(cashPeriod.id) ?? cashPeriod.opening_balance_cents)}</strong><small>Saldo físico atual</small></>}</section>; })}</div>
    <section className="panel entries-panel"><div className="panel-title"><div><h2>Movimentações do período</h2><p>{currentMovements.length} registro(s) carregado(s) do Supabase</p></div></div>{currentMovements.length === 0 ? <div className="empty-state"><strong>Nenhuma movimentação registrada</strong><span>As entradas e saídas do caixa aparecerão aqui.</span></div> : <div className="entry-list">{currentMovements.map((movement) => <article className="entry-row" key={movement.id}><div><b>{movementLabel[movement.movement_type] ?? movement.movement_type}</b><small>{movement.reason}</small></div><span>{new Date(movement.created_at).toLocaleString("pt-BR")}</span><strong>{money(movement.amount_cents)}</strong></article>)}</div>}</section>
  </>;
}