export default function Loading() {
  return (
    <section className="dashboard-page loading-state" role="status" aria-label="Carregando painel financeiro">
      <span className="loading-label">Carregando painel financeiro</span>
      <div className="loading-heading"><div className="skeleton skeleton-eyebrow" /><div className="skeleton skeleton-title" /><div className="skeleton skeleton-copy" /></div>
      <div className="metrics" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => <div className="metric skeleton-metric" key={index}><div className="skeleton skeleton-label" /><div className="skeleton skeleton-value" /><div className="skeleton skeleton-copy" /></div>)}
      </div>
      <div className="dashboard-grid" aria-hidden="true"><div className="panel skeleton-panel"><div className="skeleton skeleton-label" /><div className="skeleton skeleton-copy" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line" /></div><div className="panel skeleton-panel"><div className="skeleton skeleton-label" /><div className="skeleton skeleton-copy" /><div className="skeleton skeleton-line" /><div className="skeleton skeleton-line" /></div></div>
    </section>
  );
}