"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { postJson } from "@/lib/api/client";
import { presentDateTime, presentError, presentStatus } from "@/lib/presentation";

type Summary = { opening_balance: number; entries: number; expenses: number; transfers: number; adjustments: number; closing_balance: number };
type Closing = { status: string; closed_at: string | null };

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const periodLabel = (period: string) => new Date(`${period}T12:00:00Z`).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "UTC" });

export function ClosingManager({ congregationId, referencePeriod, congregationName, summary, closing, canClose }: { congregationId: string; referencePeriod: string; congregationName: string; summary: Summary | null; closing: Closing | null; canClose: boolean }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const status = closing?.status ?? "open";
  const isClosed = status === "closed";

  function closePeriod() {
    setMessage(null);
    setError(null);
    startTransition(async () => {
      try {
        await postJson("/api/closing", { congregationId, referencePeriod });
        setConfirming(false);
        setMessage("Período fechado com sucesso.");
        router.refresh();
      } catch (closeError) {
        setError(presentError(closeError, "Não foi possível fechar o período."));
      }
    });
  }

  return <section className="closing-page"><div className="module-actions"><div><p className="eyebrow">PRESTAÇÃO DE CONTAS · {referencePeriod.slice(0, 7)}</p><h1>Fechamento</h1><p>Acompanhe e encerre o período financeiro da congregação ativa.</p></div>{canClose && !isClosed && <button type="button" className="primary-button" onClick={() => { setError(null); setConfirming(true); }}>Fechar período</button>}</div>
    {message && <div className="notice success">{message}</div>}{error && <div className="notice error">{error}</div>}
    <div className="closing-status"><div><span className="status-kicker">PERÍODO ATUAL</span><strong>{periodLabel(referencePeriod)}</strong><small>{congregationName}</small></div><span className={`status-${status}`}>{closing ? presentStatus(status) : "Sem fechamento"}</span></div>
    <div className="closing-grid"><section className="panel"><div className="panel-title"><div><h2>Resumo financeiro</h2><p>Valores calculados pelo backend para este período.</p></div></div>{summary ? <div className="equation"><div className="row"><span>Saldo inicial</span><b>{money(summary.opening_balance)}</b></div><div className="row"><span>+ Entradas</span><b className="positive">{money(summary.entries)}</b></div><div className="row"><span>- Despesas</span><b>{money(summary.expenses)}</b></div><div className="row"><span>- Repasses</span><b>{money(summary.transfers)}</b></div><div className="row"><span>+ Ajustes</span><b className="positive">{money(summary.adjustments)}</b></div><div className="total"><b>= Saldo atual</b><strong>{money(summary.closing_balance)}</strong></div></div> : <div className="empty-state"><strong>Sem movimentações no período</strong><span>O resumo aparecerá quando houver dados financeiros registrados.</span></div>}</section><section className="panel closing-detail"><div className="panel-title"><div><h2>Situação do período</h2><p>O status oficial é mantido pelo Supabase.</p></div></div><div className="detail-line"><span>Status</span><strong>{closing ? presentStatus(status) : "Sem fechamento"}</strong></div>{isClosed && <div className="detail-line"><span>Data do fechamento</span><strong>{presentDateTime(closing?.closed_at ?? null)}</strong></div>}{isClosed && summary && <div className="detail-line"><span>Saldo final</span><strong>{money(summary.closing_balance)}</strong></div>}{!isClosed && <p className="closing-help">Fechar o período encerra a prestação de contas conforme as regras do backend. Depois disso, alterações ficam sujeitas ao fluxo de correção e reabertura.</p>}</section></div>
    {confirming && <div className="confirmation-backdrop" role="presentation"><div className="confirmation-dialog" role="dialog" aria-modal="true" aria-labelledby="closing-confirmation-title"><p className="eyebrow">CONFIRMAÇÃO NECESSÁRIA</p><h2 id="closing-confirmation-title">Fechar período</h2><p>Você está prestes a fechar o período de <strong>{periodLabel(referencePeriod)}</strong>.</p>{summary && <p>Saldo atual: <strong>{money(summary.closing_balance)}</strong></p>}<p className="dialog-warning">Após o fechamento, as operações financeiras do período ficarão sujeitas às regras de período fechado.</p><div className="dialog-actions"><button type="button" className="secondary-button" disabled={pending} onClick={() => setConfirming(false)}>Cancelar</button><button type="button" className="primary-button" disabled={pending} onClick={closePeriod}>{pending ? "Fechando período..." : "Confirmar fechamento"}</button></div></div></div>}
  </section>;
}