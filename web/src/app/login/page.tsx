"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const principles = [
  { text: "Cada um contribua segundo propôs no seu coração; não com tristeza, ou por necessidade; porque Deus ama ao que dá com alegria.", reference: "2 Coríntios 9:7" },
  { text: "Quem é fiel no pouco também é fiel no muito; e quem é injusto no pouco também é injusto no muito.", reference: "Lucas 16:10" },
  { text: "Honra ao Senhor com os teus bens e com as primícias de toda a tua renda.", reference: "Provérbios 3:9" },
  { text: "Porque tudo vem de ti, e das tuas mãos to damos.", reference: "1 Crônicas 29:14" },
];

export default function LoginPage() {
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [principleIndex, setPrincipleIndex] = useState(0);

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setPrincipleIndex((currentIndex) => (currentIndex + 1) % principles.length);
    }, 7000);

    return () => window.clearInterval(rotation);
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    if (!supabaseConfigured) { setError("O Supabase ainda não foi configurado neste ambiente."); setLoading(false); return; }
    try {
      const supabase = createClient();
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError("E-mail ou senha inválidos.");
      } else if (!data.session) {
        setError("A autenticação foi concluída sem criar uma sessão. Tente novamente.");
      } else {
        window.location.replace("/");
        return;
      }
    } catch (signInFailure) {
      console.error("Login failed:", signInFailure);
      setError("Não foi possível concluir o login. Verifique a conexão e tente novamente.");
    }
    setLoading(false);
  }

  return (
    <main className="login-layout">
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-form-shell">
          <Link className="brand login-brand" href="/" aria-label="Ir para o dashboard">
            <Image alt="Ecclesia Finance" className="h-11 w-auto object-contain" height={44} priority src="/branding/ecclesia-finance-logo.png" width={190} />
          </Link>
          <p className="eyebrow login-eyebrow">CONTROLE COM TRANSPARÊNCIA</p>
          <h1 id="login-title">Entrar na sua administração</h1>
          <p className="login-copy">Acesse as congregações e os fechamentos financeiros permitidos para o seu usuário.</p>
          {!supabaseConfigured && <div className="login-alert" role="alert"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.75 21 20.25H3L12 3.75Z" /><path d="M12 9v4.5m0 3h.01" /></svg><span>O Supabase não está configurado neste deploy. Revise as variáveis de ambiente do projeto na Vercel.</span></div>}
          <form onSubmit={handleSubmit}>
            <label className="login-field" htmlFor="login-email">E-mail
              <span className="login-input-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.75" y="5.25" width="16.5" height="13.5" rx="2" /><path d="m4.5 7 7.5 5.25L19.5 7" /></svg><input id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></span>
            </label>
            <label className="login-field" htmlFor="login-password">Senha
              <span className="login-input-wrap"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4.5" y="10.25" width="15" height="10" rx="2" /><path d="M8 10.25V7a4 4 0 0 1 8 0v3.25m-4 4v2.5" /></svg><input id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></span>
            </label>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="login-submit" type="submit" disabled={loading || !supabaseConfigured} aria-busy={loading}>
              {loading && <svg className="login-spinner" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M21 12a9 9 0 0 0-9-9" /></svg>}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          <p className="login-footnote">Acesso protegido · Ecclesia Finance</p>
        </div>
      </section>
      <aside className="login-visual">
        <div className="login-visual-image" role="img" aria-label="Interior de uma capela histórica iluminada por janelas altas" />
        <div className="login-visual-content">
          <span className="visual-kicker"><span /> GESTÃO A SERVIÇO DA MISSÃO</span>
          <blockquote className="login-quote">
            <span className="quote-mark" aria-hidden="true">“</span>
            <p className="login-quote-text" key={principleIndex}>{principles[principleIndex].text}</p>
            <footer><span className="quote-rule" /><cite>{principles[principleIndex].reference}</cite></footer>
            <div className="quote-pagination" role="group" aria-label="Selecionar princípio">
              {principles.map((principle, index) => <button type="button" key={principle.reference} className={index === principleIndex ? "is-active" : ""} aria-label={`Mostrar ${principle.reference}`} aria-pressed={index === principleIndex} onClick={() => setPrincipleIndex(index)} />)}
            </div>
          </blockquote>
          <p className="visual-caption">Uma gestão clara honra cada contribuição e cada pessoa servida.</p>
        </div>
        <span className="visual-wordmark" aria-hidden="true">ECCLESIA FINANCE</span>
      </aside>
    </main>
  );
}
