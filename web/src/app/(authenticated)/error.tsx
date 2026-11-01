'use client';

import { useEffect } from "react";

export default function AuthenticatedError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Authenticated route error:", error);
  }, [error]);

  return (
    <section className="route-error-page">
      <div className="route-error-card" role="alert">
        <span className="route-error-card__icon" aria-hidden="true">!</span>
        <p className="eyebrow">ERRO DE CARREGAMENTO</p>
        <h1>Não foi possível exibir esta página</h1>
        <p>Ocorreu uma falha inesperada. Tente novamente; se persistir, informe o código de referência ao suporte.</p>
        {error.digest ? <code>Referência: {error.digest}</code> : null}
        <button type="button" className="primary-button" onClick={() => reset()}>
          Tentar novamente
        </button>
      </div>
    </section>
  );
}
