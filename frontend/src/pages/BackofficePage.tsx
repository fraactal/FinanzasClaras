import { FormEvent, useEffect, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import {
  deactivateUserByEmail,
  fetchAdminSystemOverview,
  fetchAdminUsers,
  reactivateUserByEmail,
} from "../services/dashboard";
import type { AdminSystemOverview, AdminUser } from "../types";

const roadmapItems = [
  {
    title: "Botón flotante universal",
    description: "Acceso rápido desde cualquier pantalla para crear gasto, presupuesto y más acciones futuras.",
  },
  {
    title: "Google OAuth",
    description: "Inicio de sesión con Google para reducir fricción cuando el producto entre a una etapa más madura.",
  },
  {
    title: "Recuperación por correo real",
    description: "Enviar enlaces de recuperación por email en lugar de mostrarlos solo en modo desarrollo.",
  },
  {
    title: "Edición completa de gastos",
    description: "Cambiar fecha, categoría, descripción, método de pago y nota después de registrar un movimiento.",
  },
  {
    title: "Exportación a Excel y PDF",
    description: "Descargar reportes y respaldos para compartir o revisar fuera de la aplicación.",
  },
  {
    title: "Suscripciones SaaS",
    description: "Definir plan gratuito y premium con cobros e infraestructura preparada para producción.",
  },
  {
    title: "Recordatorios y alertas",
    description: "Notificaciones por correo o WhatsApp para registrar gastos y vigilar topes.",
  },
];

export function BackofficePage() {
  const { user } = useAuth();
  const [emailFilter, setEmailFilter] = useState("");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [systemOverview, setSystemOverview] = useState<AdminSystemOverview | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  async function loadBackoffice(filter = emailFilter) {
    const [userRows, overview] = await Promise.all([fetchAdminUsers(filter), fetchAdminSystemOverview()]);
    setUsers(userRows);
    setSystemOverview(overview);
  }

  useEffect(() => {
    if (!user?.is_admin) return;
    loadBackoffice().catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el backoffice."));
  }, [user]);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await loadBackoffice(emailFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo buscar usuarios.");
    }
  }

  async function toggleUser(targetUser: AdminUser) {
    setError("");
    setStatusMessage("");
    try {
      const response = targetUser.is_active
        ? await deactivateUserByEmail(targetUser.email)
        : await reactivateUserByEmail(targetUser.email);
      setStatusMessage(response.message);
      await loadBackoffice(emailFilter);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cambiar el estado del usuario.");
    }
  }

  if (!user?.is_admin) {
    return (
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Backoffice</p>
            <h2>Acceso restringido</h2>
          </div>
        </div>
        <div className="empty-card">Esta sección solo está disponible para la cuenta administradora.</div>
      </section>
    );
  }

  return (
    <div className="stack-page">
      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Backoffice</p>
            <h2>Gestión interna</h2>
            <p className="section-subtitle">Administración de usuarios, estado técnico y hoja de ruta del producto.</p>
          </div>
        </div>
        {statusMessage && <div className="success-inline">{statusMessage}</div>}
        {error && <div className="form-error">{error}</div>}
      </section>

      <section className="dual-grid">
        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Usuarios</p>
              <h2>Reactivar o desactivar</h2>
            </div>
          </div>
          <form className="backoffice-search-form" onSubmit={handleSearch}>
            <input
              type="text"
              placeholder="Buscar por correo"
              value={emailFilter}
              onChange={(e) => setEmailFilter(e.target.value)}
            />
            <button className="ghost-button">Buscar</button>
          </form>

          <div className="list-stack">
            {users.map((targetUser) => (
              <div className="card backoffice-user-row" key={targetUser.id}>
                <div className="backoffice-user-content">
                  <div className="backoffice-user-identity">
                    <span className="backoffice-user-avatar">{targetUser.nombre.charAt(0).toUpperCase()}</span>
                    <div>
                      <strong>{targetUser.nombre}</strong>
                      <p>{targetUser.email}</p>
                    </div>
                  </div>
                  <div className="backoffice-user-meta">
                    <span className={`status-pill ${targetUser.is_active ? "active" : "inactive"}`}>
                      {targetUser.is_active ? "Activo" : "Inactivo"}
                    </span>
                    <span className={`status-pill ${targetUser.is_admin ? "admin" : "member"}`}>
                      {targetUser.is_admin ? "Admin" : "Usuario"}
                    </span>
                  </div>
                  <div className="backoffice-user-action">
                    <button className="ghost-button small" type="button" onClick={() => toggleUser(targetUser)}>
                      {targetUser.is_active ? "Desactivar" : "Reactivar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!users.length && <div className="empty-card">No hay usuarios para ese filtro.</div>}
          </div>
        </article>

        <article className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Estado técnico</p>
              <h2>Configuración futura</h2>
            </div>
          </div>
          {systemOverview ? (
            <div className="settings-wishlist">
              <div className="wishlist-card">
                <strong>Google OAuth</strong>
                <p>{systemOverview.google_oauth_configured ? "Configurado" : "Pendiente"}</p>
              </div>
              <div className="wishlist-card">
                <strong>Recuperación por correo real</strong>
                <p>{systemOverview.password_reset_email_delivery ? "Activa" : "Pendiente"}</p>
              </div>
              <div className="wishlist-card">
                <strong>Modo desarrollo</strong>
                <p>{systemOverview.expose_reset_token_in_dev ? "Visible en frontend" : "Desactivado"}</p>
              </div>
              <div className="wishlist-card">
                <strong>Reset admin por reinicio</strong>
                <p>{systemOverview.admin_sync_on_startup ? "Activo" : "Desactivado"}</p>
              </div>
              <div className="wishlist-card full-span">
                <strong>Notas de seguridad</strong>
                <ul className="backoffice-notes">
                  {systemOverview.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="empty-card">Cargando estado técnico.</div>
          )}
        </article>
      </section>

      <section className="card">
        <div className="section-head">
          <div>
            <p className="eyebrow">Roadmap</p>
            <h2>Mejoras futuras</h2>
            <p className="section-subtitle">Lista operativa de ideas para próximas iteraciones del producto.</p>
          </div>
        </div>
        <div className="settings-wishlist">
          {roadmapItems.map((item) => (
            <article className="wishlist-card" key={item.title}>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
