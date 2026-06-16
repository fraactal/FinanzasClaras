import { FormEvent, useEffect, useMemo, useState } from "react";

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CategoryForm>(initialForm);
  const [pickerOpen, setPickerOpen] = useState(false);

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
    await createCategory(form);
    setForm(initialForm);
    await load();
  }

  async function moveCategory(category: Category, direction: "up" | "down") {
    const index = sortedCategories.findIndex((item) => item.id === category.id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (index < 0 || targetIndex < 0 || targetIndex >= sortedCategories.length) {
      return;
    }

    const current = sortedCategories[index];
    const target = sortedCategories[targetIndex];

    await Promise.all([
      updateCategory(current.id, { order_position: target.order_position }),
      updateCategory(target.id, { order_position: current.order_position }),
    ]);
    await load();
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
        {sortedCategories.map((category, index) => (
          <article className="list-row card category-row" key={category.id}>
            <div className="category-main">
              <span className="category-icon-badge" style={{ backgroundColor: category.color ?? "#5a8f5a" }}>
                {category.emoji}
              </span>
              <div>
                <strong>{category.nombre}</strong>
                <p>{category.activa ? "Activa" : "Oculta"}</p>
              </div>
            </div>
            <div className="row-actions wrap-actions">
              <button className="ghost-button small" onClick={() => moveCategory(category, "up")} disabled={index === 0} type="button">
                Subir
              </button>
              <button
                className="ghost-button small"
                onClick={() => moveCategory(category, "down")}
                disabled={index === sortedCategories.length - 1}
                type="button"
              >
                Bajar
              </button>
              <button className="ghost-button small" onClick={() => updateCategory(category.id, { activa: !category.activa }).then(load)} type="button">
                {category.activa ? "Ocultar" : "Activar"}
              </button>
              <button className="ghost-button small danger" onClick={() => deleteCategoryApi(category.id).then(load)} type="button">
                Eliminar
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
