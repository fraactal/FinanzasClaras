import { FormEvent, useEffect, useMemo, useState } from "react";

import { BudgetBanner, CategorySummary, Money } from "../components/ReportCards";
import { useUI } from "../hooks/useUI";
import {
  createExpense,
  deleteExpense,
  fetchCategories,
  fetchDailyReport,
  fetchExpenses,
  fetchMonthlyReport,
  fetchWeeklyReport,
  today,
} from "../services/dashboard";
import type { Category, DailyReport, Expense, MonthlyReport, WeeklyReport } from "../types";

const quickAmounts = [1000, 2000, 5000, 10000, 20000];

type DashboardTab = "day" | "week" | "month";

function shiftDate(dateString: string, days: number) {
  const base = new Date(`${dateString}T12:00:00`);
  base.setDate(base.getDate() + days);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toMonthValue(dateString: string) {
  return dateString.slice(0, 7);
}

function shiftMonth(monthValue: string, amount: number) {
  const [yearString, monthString] = monthValue.split("-");
  const base = new Date(Number(yearString), Number(monthString) - 1 + amount, 1);
  return `${base.getFullYear()}-${String(base.getMonth() + 1).padStart(2, "0")}`;
}

function formatLongDate(dateString: string) {
  return new Date(`${dateString}T12:00:00`).toLocaleDateString("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatWeekRange(report: WeeklyReport) {
  const from = new Date(`${report.desde}T12:00:00`);
  const to = new Date(`${report.hasta}T12:00:00`);
  return `${from.toLocaleDateString("es-CL", { day: "numeric", month: "long" })} - ${to.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

function formatMonthLabel(monthValue: string) {
  const [yearString, monthString] = monthValue.split("-");
  return new Date(Number(yearString), Number(monthString) - 1, 1).toLocaleDateString("es-CL", {
    month: "long",
    year: "numeric",
  });
}

function monthValueToParts(monthValue: string) {
  const [yearString, monthString] = monthValue.split("-");
  return {
    year: Number(yearString),
    month: Number(monthString),
  };
}

export function DashboardPage() {
  const { confirm, notify } = useUI();
  const initialDate = today();
  const [activeTab, setActiveTab] = useState<DashboardTab>("day");
  const [categories, setCategories] = useState<Category[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyReport | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReport | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [weekReferenceDate, setWeekReferenceDate] = useState(initialDate);
  const [selectedMonth, setSelectedMonth] = useState(toMonthValue(initialDate));
  const [form, setForm] = useState({
    descripcion: "",
    monto: "",
    category_id: "",
    metodo_pago: "debito",
    fecha_gasto: initialDate,
  });
  const [error, setError] = useState("");

  const selectedCategoryId = useMemo(() => Number(form.category_id || categories[0]?.id || 0), [form.category_id, categories]);
  const formattedSelectedDate = useMemo(() => formatLongDate(selectedDate), [selectedDate]);
  const formattedWeekRange = useMemo(() => (weeklyReport ? formatWeekRange(weeklyReport) : ""), [weeklyReport]);
  const formattedMonth = useMemo(() => formatMonthLabel(selectedMonth), [selectedMonth]);

  async function loadCategories() {
    const data = await fetchCategories();
    const activeCategories = data.filter((item) => item.activa);
    setCategories(activeCategories);
    setForm((prev) => {
      if (prev.category_id || !activeCategories[0]) {
        return prev;
      }

      return { ...prev, category_id: String(activeCategories[0].id) };
    });
  }

  async function loadDaily(date: string) {
    const [reportData, items] = await Promise.all([fetchDailyReport(date), fetchExpenses(`date=${date}`)]);
    setDailyReport(reportData);
    setExpenses(items);
  }

  async function loadWeekly(date: string) {
    const reportData = await fetchWeeklyReport(date);
    setWeeklyReport(reportData);
  }

  async function loadMonthly(monthValue: string) {
    const { year, month } = monthValueToParts(monthValue);
    const reportData = await fetchMonthlyReport(year, month);
    setMonthlyReport(reportData);
  }

  useEffect(() => {
    loadCategories().catch((err) => setError(err instanceof Error ? err.message : "No se pudieron cargar las categorías."));
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, fecha_gasto: selectedDate }));
    loadDaily(selectedDate).catch((err) => setError(err instanceof Error ? err.message : "No se pudo actualizar el día."));
  }, [selectedDate]);

  useEffect(() => {
    loadWeekly(weekReferenceDate).catch((err) => setError(err instanceof Error ? err.message : "No se pudo actualizar la semana."));
  }, [weekReferenceDate]);

  useEffect(() => {
    loadMonthly(selectedMonth).catch((err) => setError(err instanceof Error ? err.message : "No se pudo actualizar el mes."));
  }, [selectedMonth]);

  async function refreshDaily(date = selectedDate) {
    await Promise.all([loadCategories(), loadDaily(date)]);
  }

  async function submitExpense(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!selectedCategoryId) {
      setError("Crea o activa al menos una categoría antes de registrar gastos.");
      return;
    }

    try {
      await createExpense({
        descripcion: form.descripcion || "Sin descripción",
        monto: Number(form.monto),
        category_id: selectedCategoryId,
        fecha_gasto: form.fecha_gasto,
        tipo: "gasto",
        metodo_pago: form.metodo_pago,
      });
      setForm((prev) => ({ ...prev, descripcion: "", monto: "" }));
      await Promise.all([
        refreshDaily(form.fecha_gasto),
        loadWeekly(form.fecha_gasto),
        loadMonthly(toMonthValue(form.fecha_gasto)),
      ]);
      setWeekReferenceDate(form.fecha_gasto);
      setSelectedMonth(toMonthValue(form.fecha_gasto));
      notify({ title: "Gasto registrado", message: "El gasto se guardó correctamente.", tone: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el gasto.");
      notify({ title: "No se pudo guardar el gasto", tone: "error" });
    }
  }

  async function addQuickExpense(monto: number) {
    setError("");
    if (!selectedCategoryId) {
      setError("Crea o activa al menos una categoría antes de usar gastos rápidos.");
      return;
    }

    try {
      await createExpense({
        descripcion: `Gasto rápido ${new Intl.NumberFormat("es-CL", {
          style: "currency",
          currency: "CLP",
          maximumFractionDigits: 0,
        }).format(monto)}`,
        monto,
        category_id: selectedCategoryId,
        fecha_gasto: form.fecha_gasto,
        tipo: "gasto",
        metodo_pago: "efectivo",
      });
      await Promise.all([
        refreshDaily(form.fecha_gasto),
        loadWeekly(form.fecha_gasto),
        loadMonthly(toMonthValue(form.fecha_gasto)),
      ]);
      setWeekReferenceDate(form.fecha_gasto);
      setSelectedMonth(toMonthValue(form.fecha_gasto));
      notify({ title: "Gasto rápido registrado", message: "El movimiento se agregó correctamente.", tone: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo registrar el gasto rápido.");
      notify({ title: "No se pudo registrar el gasto rápido", tone: "error" });
    }
  }

  async function removeExpense(id: number) {
    const confirmed = await confirm({
      title: "Eliminar gasto",
      message: "¿Eliminar este gasto?",
      details: "Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      tone: "danger",
    });
    if (!confirmed) {
      return;
    }

    try {
      await deleteExpense(id);
      await Promise.all([
        refreshDaily(selectedDate),
        loadWeekly(weekReferenceDate),
        loadMonthly(selectedMonth),
      ]);
      notify({ title: "Gasto eliminado", message: "El movimiento fue eliminado.", tone: "success" });
    } catch {
      notify({ title: "No se pudo eliminar el gasto", tone: "error" });
    }
  }

  const currentBudget =
    activeTab === "day"
      ? dailyReport?.presupuesto
      : activeTab === "week"
        ? weeklyReport?.presupuesto
        : monthlyReport?.presupuesto;

  const currentTotal =
    activeTab === "day"
      ? dailyReport?.total
      : activeTab === "week"
        ? weeklyReport?.total
        : monthlyReport?.total;

  const weeklyMax = Math.max(...(weeklyReport?.dias.map((day) => day.total) ?? [1]), 1);
  const monthlyMax = Math.max(...(monthlyReport?.semanas.map((week) => week.total) ?? [1]), 1);

  return (
    <div className="stack-page">
      {currentBudget && typeof currentTotal === "number" ? <BudgetBanner total={currentTotal} budget={currentBudget} period={activeTab} /> : null}

      <section className="card">
        <div className="section-head section-head-start">
          <div>
            <p className="eyebrow">Gastos</p>
            <h2>Registra y revisa tu ritmo financiero</h2>
            <p className="section-subtitle">
              Un solo espacio para cargar gastos y comparar tu día, semana y mes.
            </p>
          </div>
        </div>

        <div className="dashboard-tabs" role="tablist" aria-label="Vista de gastos">
          <button
            type="button"
            className={`dashboard-tab ${activeTab === "day" ? "active" : ""}`}
            onClick={() => setActiveTab("day")}
          >
            Día
          </button>
          <button
            type="button"
            className={`dashboard-tab ${activeTab === "week" ? "active" : ""}`}
            onClick={() => setActiveTab("week")}
          >
            Semana
          </button>
          <button
            type="button"
            className={`dashboard-tab ${activeTab === "month" ? "active" : ""}`}
            onClick={() => setActiveTab("month")}
          >
            Mes
          </button>
        </div>

        {activeTab === "day" ? (
          <div className="dashboard-panel">
            <div className="dashboard-toolbar">
              <div>
                <p className="eyebrow">Registro diario</p>
                <h3>Qué pasó ese día</h3>
                <p className="section-subtitle">{formattedSelectedDate}</p>
              </div>
              <div className="dashboard-toolbar-controls day-toolbar-controls">
                <input
                  className="toolbar-date-input"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setWeekReferenceDate(e.target.value);
                    setSelectedMonth(toMonthValue(e.target.value));
                  }}
                />
              </div>
            </div>

            <div className="section-head dashboard-quick-head">
              <div>
                <p className="eyebrow">Registro rápido</p>
                <h3>Agregar gasto</h3>
              </div>
              <select
                className="dashboard-category-select"
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                disabled={!categories.length}
              >
                {categories.map((category) => (
                  <option value={category.id} key={category.id}>
                    {category.emoji} {category.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="quick-grid">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  className="quick-note"
                  onClick={() => addQuickExpense(amount)}
                  disabled={!categories.length}
                  type="button"
                >
                  <span>+ rápido</span>
                  <strong>
                    <Money value={amount} />
                  </strong>
                </button>
              ))}
            </div>

            <form onSubmit={submitExpense} className="expense-form">
              <input
                placeholder="¿En qué lo gastaste?"
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
              <input
                type="number"
                min="1"
                placeholder="Monto"
                value={form.monto}
                onChange={(e) => setForm({ ...form, monto: e.target.value })}
                required
              />
              <input
                type="date"
                value={form.fecha_gasto}
                onChange={(e) => {
                  setForm({ ...form, fecha_gasto: e.target.value });
                  setSelectedDate(e.target.value);
                  setWeekReferenceDate(e.target.value);
                  setSelectedMonth(toMonthValue(e.target.value));
                }}
                required
              />
              <select value={form.metodo_pago} onChange={(e) => setForm({ ...form, metodo_pago: e.target.value })}>
                <option value="efectivo">Efectivo</option>
                <option value="debito">Débito</option>
                <option value="credito">Crédito</option>
                <option value="transferencia">Transferencia</option>
                <option value="otro">Otro</option>
              </select>
              <button className="primary-button" disabled={!categories.length}>
                Agregar gasto
              </button>
            </form>

            {error && <div className="form-error">{error}</div>}
            {!categories.length && <div className="empty-card">Primero crea una categoría en Configuración.</div>}

            <section className="dual-grid">
              <article className="card">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">Resumen</p>
                    <h3>Por categoría</h3>
                  </div>
                </div>
                <CategorySummary data={dailyReport?.categorias ?? []} />
              </article>

              <article className="card">
                <div className="section-head">
                  <div>
                    <p className="eyebrow">Movimientos</p>
                    <h3>Gastos de la fecha</h3>
                  </div>
                </div>
                {expenses.length === 0 ? (
                  <div className="empty-card">Aún no registras gastos para esta fecha.</div>
                ) : (
                  <div className="list-stack daily-expense-list">
                    {expenses.map((expense) => {
                      const category = categories.find((item) => item.id === expense.category_id);
                      return (
                        <div className="list-row daily-expense-row" key={expense.id}>
                          <div className="daily-expense-copy">
                            <strong>
                              {category?.emoji} {expense.descripcion}
                            </strong>
                            <p>
                              {category?.nombre ?? "Sin categoría"} ·{" "}
                              {new Date(`${expense.fecha_gasto}T12:00:00`).toLocaleDateString("es-CL")}
                            </p>
                          </div>
                          <div className="row-actions daily-expense-actions">
                            <span className="daily-expense-amount">
                              <Money value={expense.monto} />
                            </span>
                            <button
                              className="ghost-button small danger icon-button daily-expense-delete"
                              onClick={() => removeExpense(expense.id)}
                              type="button"
                              aria-label="Eliminar gasto"
                              title="Eliminar gasto"
                            >
                              <span aria-hidden="true">🗑️</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            </section>
          </div>
        ) : null}

        {activeTab === "week" ? (
          <div className="dashboard-panel">
            <div className="dashboard-toolbar">
              <div>
                <p className="eyebrow">Vista semanal</p>
                <h3>Navega tus semanas registradas</h3>
                <p className="section-subtitle">{formattedWeekRange}</p>
              </div>
              <div className="dashboard-toolbar-controls wrap-actions weekly-toolbar-controls">
                <button
                  className="ghost-button small weekly-nav-button"
                  type="button"
                  onClick={() => setWeekReferenceDate((current) => shiftDate(current, -7))}
                  aria-label="Semana anterior"
                  title="Semana anterior"
                >
                  ←
                </button>
                <button className="ghost-button small weekly-current-button" type="button" onClick={() => setWeekReferenceDate(today())}>
                  Semana actual
                </button>
                <button
                  className="ghost-button small weekly-nav-button"
                  type="button"
                  onClick={() => setWeekReferenceDate((current) => shiftDate(current, 7))}
                  aria-label="Semana siguiente"
                  title="Semana siguiente"
                >
                  →
                </button>
              </div>
            </div>

            {!weeklyReport ? (
              <div className="empty-card">Cargando tu resumen semanal...</div>
            ) : (
              <>
                <section className="stats-grid weekly-stats-grid">
                  <article className="stat-card">
                    <p>Total de la semana</p>
                    <strong>
                      <Money value={weeklyReport.total} />
                    </strong>
                  </article>
                  <article className="stat-card">
                    <p>Promedio diario</p>
                    <strong>
                      <Money value={weeklyReport.promedio_diario} />
                    </strong>
                  </article>
                  <article className="stat-card">
                    <p>Día más caro</p>
                    <strong>
                      <Money value={weeklyReport.mayor_gasto_dia} />
                    </strong>
                  </article>
                  <article className="stat-card">
                    <p>Días con gasto</p>
                    <strong>{weeklyReport.dias_con_gasto}</strong>
                  </article>
                </section>

                <section className="card">
                  <div className="section-head">
                    <div>
                      <p className="eyebrow">Comparación</p>
                      <h3>Gasto por día</h3>
                    </div>
                  </div>
                  <div className="chart-row weekly-chart-row">
                    {weeklyReport.dias.map((day) => (
                      <div className="chart-bar-card weekly-chart-card" key={day.fecha}>
                        <div className="chart-bar-wrap">
                          <div className="chart-bar" style={{ height: `${Math.max((day.total / weeklyMax) * 160, 8)}px` }} />
                        </div>
                        <strong>{new Date(`${day.fecha}T12:00:00`).toLocaleDateString("es-CL", { weekday: "short" })}</strong>
                        <span>
                          <Money value={day.total} />
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="card">
                  <div className="section-head">
                    <div>
                      <p className="eyebrow">Categorías</p>
                      <h3>En qué se fue el dinero</h3>
                    </div>
                  </div>
                  <CategorySummary data={weeklyReport.categorias} />
                </section>
              </>
            )}
          </div>
        ) : null}

        {activeTab === "month" ? (
          <div className="dashboard-panel">
            <div className="dashboard-toolbar">
              <div>
                <p className="eyebrow">Vista mensual</p>
                <h3>Cómo se está comportando el mes</h3>
                <p className="section-subtitle">{formattedMonth}</p>
              </div>
              <div className="dashboard-toolbar-controls wrap-actions monthly-toolbar-controls">
                <button
                  className="ghost-button small monthly-nav-button"
                  type="button"
                  onClick={() => setSelectedMonth((current) => shiftMonth(current, -1))}
                  aria-label="Mes anterior"
                  title="Mes anterior"
                >
                  ←
                </button>
                <button className="ghost-button small monthly-current-button" type="button" onClick={() => setSelectedMonth(toMonthValue(today()))}>
                  Mes actual
                </button>
                <button
                  className="ghost-button small monthly-nav-button"
                  type="button"
                  onClick={() => setSelectedMonth((current) => shiftMonth(current, 1))}
                  aria-label="Mes siguiente"
                  title="Mes siguiente"
                >
                  →
                </button>
                <input className="month-picker-input" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
              </div>
            </div>

            {!monthlyReport ? (
              <div className="empty-card">Cargando tu resumen mensual...</div>
            ) : (
              <>
                <section className="stats-grid monthly-stats-grid">
                  <article className="stat-card">
                    <p>Total del mes</p>
                    <strong>
                      <Money value={monthlyReport.total} />
                    </strong>
                  </article>
                  <article className="stat-card">
                    <p>Promedio diario</p>
                    <strong>
                      <Money value={monthlyReport.promedio_diario} />
                    </strong>
                  </article>
                  <article className="stat-card">
                    <p>Proyección</p>
                    <strong>{monthlyReport.proyeccion ? <Money value={monthlyReport.proyeccion} /> : "Sin datos"}</strong>
                  </article>
                  <article className="stat-card">
                    <p>Días con gasto</p>
                    <strong>{monthlyReport.dias_con_gasto}</strong>
                  </article>
                </section>

                <section className="card">
                  <div className="section-head">
                    <div>
                      <p className="eyebrow">Semanas</p>
                      <h3>Desglose del mes</h3>
                    </div>
                  </div>
                  <div className="list-stack">
                    {monthlyReport.semanas.map((week) => (
                      <div className="week-row" key={week.etiqueta}>
                        <span>{week.etiqueta}</span>
                        <div className="week-track">
                          <div className="week-fill" style={{ width: `${(week.total / monthlyMax) * 100}%` }} />
                        </div>
                        <strong>
                          <Money value={week.total} />
                        </strong>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="card">
                  <div className="section-head">
                    <div>
                      <p className="eyebrow">Categorías</p>
                      <h3>Lo que más pesa este mes</h3>
                    </div>
                  </div>
                  <CategorySummary data={monthlyReport.categorias} />
                </section>
              </>
            )}
          </div>
        ) : null}
      </section>
    </div>
  );
}
