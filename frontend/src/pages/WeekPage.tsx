import { useEffect, useMemo, useState } from "react";

import { CategorySummary, Money } from "../components/ReportCards";
import { fetchWeeklyReport, today } from "../services/dashboard";
import type { WeeklyReport } from "../types";

function shiftDate(dateString: string, days: number) {
  const base = new Date(`${dateString}T12:00:00`);
  base.setDate(base.getDate() + days);
  const year = base.getFullYear();
  const month = String(base.getMonth() + 1).padStart(2, "0");
  const day = String(base.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatRange(report: WeeklyReport) {
  const from = new Date(`${report.desde}T12:00:00`);
  const to = new Date(`${report.hasta}T12:00:00`);
  return `${from.toLocaleDateString("es-CL", { day: "numeric", month: "long" })} - ${to.toLocaleDateString("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;
}

export function WeekPage() {
  const [referenceDate, setReferenceDate] = useState(today());
  const [report, setReport] = useState<WeeklyReport | null>(null);

  useEffect(() => {
    fetchWeeklyReport(referenceDate).then(setReport).catch(console.error);
  }, [referenceDate]);

  const rangeLabel = useMemo(() => (report ? formatRange(report) : ""), [report]);

  if (!report) {
    return <div className="screen-center">Cargando tu resumen semanal...</div>;
  }

  const max = Math.max(...report.dias.map((day) => day.total), 1);

  return (
    <div className="stack-page">
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Semana</p>
            <h2>Navega tus semanas registradas</h2>
            <p className="section-subtitle">{rangeLabel}</p>
          </div>
          <div className="row-actions">
            <button className="ghost-button small" type="button" onClick={() => setReferenceDate((current) => shiftDate(current, -7))}>
              Semana anterior
            </button>
            <button className="ghost-button small" type="button" onClick={() => setReferenceDate(today())}>
              Semana actual
            </button>
            <button className="ghost-button small" type="button" onClick={() => setReferenceDate((current) => shiftDate(current, 7))}>
              Semana siguiente
            </button>
          </div>
        </div>
      </section>

      <section className="stats-grid">
        <article className="stat-card"><p>Total de la semana</p><strong><Money value={report.total} /></strong></article>
        <article className="stat-card"><p>Promedio diario</p><strong><Money value={report.promedio_diario} /></strong></article>
        <article className="stat-card"><p>Día más caro</p><strong><Money value={report.mayor_gasto_dia} /></strong></article>
        <article className="stat-card"><p>Días con gasto</p><strong>{report.dias_con_gasto}</strong></article>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Comparación</p>
            <h2>Gasto por día</h2>
          </div>
        </div>
        <div className="chart-row">
          {report.dias.map((day) => (
            <div className="chart-bar-card" key={day.fecha}>
              <div className="chart-bar-wrap">
                <div className="chart-bar" style={{ height: `${Math.max((day.total / max) * 160, 8)}px` }} />
              </div>
              <strong>{new Date(`${day.fecha}T12:00:00`).toLocaleDateString("es-CL", { weekday: "short" })}</strong>
              <span><Money value={day.total} /></span>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Categorías</p>
            <h2>En qué se fue el dinero</h2>
          </div>
        </div>
        <CategorySummary data={report.categorias} />
      </section>
    </div>
  );
}
