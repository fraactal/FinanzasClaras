import { FormEvent, useEffect, useState } from "react";

import { useUI } from "../hooks/useUI";
import { createBudget, deleteBudget, fetchBudgets, fetchCategories } from "../services/dashboard";
import type { Budget, Category } from "../types";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/currency";

function getLocalDateISO() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLocalDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("es-CL");
}

export function BudgetsPage() {
  const { confirm, notify } = useUI();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({
    periodo: "diario",
    monto: "",
    fecha_inicio: getLocalDateISO(),
    category_id: "",
  });

  async function load() {
    const [budgetRows, categoryRows] = await Promise.all([fetchBudgets(), fetchCategories()]);
    setBudgets(budgetRows);
    setCategories(categoryRows);
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const amount = parseCurrencyInput(form.monto);
    if (!amount || amount <= 0) {
      notify({ title: "Monto inválido", message: "Ingresa un monto mayor a cero.", tone: "error" });
      return;
    }

    try {
      await createBudget({
        periodo: form.periodo,
        monto: amount,
        fecha_inicio: form.fecha_inicio,
        category_id: form.category_id ? Number(form.category_id) : null,
        activo: true,
      });
      setForm({ ...form, monto: "", category_id: "" });
      await load();
      notify({ title: "Presupuesto guardado", message: "El tope quedó registrado correctamente.", tone: "success" });
    } catch {
      notify({ title: "No se pudo guardar el presupuesto", tone: "error" });
    }
  }

  async function handleDeleteBudget(budget: Budget) {
    const confirmed = await confirm({
      title: "Eliminar presupuesto",
      message: `¿Eliminar el presupuesto ${budget.periodo}?`,
      details: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await deleteBudget(budget.id);
      await load();
      notify({ title: "Presupuesto eliminado", message: "El presupuesto ya no está activo.", tone: "success" });
    } catch {
      notify({ title: "No se pudo eliminar el presupuesto", tone: "error" });
    }
  }

  return (
    <div className="stack-page">
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Límites</p>
            <h2>Topes y presupuestos</h2>
          </div>
        </div>
        <form className="expense-form" onSubmit={handleSubmit}>
          <select value={form.periodo} onChange={(e) => setForm({ ...form, periodo: e.target.value })}>
            <option value="diario">Diario</option>
            <option value="semanal">Semanal</option>
            <option value="mensual">Mensual</option>
          </select>
          <input
            type="text"
            inputMode="numeric"
            placeholder="Monto"
            value={formatCurrencyInput(form.monto)}
            onChange={(e) => setForm({ ...form, monto: e.target.value })}
            required
          />
          <input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} required />
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
            <option value="">General</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.nombre}
              </option>
            ))}
          </select>
          <button className="primary-button">Guardar presupuesto</button>
        </form>
      </section>

      <section className="list-stack">
        {budgets.map((budget) => (
          <article className="list-row card" key={budget.id}>
            <div>
              <strong>{budget.periodo.toUpperCase()}</strong>
              <p>Desde {formatLocalDate(budget.fecha_inicio)}</p>
            </div>
            <div className="row-actions">
              <strong>${budget.monto.toLocaleString("es-CL")}</strong>
              <button className="ghost-button small danger" onClick={() => handleDeleteBudget(budget)} type="button">
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
