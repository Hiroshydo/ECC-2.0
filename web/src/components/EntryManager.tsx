"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getVocabulary, type OrganizationType } from "@/domain/vocabulary";
import { presentDate } from "@/lib/presentation";

type Entry = { id: string; occurred_on: string; amount_cents: number; category: string; origin: string; payment_method: string; purpose: string | null };

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function categoryLabel(category: string, organizationType: OrganizationType) {
  const terms = getVocabulary(organizationType);
  if (category === "tithe") return terms.recurringIncome;
  if (category === "offering") return terms.freeIncome;
  if (category === "campaign") return terms.campaigns;
  if (category === "donation") return organizationType === "ong" ? terms.recurringIncome : "Doação";
  if (category === "other") return organizationType === "ong" ? terms.freeIncome : "Outra";
  if (category === "event") return terms.gathering;
  return category;
}

export function EntryManager({ entries, congregationId, closed, canWrite, currentDate, organizationType = "church" }: { entries: Entry[]; congregationId: string; closed: boolean; canWrite: boolean; currentDate: string; organizationType?: OrganizationType }) {
  const router = useRouter();
  const terms = getVocabulary(organizationType);
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
    const amount = Number(form.get("amount"));
    if (closed) {
      setError("O período está fechado. A entrada não pode ser enviada.");
      return;
    }
    startTransition(async () => {
      try {
        const response = await fetch("/api/entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
          congregationId,
          occurredOn: String(form.get("occurredOn")),
          amountCents: Math.round(amount * 100),
          category: String(form.get("category")),
          origin: String(form.get("origin")),
          paymentMethod: String(form.get("paymentMethod")),
          purpose: String(form.get("purpose") || "") || undefined,
          isInternalTransfer: form.get("isInternalTransfer") === "on",
          }),
        });
        const result = await response.json() as { error?: string };
        if (!response.ok) throw new Error(result.error ?? "Não foi possível criar a entrada.");
        setMessage("Entrada criada com sucesso.");
        setOpen(false);
        formElement.reset();
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Não foi possível criar a entrada.");
      }
    });
  }

  return <>
    <div className="module-actions"><div><p className="eyebrow">REGISTROS REAIS · {terms.unitSingular.toLocaleUpperCase("pt-BR")}</p><h1>{terms.dashboardEntries}</h1><p>Consulte e registre entradas da unidade ativa.</p></div>{canWrite && <button type="button" className="primary-button" onClick={() => { setOpen(!open); setError(null); setMessage(null); }}>{open ? "Fechar" : "+ Novo lançamento"}</button>}</div>
    {closed && <div className="notice warning">Este período está fechado. Novas entradas serão bloqueadas pelo backend.</div>}
    {message && <div className="notice success">{message}</div>}
    {error && <div className="notice error">{error}</div>}
    {open && canWrite && <form className="entry-form" onSubmit={submit}><div className="form-grid"><label>Data<input name="occurredOn" type="date" defaultValue={currentDate} required /></label><label>Valor (R$)<input name="amount" type="number" min="0.01" step="0.01" required /></label><label>Categoria<select name="category" required><option value="">Selecione</option>{organizationType === "church" ? <><option value="tithe">{terms.recurringIncome}</option><option value="offering">{terms.freeIncome}</option></> : <><option value="donation">{terms.recurringIncome}</option><option value="campaign">{terms.campaigns}</option><option value="other">{terms.freeIncome}</option></>}<option value="event">{terms.gathering}</option>{organizationType === "church" && <option value="other">Outra</option>}</select></label><label>Origem<input name="origin" type="text" placeholder={`Ex.: ${terms.gathering}`} required /></label><label>Forma de pagamento<select name="paymentMethod" required><option value="">Selecione</option><option value="cash">Dinheiro</option><option value="pix">Pix</option><option value="transfer">Transferência</option><option value="card">Cartão</option><option value="check">Cheque</option><option value="other">Outra</option></select></label><label className="wide-field">Finalidade (opcional)<input name="purpose" type="text" /></label></div><label className="internal-transfer-toggle"><input name="isInternalTransfer" type="checkbox" /><span><strong>Repasse interno entre unidades</strong><small>Será excluído da visão financeira consolidada.</small></span></label><button className="primary-button" type="submit" disabled={pending || closed}>{pending ? "Salvando..." : "Salvar lançamento"}</button></form>}
    <section className="panel entries-panel"><div className="panel-title"><div><h2>{terms.dashboardEntries} registrados</h2><p>{entries.length} registro(s) carregado(s) da unidade ativa</p></div></div>{entries.length === 0 ? <div className="empty-state"><strong>Nenhum registro de {terms.dashboardEntries.toLocaleLowerCase("pt-BR")}</strong><span>Os registros aparecerão aqui quando existirem no Supabase.</span></div> : <div className="entry-list">{entries.map((entry) => <article className="entry-row" key={entry.id}><div><b>{categoryLabel(entry.category, organizationType)}</b><small>{entry.origin}{entry.purpose ? ` · ${entry.purpose}` : ""}</small></div><time>{presentDate(entry.occurred_on)}</time><strong>{money(entry.amount_cents)}</strong><em>{entry.payment_method}</em></article>)}</div>}</section>
  </>;
}