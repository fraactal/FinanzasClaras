import { FormEvent, useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export function AuthPage({ mode }: { mode: "login" | "register" }) {
  const { user, login, register } = useAuth();
  const location = useLocation();
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (user) {
    return <Navigate to={location.state?.from?.pathname ?? "/"} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register(form.nombre, form.email, form.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo continuar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <h1>Controla tus gastos sin hacerte la vida difícil.</h1>
        <p>Registra lo que gastas, compara tu día con tu tope y entiende en qué se te va el dinero.</p>
      </section>

      <section className="auth-card">
        <h2>{mode === "login" ? "Iniciar sesión" : "Crear cuenta"}</h2>
        <p>{mode === "login" ? "Vuelve a tu resumen financiero." : "Empieza a ordenar tus gastos hoy."}</p>
        <form onSubmit={handleSubmit} className="stack-form">
          {mode === "register" && (
            <input
              placeholder="Tu nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <div className="password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 8 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          {error && <div className="form-error">{error}</div>}
          <button className="primary-button" disabled={loading}>
            {loading ? "Procesando..." : mode === "login" ? "Entrar" : "Crear cuenta"}
          </button>
        </form>
        <p className="auth-link">
          {mode === "login" ? "¿Aún no tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <Link to={mode === "login" ? "/registro" : "/login"}>{mode === "login" ? "Regístrate" : "Inicia sesión"}</Link>
        </p>
        {mode === "login" && <p className="auth-link auth-link-muted">La recuperación pública de contraseña está deshabilitada.</p>}
      </section>
    </div>
  );
}
