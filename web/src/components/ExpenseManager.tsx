"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/lib/api/client";
import { presentError, presentStatus } from "@/lib/presentation";

type Expense = { id: string; occurred_on: string; amount_cents: number; category: string; description: string; vendor: string | null; payment_method: string; purpose: string | null; cost_center: string | null; status: string; approved_at: string | null };

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function ExpenseManager({ expenses, congregationId, closed, canWrite, canApprove }: { expenses: Expense[]; congregationId: string; closed: boolean; canWrite: boolean; canApprove: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    if (closed) {
      setError("O período está fechado. A despesa não pode ser enviada.");
      return;
    }
    startTransition(async () => {
      try {
        await postJson("/api/expenses", {
          congregationId,
          occurredOn: String(form.get("occurredOn")),
          amountCents: Math.round(Number(form.get("amount")) * 100),
          category: String(form.get("category")),
          description: String(form.get("description")),
          vendor: String(form.get("vendor") || "") || undefined,
          paymentMethod: String(form.get("paymentMethod")),
          purpose: String(form.get("purpose") || "") || undefined,
          costCenter: String(form.get("costCenter") || "") || undefined,
          isInternalTransfer: form.get("isInternalTransfer") === "on",
        });
        setMessage("Despesa criada com sucesso.");
        setOpen(false);
        formElement.reset();
        router.refresh();
      } catch (submitError) {
        setError(presentError(submitError, "Não foi possível criar a despesa."));
      }
    });
  }

  function approve(id: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        await postJson("/api/expenses/approve", { expenseId: id });
        setMessage("Despesa aprovada com sucesso.");
        router.refresh();
      } catch (approveError) {
        setError(presentError(approveError, "Não foi possível aprovar a despesa."));
      }
    });
  }

  return <>
    <div className="module-actions"><div><p className="eyebrow">REGISTROS REAIS</p><h1>Despesas</h1><p>Consulte, registre e aprove despesas da congregação ativa.</p></div>{canWrite && <button type="button" className="primary-button" onClick={() => { setOpen(!open); setError(null); setMessage(null); }}>{open ? "Fechar" : "+ Nova despesa"}</button>}</div>
    {closed && <div className="notice warning">Este período está fechado. Novas despesas e aprovações estão bloqueadas na interface.</div>}
    {message && <div className="notice success">{message}</div>}
    {error && <div className="notice error">{error}</div>}
    {open && canWrite && <form className="entry-form" onSubmit={submit}><div className="form-grid"><label>Data<input name="occurredOn" type="date" defaultValue={new Date().toISOString().slice(0, 10)} required /></label><label>Valor (R$)<input name="amount" type="number" min="0.01" step="0.01" required /></label><label>Categoria<input name="category" type="text" required /></label><label>Descrição<input name="description" type="text" required /></label><label>Fornecedor (opcional)<input name="vendor" type="text" /></label><label>Forma de pagamento<select name="paymentMethod" required><option value="">Selecione</option><option value="cash">Dinheiro</option><option value="pix">Pix</option><option value="transfer">Transferência</option><option value="card">Cartão</option><option value="check">Cheque</option><option value="other">Outra</option></select></label><label>Finalidade (opcional)<input name="purpose" type="text" /></label><label>Centro de custo (opcional)<input name="costCenter" type="text" /></label></div><label className="internal-transfer-toggle"><input name="isInternalTransfer" type="checkbox" /><span><strong>Repasse interno entre unidades</strong><small>Será excluído da visão financeira consolidada.</small></span></label><button className="primary-button" type="submit" disabled={pending || closed}>{pending ? "Salvando..." : "Salvar despesa"}</button></form>}
    <section className="panel entries-panel"><div className="panel-title"><div><h2>Despesas registradas</h2><p>{expenses.length} registro(s) carregado(s) da congregação ativa</p></div></div>{expenses.length === 0 ? <div className="empty-state"><strong>Nenhuma despesa registrada</strong><span>Os registros aparecerão aqui quando existirem no Supabase.</span></div> : <div className="entry-list">{expenses.map((expense) => <article className="entry-row" key={expense.id}><div><b>{expense.description}</b><small>{expense.category}{expense.vendor ? ` · ${expense.vendor}` : ""}</small></div><span>{expense.occurred_on}</span><strong>{money(expense.amount_cents)}</strong><em className={`status-${expense.status}`}>{presentStatus(expense.status)}</em>{canApprove && expense.status === "pending" && <button type="button" className="text-button" disabled={pending || closed} onClick={() => approve(expense.id)}>Aprovar</button>}</article>)}</div>}</section>
  </>;
}