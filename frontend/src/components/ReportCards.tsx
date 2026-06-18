import type { BudgetStatus, CategoryTotal } from "../types";

export function Money({ value }: { value?: number | null }) {
  const formatter = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });
  return <>{formatter.format(value ?? 0)}</>;
}

type BudgetBannerPeriod = "day" | "week" | "month";

const budgetBannerCopy: Record<BudgetBannerPeriod, { eyebrow: string; remainingSuffix: string; missingBudget: string }> = {
  day: {
    eyebrow: "Tu gasto de hoy",
    remainingSuffix: "para hoy",
    missingBudget: "Todavía no defines un tope diario.",
  },
  week: {
    eyebrow: "Tu gasto de la semana",
    remainingSuffix: "para esta semana",
    missingBudget: "Todavía no defines un tope semanal.",
  },
  month: {
    eyebrow: "Tu gasto del mes",
    remainingSuffix: "para este mes",
    missingBudget: "Todavía no defines un tope mensual.",
  },
};

export function BudgetBanner({ total, budget, period }: { total: number; budget: BudgetStatus; period: BudgetBannerPeriod }) {
  const used = Math.min(budget.porcentaje_usado ?? 0, 100);
  const copy = budgetBannerCopy[period];

  return (
    <section className={`budget-banner ${budget.estado}`}>
      <div>
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2>
          <Money value={total} />
        </h2>
        <p>
          {budget.presupuesto
            ? `Te quedan ${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(
                budget.restante ?? 0,
              )} ${copy.remainingSuffix}`
            : copy.missingBudget}
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
          <div className="category-summary-copy">
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
