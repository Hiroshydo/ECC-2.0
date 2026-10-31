'use client';

import { useEffect } from "react";

export default function AuthenticatedError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Authenticated route error:", error);
  }, [error]);

  return (
    <section className="module-page" style={{ maxWidth: 560, margin: "32px auto" }}>
      <div className="notice warning" role="alert" style={{ display: "grid", gap: 10, padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span aria-hidden="true" style={{ fontSize: 26 }}>⚠️</span>
          <strong style={{ fontSize: 18 }}>Ocorreu uma instabilidade ao carregar os dados financeiros</strong>
        </div>
        <p style={{ margin: 0, color: "#475569" }}>
          Tente novamente em alguns segundos. Se o problema persistir, verifique se a base de dados e as variáveis de ambiente estão disponíveis.
        </p>
        <button type="button" className="primary-button" onClick={() => reset()} style={{ justifySelf: "flex-start" }}>
          Recarregar página
        </button>
      </div>
    </section>
  );
}
