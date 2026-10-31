"use client";

import { useMemo, useState } from "react";

import { ModuleIcon } from "@/components/brand/ModuleIcon";
import { checkSeat } from "@/modules/core/khatam/services/license.service";

const defaultLicense = {
  seatsTotal: 5,
  seatsUsed: 3,
  expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export function InviteOperatorModal({ license = defaultLicense }: { license?: { seatsTotal: number; seatsUsed: number; expiresAt: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"tesoureiro" | "secretario">("tesoureiro");

  const seatCheck = useMemo(() => checkSeat(license, new Date()), [license]);
  const buttonDisabled = !seatCheck.allowed;

  return (
    <>
      <button type="button" onClick={() => setIsOpen(true)} style={{ alignSelf: "flex-start", padding: "10px 14px", border: "1px solid #0b1f1a", borderRadius: 10, background: "#0b1f1a", color: "#fff", fontWeight: 700 }}>
        Convidar operador
      </button>

      {isOpen ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(11, 31, 26, 0.42)", display: "grid", placeItems: "center", zIndex: 30 }}>
          <div style={{ width: "min(420px, calc(100vw - 32px))", background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 18px 44px rgba(11, 31, 26, 0.18)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <ModuleIcon module="canaa-access" variant="icon" size={40} decorative />
                <h3 style={{ margin: 0, fontSize: 22 }}>Convidar operador</h3>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} style={{ border: "none", background: "transparent", fontSize: 18, cursor: "pointer" }} aria-label="Fechar modal">×</button>
            </div>

            <label style={{ display: "grid", gap: 8, marginBottom: 16 }}>
              <span style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "#52645d", fontWeight: 700 }}>E-mail</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nome@exemplo.com" style={{ width: "100%", border: "1px solid #dfeae6", borderRadius: 10, padding: "10px 12px" }} />
            </label>

            <label style={{ display: "grid", gap: 8, marginBottom: 18 }}>
              <span style={{ fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase", color: "#52645d", fontWeight: 700 }}>Papel</span>
              <select value={role} onChange={(event) => setRole(event.target.value as "tesoureiro" | "secretario")} style={{ width: "100%", border: "1px solid #dfeae6", borderRadius: 10, padding: "10px 12px" }}>
                <option value="tesoureiro">Tesoureiro</option>
                <option value="secretario">Secretário</option>
              </select>
            </label>

            {!seatCheck.allowed ? (
              <div style={{ marginBottom: 18, padding: "10px 12px", borderRadius: 10, background: "#fff3f1", border: "1px solid #f4c9c1", color: "#9b2d22", fontSize: 12, fontWeight: 600 }}>
                {seatCheck.reason === "expired" ? "A licença do Khatam expirou." : "A cota do Khatam está esgotada."}
              </div>
            ) : null}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button type="button" onClick={() => setIsOpen(false)} style={{ border: "1px solid #dfeae6", background: "#fff", borderRadius: 10, padding: "10px 14px", fontWeight: 700 }}>Cancelar</button>
              <button type="button" disabled={buttonDisabled || !email.trim()} onClick={() => setIsOpen(false)} style={{ border: "none", borderRadius: 10, padding: "10px 14px", background: buttonDisabled ? "#c7d4cf" : "#067a5d", color: "#fff", fontWeight: 700, cursor: buttonDisabled ? "not-allowed" : "pointer" }}>
                {buttonDisabled ? "Cota indisponível" : "Enviar convite"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
