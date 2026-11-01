"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import type { Role } from "@/domain/access";
import { inviteOperatorAction } from "@/modules/core/canaa/actions/canaa.actions";
import type { LicenseInfo } from "@/modules/core/khatam/services/license.shared";
import { checkSeat } from "@/modules/core/khatam/services/license.shared";

type InviteRole = Extract<Role, "treasurer" | "auditor">;

export function InviteOperatorModal({ congregationId, license }: { congregationId: string | null; license: LicenseInfo | null }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<InviteRole>("treasurer");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const tooltipId = useId();
  const seatCheck = license ? checkSeat(license) : null;
  const unavailable = !congregationId || !license || license.status !== "active" || !seatCheck?.allowed;
  const unavailableMessage = !license
    ? "Configure a licença para convidar operadores."
    : !congregationId
      ? "Selecione uma congregação para convidar operadores."
      : license.status === "blocked"
        ? "A licença está bloqueada. Contate o administrador da plataforma."
        : license.status === "grace_period"
          ? "A licença está em período de carência e não permite novos convites."
      : seatCheck?.reason === "expired"
        ? "A licença expirou e não permite novos convites."
        : "Não há assentos disponíveis para novos convites.";

  useEffect(() => {
    if (isOpen) emailRef.current?.focus();
  }, [isOpen]);

  function closeModal() {
    if (pending) return;
    setIsOpen(false);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function submitInvite() {
    if (!congregationId || unavailable || pending) return;
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await inviteOperatorAction(email, role, congregationId);
        setMessage({ ok: result.ok, text: result.message });
        if (result.ok) {
          setIsOpen(false);
          setEmail("");
        }
      } catch (error) {
        console.error("Canaã operator invite failed:", error);
        setMessage({ ok: false, text: "Não foi possível concluir o convite. Tente novamente." });
      }
    });
  }

  return (
    <div className="invite-operator">
      <button
        ref={triggerRef}
        type="button"
        className="invite-operator__trigger"
        aria-disabled={unavailable}
        aria-describedby={unavailable ? tooltipId : undefined}
        onClick={() => {
          if (unavailable || pending) return;
          setMessage(null);
          setIsOpen(true);
        }}
      >
        Convidar operador
      </button>
      {unavailable ? <span id={tooltipId} className="invite-operator__tooltip" role="tooltip">{unavailableMessage}</span> : null}

      {message && !isOpen ? <p className={`invite-operator__message${message.ok ? " is-success" : " is-error"}`} role={message.ok ? "status" : "alert"}>{message.text}</p> : null}

      {isOpen ? (
        <div className="invite-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) closeModal();
        }}>
          <div
            className="invite-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="invite-operator-title"
            onKeyDown={(event) => {
              if (event.key === "Escape") closeModal();
            }}
          >
            <header className="invite-modal__header">
              <h3 id="invite-operator-title">Convidar operador</h3>
              <button type="button" onClick={closeModal} disabled={pending} className="invite-modal__close" aria-label="Fechar modal">×</button>
            </header>

            <form onSubmit={(event) => { event.preventDefault(); submitInvite(); }}>
              <label className="invite-modal__field">
                <span>E-mail</span>
                <input ref={emailRef} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@exemplo.com" required />
              </label>

              <label className="invite-modal__field">
                <span>Papel</span>
                <select value={role} onChange={(event) => {
                  const nextRole = event.target.value;
                  if (nextRole === "treasurer" || nextRole === "auditor") setRole(nextRole);
                }}>
                  <option value="treasurer">Tesoureiro</option>
                  <option value="auditor">Auditor</option>
                </select>
              </label>

              {license && seatCheck && !seatCheck.allowed ? (
                <div className="invite-modal__warning" role="status">
                  {seatCheck.reason === "expired" ? "A licença expirou." : "Não há assentos disponíveis."}
                </div>
              ) : null}

              {message ? <p className={`invite-operator__message${message.ok ? " is-success" : " is-error"}`} role={message.ok ? "status" : "alert"}>{message.text}</p> : null}

              <div className="invite-modal__actions">
                <button type="button" onClick={closeModal} disabled={pending} className="invite-modal__cancel">Cancelar</button>
                <button type="submit" disabled={unavailable || !email.trim() || pending} className="invite-modal__submit">
                  {pending ? "Enviando convite..." : "Enviar convite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
