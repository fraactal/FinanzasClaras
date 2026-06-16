import type { BudgetStatus, CategoryTotal } from "../types";

export function Money({ value }: { value?: number | null }) {
  const formatter = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
  return <>{formatter.format(value ?? 0)}</>;
}

export function BudgetBanner({ total, budget }: { total: number; budget: BudgetStatus }) {
  const used = Math.min(budget.porcentaje_usado ?? 0, 100);
  return (
    <section className={`budget-banner ${budget.estado}`}>
      <div>
        <p className="eyebrow">Tu gasto de hoy</p>
        <h2>
          <Money value={total} />
        </h2>
        <p>
          {budget.presupuesto
            ? `Te quedan ${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(
                budget.restante ?? 0,
              )} para hoy`
            : "Todavía no defines un tope diario."}
        </p>
      </div>
      <div className="progress-panel">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${used}%` }} />
        </div>
        <div className="progress-meta">
          <span>Usado: {budget.porcentaje_usado ? `${budget.porcentaje_usado.toFixed(0)}%` : "0%"}</span>
          <span>{budget.presupuesto ? <Money value={budget.presupuesto} /> : "Sin tope"}</span>
        </div>
      </div>
    </section>
  );
}

export function CategorySummary({ data }: { data: CategoryTotal[] }) {
  if (!data.length) {
    return <div className="empty-card">Registra tu primer gasto para ver tu resumen por categoría.</div>;
  }
  return (
    <div className="grid-cards">
      {data.map((item) => (
        <article className="category-card" key={item.category_id}>
          <span className="emoji-pill">{item.emoji}</span>
          <div>
            <h3>{item.nombre}</h3>
            <strong>
              <Money value={item.total} />
            </strong>
          </div>
        </article>
      ))}
    </div>
  );
}
