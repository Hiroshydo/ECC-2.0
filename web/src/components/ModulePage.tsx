import { Settings2 } from "lucide-react";

export function ModulePage({ title, description }: { title: string; description: string }) {
  return (
    <section className="module-page">
      <p className="eyebrow">PREFERÊNCIAS DA CONTA</p>
      <h1>{title}</h1>
      <p>{description}</p>
      <div className="empty-state module-empty" role="status">
        <span className="module-empty-mark" aria-hidden="true"><Settings2 size={22}/></span>
        <div className="module-empty-copy">
          <span className="module-empty-state">EM PREPARAÇÃO</span>
          <strong>Opções ainda indisponíveis</strong>
          <span>Esta área receberá suas opções de conta e congregação em uma atualização futura.</span>
        </div>
      </div>
    </section>
  );
}