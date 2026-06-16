import { useEffect, useState } from "react";

import { CategorySummary, Money } from "../components/ReportCards";
import { fetchMonthlyReport } from "../services/dashboard";
import type { MonthlyReport } from "../types";

export function MonthPage() {
  const now = new Date();
  const [report, setReport] = useState<MonthlyReport | null>(null);

  useEffect(() => {
    fetchMonthlyReport(now.getFullYear(), now.getMonth() + 1).then(setReport).catch(console.error);
  }, []);

  if (!report) {
    return <div className="screen-center">Cargando tu resumen mensual...</div>;
  }

  const max = Math.max(...report.semanas.map((week) => week.total), 1);

  return (
    <div className="stack-page">
      <section className="stats-grid">
        <article className="stat-card"><p>Total del mes</p><strong><Money value={report.total} /></strong></article>
        <article className="stat-card"><p>Promedio diario</p><strong><Money value={report.promedio_diario} /></strong></article>
        <article className="stat-card"><p>Proyección</p><strong>{report.proyeccion ? <Money value={report.proyeccion} /> : "Sin datos"}</strong></article>
        <article className="stat-card"><p>Días con gasto</p><strong>{report.dias_con_gasto}</strong></article>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Semanas</p>
            <h2>Desglose del mes</h2>
          </div>
        </div>
        <div className="list-stack">
          {report.semanas.map((week) => (
            <div className="week-row" key={week.etiqueta}>
              <span>{week.etiqueta}</span>
              <div className="week-track">
                <div className="week-fill" style={{ width: `${(week.total / max) * 100}%` }} />
              </div>
              <strong><Money value={week.total} /></strong>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Categorías</p>
            <h2>Lo que más pesa este mes</h2>
          </div>
        </div>
        <CategorySummary data={report.categorias} />
      </section>
    </div>
  );
}
