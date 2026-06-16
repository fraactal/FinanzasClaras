import { FormEvent, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { resetPassword } from "../services/auth";

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!token) {
      setError("Falta el token de recuperación.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const response = await resetPassword(token, password);
      setMessage(response.message);
      setPassword("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <p className="eyebrow">Nueva contraseña</p>
        <h1>Define una contraseña nueva.</h1>
        <p>El enlace es temporal y solo sirve para restablecer el acceso a tu cuenta.</p>
      </section>

      <section className="auth-card">
        <h2>Cambiar contraseña</h2>
        <form onSubmit={handleSubmit} className="stack-form">
          <input type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <input
            type="password"
            placeholder="Repite la nueva contraseña"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          {error && <div className="form-error">{error}</div>}
          {message && <div className="success-inline">{message}</div>}
          <button className="primary-button" disabled={loading}>
            {loading ? "Guardando..." : "Guardar nueva contraseña"}
          </button>
        </form>
        <p className="auth-link">
          <Link to="/login">Ir al login</Link>
        </p>
      </section>
    </div>
  );
}
