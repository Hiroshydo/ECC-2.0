"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/lib/api/client";
import { presentDate, presentError, presentStatus } from "@/lib/presentation";

type Adjustment = { id: string; reference_period: string; entity_type: string; entity_id: string; amount_cents: number; reason: string; status: string };
type Reversal = { id: string; reference_period: string; entity_type: string; entity_id: string; amount_cents: number; reason: string; status: string };

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const entityLabel = (entity: string) => entity === "entries" ? "Entrada" : "Despesa";

export function CorrectionManager({ kind, records, congregationId, canWrite }: { kind: "adjustment" | "reversal"; records: Adjustment[] | Reversal[]; congregationId: string; canWrite: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const isAdjustment = kind === "adjustment";
  const title = isAdjustment ? "Ajustes" : "Estornos";
  const actionTitle = isAdjustment ? "Novo ajuste" : "Novo estorno";

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    startTransition(async () => {
      try {
        await postJson(isAdjustment ? "/api/adjustments" : "/api/reversals", {
          congregationId,
          entityType: String(form.get("entityType")),
          entityId: String(form.get("entityId")),
          amountCents: isAdjustment ? Math.round(Number(form.get("amount")) * 100) : undefined,
          reason: String(form.get("reason")),
          idempotencyKey: crypto.randomUUID(),
        });
        setMessage(`${isAdjustment ? "Ajuste" : "Estorno"} registrado com sucesso.`);
        setOpen(false);
        formElement.reset();
        router.refresh();
      } catch (submitError) {
        setError(presentError(submitError, `Não foi possível registrar o ${isAdjustment ? "ajuste" : "estorno"}.`));
      }
    });
  }

  return <>
    <div className="module-actions"><div><p className="eyebrow">CORREÇÕES FORMAIS</p><h1>{title}</h1><p>{isAdjustment ? "Registre ajustes auditáveis para entradas e despesas." : "Registre estornos integrais de entradas e despesas."}</p></div>{canWrite && <button type="button" className="primary-button" onClick={() => { setOpen(!open); setError(null); setMessage(null); }}>{open ? "Fechar" : `+ ${actionTitle}`}</button>}</div>
    {message && <div className="notice success">{message}</div>}{error && <div className="notice error">{error}</div>}
    {open && canWrite && <form className="entry-form" onSubmit={submit}><div className="form-grid"><label>Tipo de registro<select name="entityType" required><option value="entries">Entrada</option><option value="expenses">Despesa</option></select></label><label>ID do registro relacionado<input name="entityId" type="text" placeholder="UUID do registro" required /></label>{isAdjustment && <label>Valor do ajuste (R$)<input name="amount" type="number" step="0.01" required /></label>}<label className="wide-field">Motivo<input name="reason" type="text" required /></label></div><button className="primary-button" type="submit" disabled={pending}>{pending ? "Salvando..." : `Registrar ${isAdjustment ? "ajuste" : "estorno"}`}</button></form>}
    <section className="panel entries-panel"><div className="panel-title"><div><h2>{title} registrados</h2><p>{records.length} registro(s) carregado(s) da congregação ativa</p></div></div>{records.length === 0 ? <div className="empty-state"><strong>Nenhum {isAdjustment ? "ajuste" : "estorno"} registrado</strong><span>Os registros aparecerão aqui quando existirem no Supabase.</span></div> : <div className="entry-list">{records.map((record) => <article className="entry-row" key={record.id}><div><b>{entityLabel(record.entity_type)}</b><small>{record.reason} · {record.entity_id}</small></div><time>{presentDate(record.reference_period)}</time><strong>{money(record.amount_cents)}</strong><em className={`status-${record.status}`}>{presentStatus(record.status)}</em></article>)}</div>}</section>
  </>;
}