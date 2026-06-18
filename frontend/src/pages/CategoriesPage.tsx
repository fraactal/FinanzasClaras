import { FormEvent, useEffect, useMemo, useState } from "react";

import { useUI } from "../hooks/useUI";
import { createCategory, deleteCategoryApi, fetchCategories, updateCategory } from "../services/dashboard";
import type { Category } from "../types";

const emojiOptions = [
  "💸", "🚌", "🍽️", "☕", "🎉", "💊", "🏠", "💡", "📉", "📚",
  "🧾", "🛒", "🚕", "🍔", "🥤", "🎬", "🧠", "🛏️", "📱", "💳",
  "🎓", "🐶", "👕", "🎁", "✈️", "⚽", "🍼", "🧼", "🧰", "🏥",
];

type CategoryForm = {
  nombre: string;
  emoji: string;
  color: string;
};

const initialForm: CategoryForm = { nombre: "", emoji: "💸", color: "#5a8f5a" };

export function CategoriesPage() {
  const { confirm, notify } = useUI();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState("");

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.order_position - b.order_position || a.id - b.id),
    [categories],
  );

  async function load() {
    setCategories(await fetchCategories());
  }

  useEffect(() => {
    load().catch(console.error);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await createCategory(form);
      setForm(initialForm);
      await load();
      notify({ title: "Categoría creada", message: "La categoría ya está disponible para tus registros.", tone: "success" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la categoría.");
      notify({ title: "No se pudo crear la categoría", tone: "error" });
    }
  }

  async function handleToggleCategory(category: Category) {
    try {
      setError("");
      await updateCategory(category.id, { activa: !category.activa });
      await load();
      notify({
        title: category.activa ? "Categoría oculta" : "Categoría activada",
        message: `${category.nombre} se actualizó correctamente.`,
        tone: "success",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo actualizar la categoría.");
      notify({ title: "No se pudo actualizar la categoría", tone: "error" });
    }
  }

  async function handleDeleteCategory(category: Category) {
    const confirmed = await confirm({
      title: "Eliminar categoría",
      message: `¿Eliminar la categoría "${category.nombre}"?`,
      details: 'Si tiene gastos o presupuestos asociados, se reasignarán automáticamente a "Otros".',
      confirmLabel: "Eliminar",
      cancelLabel: "Cancelar",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await deleteCategoryApi(category.id);
      await load();
      notify({
        title: "Categoría eliminada",
        message: `${category.nombre} se eliminó correctamente.`,
        tone: "success",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar la categoría.");
      notify({ title: "No se pudo eliminar la categoría", tone: "error" });
    }
  }

  return (
    <div className="stack-page">
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Personaliza</p>
            <h2>Tus categorías</h2>
            <p className="section-subtitle">Elige icono, color y el orden exacto en que quieres verlas.</p>
          </div>
        </div>
        <form className="categories-form" onSubmit={handleSubmit}>
          <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required />
          <button className="emoji-trigger" type="button" onClick={() => setPickerOpen(true)}>
            <span className="emoji-preview" style={{ backgroundColor: form.color }}>
              {form.emoji}
            </span>
            <span>Elegir icono</span>
          </button>
          <input
            className="category-color-input"
            type="color"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            aria-label="Color de la categoría"
          />
          <button className="primary-button">Crear categoría</button>
        </form>
      </section>

      <section className="list-stack">
        {error ? <div className="form-error">{error}</div> : null}
        {sortedCategories.map((category) => (
          <article className="list-row card category-row" key={category.id}>
            <div className="category-main">
              <span className="category-icon-badge" style={{ backgroundColor: category.color ?? "#5a8f5a" }}>
                {category.emoji}
              </span>
              <div className="category-copy">
                <strong>{category.nombre}</strong>
                <span className={`category-status ${category.activa ? "active" : "hidden"}`}>
                  {category.activa ? "Activa" : "Oculta"}
                </span>
              </div>
            </div>
            <div className="row-actions category-actions">
              <button
                className="ghost-button small icon-button"
                onClick={() => handleToggleCategory(category)}
                type="button"
                aria-label={category.activa ? "Ocultar categoría" : "Activar categoría"}
                title={category.activa ? "Ocultar categoría" : "Activar categoría"}
              >
                <span aria-hidden="true">{category.activa ? "👁️" : "🙈"}</span>
              </button>
              <button
                className="ghost-button small danger icon-button"
                onClick={() => handleDeleteCategory(category)}
                type="button"
                aria-label="Eliminar categoría"
                title="Eliminar categoría"
              >
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
          </article>
        ))}
      </section>

      {pickerOpen && (
        <div className="modal-backdrop" onClick={() => setPickerOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="section-head">
              <div>
                <p className="eyebrow">Iconos</p>
                <h2>Elige un icono</h2>
              </div>
              <button className="ghost-button small" type="button" onClick={() => setPickerOpen(false)}>
                Cerrar
              </button>
            </div>
            <div className="emoji-grid">
              {emojiOptions.map((emoji) => (
                <button
                  key={emoji}
                  className={`emoji-option ${form.emoji === emoji ? "active" : ""}`}
                  type="button"
                  onClick={() => {
                    setForm({ ...form, emoji });
                    setPickerOpen(false);
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
