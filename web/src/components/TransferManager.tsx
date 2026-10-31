"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/lib/api/client";
import { presentStatus } from "@/lib/presentation";
import { getVocabulary, type OrganizationType } from "@/domain/vocabulary";

type Transfer = { id: string; destination_name: string; reference_period: string; amount_sent_cents: number | null; amount_received_cents: number | null; occurred_on: string | null; status: string; reason: string };

const money = (cents: number | null) => cents === null ? "Não informado" : (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function TransferManager({ transfers, congregationId, closed, canWrite, canApprove, canConfirm, organizationType = "church" }: { transfers: Transfer[]; congregationId: string; closed: boolean; canWrite: boolean; canApprove: boolean; canConfirm: boolean; organizationType?: OrganizationType }) {
  const router = useRouter();
  const terms = getVocabulary(organizationType);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
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
      setError("O período está fechado. O repasse não pode ser enviado.");
      return;
    }
    startTransition(async () => {
      try {
        await postJson("/api/transfers", { originCongregationId: congregationId, destinationName: String(form.get("destinationName")), referencePeriod: String(form.get("referencePeriod")), amountSentCents: Math.round(Number(form.get("amount")) * 100), reason: String(form.get("reason")), occurredOn: String(form.get("occurredOn") || "") || undefined });
        setMessage("Repasse solicitado com sucesso.");
        setOpen(false);
        formElement.reset();
        router.refresh();
      } catch (submitError) {
        setError(submitError instanceof Error ? submitError.message : "Não foi possível solicitar o repasse.");
      }
    });
  }

  function approve(id: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try { await postJson("/api/transfers/approve", { transferId: id }); setMessage("Repasse aprovado com sucesso."); router.refresh(); } catch (approveError) { setError(approveError instanceof Error ? approveError.message : "Não foi possível aprovar o repasse."); }
    });
  }

  function confirm(id: string, amount: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try { await postJson("/api/transfers/confirm", { transferId: id, amountReceivedCents: Math.round(Number(amount) * 100) }); setMessage("Repasse confirmado com sucesso."); setConfirming(null); router.refresh(); } catch (confirmError) { setError(confirmError instanceof Error ? confirmError.message : "Não foi possível confirmar o repasse."); }
    });
  }

  return <>
    <div className="module-actions"><div><p className="eyebrow">FLUXO DE {terms.campaigns.toLocaleUpperCase("pt-BR")}</p><h1>{terms.campaigns}</h1><p>Solicite, aprove e acompanhe os recursos da {terms.headquarters.toLocaleLowerCase("pt-BR")}.</p></div>{canWrite && <button type="button" className="primary-button" onClick={() => { setOpen(!open); setError(null); setMessage(null); }}>{open ? "Fechar" : "+ Novo repasse"}</button>}</div>
    <div className="transfer-flow"><span>Pendente</span><b>→</b><span>Aprovado</span><b>→</b><span>Enviado</span><b>→</b><span>Confirmado</span></div>
    {closed && <div className="notice warning">Este período está fechado. Novos repasses, aprovações e confirmações estão bloqueados na interface.</div>}
    {message && <div className="notice success">{message}</div>}
    {error && <div className="notice error">{error}</div>}
    {open && canWrite && <form className="entry-form" onSubmit={submit}><div className="form-grid"><label>Destino<input name="destinationName" type="text" required /></label><label>Período de referência<input name="referencePeriod" type="date" defaultValue={new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1)).toISOString().slice(0, 10)} required /></label><label>Valor enviado (R$)<input name="amount" type="number" min="0.01" step="0.01" required /></label><label>Data do envio (opcional)<input name="occurredOn" type="date" /></label><label className="wide-field">Motivo<input name="reason" type="text" required /></label></div><button className="primary-button" type="submit" disabled={pending || closed}>{pending ? "Salvando..." : "Solicitar repasse"}</button></form>}
    <section className="panel entries-panel"><div className="panel-title"><div><h2>{terms.campaigns} registrados</h2><p>{transfers.length} registro(s) carregado(s) da unidade ativa</p></div></div>{transfers.length === 0 ? <div className="empty-state"><strong>Nenhum registro de {terms.campaigns.toLocaleLowerCase("pt-BR")}</strong><span>Os registros aparecerão aqui quando existirem no Supabase.</span></div> : <div className="entry-list">{transfers.map((transfer) => <article className="entry-row transfer-row" key={transfer.id}><div><b>{transfer.destination_name}</b><small>{transfer.reason}</small></div><span>{transfer.reference_period}</span><strong>{money(transfer.amount_sent_cents)}</strong><em className={`status-${transfer.status}`}>{presentStatus(transfer.status)}</em>{canApprove && transfer.status === "requested" && <button type="button" className="text-button" disabled={pending || closed} onClick={() => approve(transfer.id)}>Aprovar</button>}{canConfirm && ["approved", "sent"].includes(transfer.status) && (confirming === transfer.id ? <span className="confirm-inline"><input id={`received-${transfer.id}`} type="number" min="0" step="0.01" defaultValue={transfer.amount_sent_cents ? transfer.amount_sent_cents / 100 : ""} aria-label="Valor recebido" /><button type="button" className="text-button" disabled={pending || closed} onClick={() => confirm(transfer.id, (document.getElementById(`received-${transfer.id}`) as HTMLInputElement).value)}>Confirmar</button></span> : <button type="button" className="text-button" disabled={pending || closed} onClick={() => setConfirming(transfer.id)}>Informar recebimento</button>)}</article>)}</div>}</section>
  </>;
}