"use client";

import { useState, useTransition } from "react";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
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
  const seatCheck = license ? checkSeat(license) : null;
  const unavailable = !congregationId || !license || !seatCheck?.allowed;

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
    <>
      <button
        type="button"
        disabled={unavailable}
        onClick={() => { setMessage(null); setIsOpen(true); }}
        style={{ alignSelf: "flex-start", padding: "10px 14px", border: "1px solid #0b1f1a", borderRadius: 10, background: unavailable ? "#c7d4cf" : "#0b1f1a", color: "#fff", fontWeight: 700, cursor: unavailable ? "not-allowed" : "pointer" }}
      >
        {license ? "Convidar operador" : "Licença não configurada"}
      </button>

      {message && !isOpen ? <p role={message.ok ? "status" : "alert"} style={{ margin: 0, color: message.ok ? "#0f6a50" : "#9b2d22" }}>{message.text}</p> : null}

      {isOpen ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11, 31, 26, 0.42)", display: "grid", placeItems: "center", zIndex: 30 }}>
          <div style={{ width: "min(420px, calc(100vw - 32px))", background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 18px 44px rgba(11, 31, 26, 0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ModuleIcon module="canaa-access" variant="icon" size={40} decorative />
                <h3 style={{ margin: 0, fontSize: 22 }}>Convidar operador</h3>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} disabled={pending} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }} aria-label="Fechar modal">×</button>
            </div>

            <label style={{ display: "grid", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "#52645d", fontWeight: 700 }}>E-mail</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@exemplo.com" style={{ width: "100%", border: "1px solid #dfeae6", borderRadius: 10, padding: "10px 12px" }} />
            </label>

            <label style={{ display: "grid", gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "#52645d", fontWeight: 700 }}>Papel</span>
              <select value={role} onChange={(event) => {
                const nextRole = event.target.value;
                if (nextRole === "treasurer" || nextRole === "auditor") setRole(nextRole);
              }} style={{ width: "100%", border: "1px solid #dfeae6", borderRadius: 10, padding: "10px 12px" }}>
                <option value="treasurer">Tesoureiro</option>
                <option value="auditor">Auditor</option>
              </select>
            </label>

            {license && seatCheck && !seatCheck.allowed ? (
              <div style={{ marginBottom: 18, padding: "10px 12px", borderRadius: 10, background: "#fff3f1", border: "1px solid #f4c9c1", color: "#9b2d22", fontSize: 12, fontWeight: 600 }}>
                {seatCheck.reason === "expired" ? "A licença do Khatam expirou." : "A cota do Khatam está esgotada."}
              </div>
            ) : null}

            {message ? <p role={message.ok ? "status" : "alert"} style={{ margin: "0 0 16px", color: message.ok ? "#0f6a50" : "#9b2d22" }}>{message.text}</p> : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setIsOpen(false)} disabled={pending} style={{ border: "1px solid #dfeae6", background: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700 }}>Cancelar</button>
              <button type="button" disabled={unavailable || !email.trim() || pending} onClick={submitInvite} style={{ border: "none", borderRadius: 10, padding: "10px 14px", background: unavailable || pending ? "#c7d4cf" : "#067a5d", color: "#fff", fontWeight: 700, cursor: unavailable || pending ? "not-allowed" : "pointer" }}>
                {pending ? "Enviando convite..." : "Enviar convite"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
