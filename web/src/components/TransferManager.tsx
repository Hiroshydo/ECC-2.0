"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/lib/api/client";
import { presentStatus } from "@/lib/presentation";
import { getVocabulary, type OrganizationType } from "@/domain/vocabulary";
import type { TransferMethod, TransferSend } from "@/domain/finance";

type Transfer = {
  id: string;
  destination_name: string;
  reference_period: string;
  amount_requested_cents: number | null;
  amount_approved_cents: number | null;
  amount_sent_cents: number | null;
  amount_received_cents: number | null;
  occurred_on: string | null;
  status: string;
  reason: string;
  requested_by: string;
  approved_by: string | null;
  send: TransferSend | null;
};

const transferMethods: Array<{ value: TransferMethod; label: string }> = [
  { value: "pix", label: "Pix" },
  { value: "transfer", label: "Transferência" },
  { value: "deposit", label: "Depósito" },
  { value: "cash", label: "Dinheiro" },
];

const money = (cents: number | null) => cents === null ? "Não informado" : (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const periodLabel = (value: string) => new Date(`${value.slice(0, 7)}-01T12:00:00Z`).toLocaleDateString("pt-BR", { month: "short", year: "numeric", timeZone: "UTC" });

function saoPauloDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

export function TransferManager({
  transfers,
  congregationId,
  currentUserId,
  closed,
  canWrite,
  canApprove,
  canSend,
  canConfirm,
  organizationType = "church",
}: {
  transfers: Transfer[];
  congregationId: string;
  currentUserId: string;
  closed: boolean;
  canWrite: boolean;
  canApprove: boolean;
  canSend: boolean;
  canConfirm: boolean;
  organizationType?: OrganizationType;
}) {
  const router = useRouter();
  const terms = getVocabulary(organizationType);
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [sendMethod, setSendMethod] = useState<TransferMethod>("pix");
  const [sendKey, setSendKey] = useState<{ transferId: string; key: string } | null>(null);
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
      setError("O período está fechado. O repasse não pode ser solicitado.");
      return;
    }
    startTransition(async () => {
      try {
        await postJson("/api/transfers", {
          originCongregationId: congregationId,
          destinationName: String(form.get("destinationName")),
          referencePeriod: String(form.get("referencePeriod")),
          amountSentCents: Math.round(Number(form.get("amount")) * 100),
          reason: String(form.get("reason")),
        });
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
      try {
        await postJson("/api/transfers/approve", { transferId: id });
        setMessage("Repasse aprovado com sucesso.");
        router.refresh();
      } catch (approveError) {
        setError(approveError instanceof Error ? approveError.message : "Não foi possível aprovar o repasse.");
      }
    });
  }

  function openSend(transferId: string) {
    setSending(transferId);
    setSendMethod("pix");
    setSendKey({ transferId, key: crypto.randomUUID() });
    setError(null);
    setMessage(null);
  }

  function registerSend(event: FormEvent<HTMLFormElement>, transfer: Transfer) {
    event.preventDefault();
    if (closed) {
      setError("O período está fechado. Reabra-o antes de registrar o envio.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const key = sendKey?.transferId === transfer.id ? sendKey.key : crypto.randomUUID();
    setSendKey({ transferId: transfer.id, key });
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await postJson("/api/transfers/send", {
          transferId: transfer.id,
          idempotencyKey: key,
          occurredOn: String(form.get("occurredOn")),
          amountSentCents: Math.round(Number(form.get("amount")) * 100),
          method: String(form.get("method")),
          reference: String(form.get("reference") ?? ""),
          note: String(form.get("note") ?? ""),
        });
        setMessage("Envio registrado. O repasse aguarda a confirmação do destino.");
        setSending(null);
        setSendKey(null);
        router.refresh();
      } catch (sendError) {
        setError(sendError instanceof Error ? sendError.message : "Não foi possível registrar o envio.");
      }
    });
  }

  function confirm(id: string, amount: string) {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        await postJson("/api/transfers/confirm", {
          transferId: id,
          amountReceivedCents: Math.round(Number(amount) * 100),
        });
        setMessage("Recebimento confirmado.");
        setConfirming(null);
        router.refresh();
      } catch (confirmError) {
        setError(confirmError instanceof Error ? confirmError.message : "Não foi possível confirmar o recebimento.");
      }
    });
  }

  return (
    <>
      <div className="module-actions">
        <div>
          <p className="eyebrow">FLUXO DE {terms.campaigns.toLocaleUpperCase("pt-BR")}</p>
          <h1>{terms.campaigns}</h1>
          <p>Solicite, aprove e acompanhe os recursos da {terms.headquarters.toLocaleLowerCase("pt-BR")}.</p>
        </div>
        {canWrite && <button type="button" className="primary-button" onClick={() => {
          setOpen(!open);
          setError(null);
          setMessage(null);
        }}>{open ? "Fechar" : "+ Novo repasse"}</button>}
      </div>
      <div className="transfer-flow"><span>Pendente</span><b>→</b><span>Aprovado</span><b>→</b><span>Enviado</span><b>→</b><span>Confirmado</span></div>
      {closed && <div className="notice warning">Este período está fechado. Solicitações, aprovações, envios e confirmações estão bloqueados na interface.</div>}
      {message && <div className="notice success">{message}</div>}
      {error && <div className="notice error">{error}</div>}
      {open && canWrite && (
        <form className="entry-form" onSubmit={submit}>
          <div className="form-grid">
            <label>Destino<input name="destinationName" type="text" required /></label>
            <label>Período de referência<input name="referencePeriod" type="date" defaultValue={saoPauloDate()} required /></label>
            <label>Valor solicitado (R$)<input name="amount" type="number" min="0.01" step="0.01" required /></label>
            <label className="wide-field">Motivo<input name="reason" type="text" required /></label>
          </div>
          <button className="primary-button" type="submit" disabled={pending || closed}>{pending ? "Salvando..." : "Solicitar repasse"}</button>
        </form>
      )}
      <section className="panel entries-panel">
        <div className="panel-title"><div><h2>{terms.campaigns} registrados</h2><p>{transfers.length} registro(s) carregado(s) da unidade ativa</p></div></div>
        {transfers.length === 0
          ? <div className="empty-state"><strong>Nenhum registro de {terms.campaigns.toLocaleLowerCase("pt-BR")}</strong><span>Os registros aparecerão aqui quando existirem no Supabase.</span></div>
          : <div className="entry-list">{transfers.map((transfer) => {
            const amount = transfer.amount_sent_cents ?? transfer.amount_approved_cents ?? transfer.amount_requested_cents;
            const canRegisterSend = canSend
              && transfer.status === "approved"
              && transfer.requested_by !== currentUserId
              && transfer.approved_by !== currentUserId;
            return (
              <article className="entry-row transfer-row" key={transfer.id}>
                <div><b>{transfer.destination_name}</b><small>{transfer.reason}</small></div>
                <span>{periodLabel(transfer.reference_period)}</span>
                <strong>{money(amount)}</strong>
                <em className={`status-${transfer.status}`}>{presentStatus(transfer.status)}</em>
                {canApprove && transfer.status === "requested" && transfer.requested_by !== currentUserId && (
                  <button type="button" className="text-button" disabled={pending || closed} onClick={() => approve(transfer.id)}>Aprovar</button>
                )}
                {canRegisterSend && !sending && (
                  <button type="button" className="text-button" disabled={pending || closed} onClick={() => openSend(transfer.id)}>Registrar envio</button>
                )}
                {sending === transfer.id && canRegisterSend && (
                  <form className="confirm-inline" onSubmit={(event) => registerSend(event, transfer)}>
                    <label>Data do envio<input name="occurredOn" type="date" defaultValue={saoPauloDate()} required /></label>
                    <label>Valor enviado (R$)<input name="amount" type="number" min="0.01" step="0.01" defaultValue={transfer.amount_approved_cents ? transfer.amount_approved_cents / 100 : ""} required /></label>
                    <label>Forma
                      <select name="method" value={sendMethod} onChange={(event) => setSendMethod(event.target.value as TransferMethod)}>
                        {transferMethods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
                      </select>
                    </label>
                    <label>Referência{sendMethod === "cash" && " (recibo obrigatório)"}
                      <input name="reference" type="text" required={sendMethod === "cash"} />
                    </label>
                    <label>Observação<input name="note" type="text" /></label>
                    <button type="submit" className="text-button" disabled={pending || closed}>
                      {pending ? "Registrando..." : "Salvar envio"}
                    </button>
                    <button type="button" className="text-button" onClick={() => setSending(null)}>Cancelar</button>
                  </form>
                )}
                {transfer.send && (
                  <small>
                    Enviado em {transfer.send.occurred_on} · {transferMethods.find((method) => method.value === transfer.send?.method)?.label}
                    {transfer.send.reference ? ` · Ref. ${transfer.send.reference}` : ""}
                  </small>
                )}
                {canConfirm && transfer.status === "sent" && (confirming === transfer.id
                  ? <span className="confirm-inline"><input id={`received-${transfer.id}`} type="number" min="0" step="0.01" defaultValue={transfer.amount_sent_cents ? transfer.amount_sent_cents / 100 : ""} aria-label="Valor recebido" /><button type="button" className="text-button" disabled={pending || closed} onClick={() => confirm(transfer.id, (document.getElementById(`received-${transfer.id}`) as HTMLInputElement).value)}>Confirmar</button></span>
                  : <button type="button" className="text-button" disabled={pending || closed} onClick={() => setConfirming(transfer.id)}>Informar recebimento</button>)}
              </article>
            );
          })}</div>}
      </section>
    </>
  );
}
