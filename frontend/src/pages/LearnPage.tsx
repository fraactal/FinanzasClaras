import { useEffect, useMemo, useState } from "react";

import { fetchTips } from "../services/dashboard";
import type { Tip } from "../types";

const accentWords = ["fugas", "hormiga", "24 horas", "presupuesto", "deseos"];

type TipTheme = {
  label: string;
  tone: "sage" | "gold" | "forest" | "clay";
  icon: string;
  pattern: "grid" | "sun" | "lines" | "dots";
};

function highlightTip(text: string) {
  let result = text;
  accentWords.forEach((word) => {
    const regex = new RegExp(word, "gi");
    result = result.replace(regex, `<mark>${word}</mark>`);
  });
  return result;
}

function getTipTheme(tip: Tip): TipTheme {
  const text = `${tip.titulo} ${tip.contenido}`.toLowerCase();

  if (text.includes("24 horas") || text.includes("planificado")) {
    return { label: "Impulsos", tone: "clay", icon: "⏳", pattern: "dots" };
  }
  if (text.includes("presupuesto") || text.includes("sueldo")) {
    return { label: "Presupuesto", tone: "gold", icon: "📒", pattern: "grid" };
  }
  if (text.includes("hormiga") || text.includes("ingresos")) {
    return { label: "Ahorro", tone: "forest", icon: "🌱", pattern: "lines" };
  }
  if (text.includes("fijos") || text.includes("variables") || text.includes("deseos")) {
    return { label: "Orden", tone: "sage", icon: "🧩", pattern: "grid" };
  }

  return { label: "Hábitos", tone: "sage", icon: "🪴", pattern: "sun" };
}

export function LearnPage() {
  const [tips, setTips] = useState<Tip[]>([]);

  useEffect(() => {
    fetchTips().then(setTips).catch(console.error);
  }, []);

  const featured = useMemo(() => tips[new Date().getDate() % Math.max(tips.length, 1)], [tips]);
  const secondaryTips = useMemo(() => tips.filter((tip) => tip.id !== featured?.id), [tips, featured]);
  const featuredTheme = featured
    ? getTipTheme(featured)
    : ({ label: "Hábitos", tone: "sage", icon: "🪴", pattern: "sun" } as const);

  return (
    <div className="stack-page learn-page">
      <section className="learn-spotlight">
        <div className="learn-copy">
          <p className="eyebrow">Aprende</p>
          <h2>Ideas simples que sí cambian hábitos.</h2>
          <p className="learn-lead">
            No necesitas fórmulas complejas. Necesitas recordatorios claros, repetibles y visuales para tomar mejores decisiones.
          </p>
        </div>

        <article className={`learn-featured-card pattern-${featuredTheme.pattern}`}>
          <div className="learn-featured-top">
            <span className="learn-featured-icon">💡</span>
            <span className="learn-featured-label">Consejo del día</span>
          </div>
          <div className={`learn-micro-tag ${featuredTheme.tone}`}>
            <span className="learn-micro-icon">{featuredTheme.icon}</span>
            <span>{featuredTheme.label}</span>
          </div>
          <h3>{featured?.titulo ?? "Cargando consejo..."}</h3>
          <p
            className="learn-featured-text"
            dangerouslySetInnerHTML={{
              __html: featured ? highlightTip(featured.contenido) : "Estamos preparando una idea útil para hoy.",
            }}
          />
          <div className="learn-featured-footer">
            <span>Pequeño cambio</span>
            <strong>Gran impacto acumulado</strong>
          </div>
        </article>
      </section>

      <section className="learn-ribbon">
        <div className="learn-ribbon-item">
          <strong>7 días</strong>
          <span>para detectar patrones</span>
        </div>
        <div className="learn-ribbon-item">
          <strong>24 horas</strong>
          <span>antes de compras impulsivas</span>
        </div>
        <div className="learn-ribbon-item">
          <strong>1 presupuesto</strong>
          <span>antes de recibir tu sueldo</span>
        </div>
      </section>

      <section className="learn-grid">
        {secondaryTips.map((tip, index) => {
          const theme = getTipTheme(tip);
          return (
            <article className={`learn-tip-card learn-tone-${(index % 4) + 1} pattern-${theme.pattern}`} key={tip.id}>
              <div className="learn-tip-head">
                <span className="learn-tip-badge">{String(index + 1).padStart(2, "0")}</span>
                <span className="learn-tip-icon">{theme.icon}</span>
              </div>
              <div className={`learn-micro-tag ${theme.tone}`}>
                <span className="learn-micro-icon">{theme.icon}</span>
                <span>{theme.label}</span>
              </div>
              <h3>{tip.titulo}</h3>
              <p>{tip.contenido}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
