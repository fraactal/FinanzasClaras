import { Link } from "react-router-dom";

export function ForgotPasswordPage() {
  return (
    <div className="auth-layout">
      <section className="auth-hero">
        <p className="eyebrow">Recuperación</p>
        <h1>La recuperación pública está deshabilitada.</h1>
        <p>Este acceso quedó bloqueado hasta implementar envío real por correo y un flujo más seguro.</p>
      </section>

      <section className="auth-card">
        <h2>Recuperación no disponible</h2>
        <p>
          Por ahora, el cambio de contraseña debe hacerse de forma controlada por administración para evitar accesos
          indebidos si alguien conoce tu correo.
        </p>
        <div className="stack-form">
          <div className="empty-card">
            Cuando el flujo se reactive, enviará instrucciones solo al correo real del usuario y no mostrará enlaces
            en pantalla.
          </div>
        </div>
        <p className="auth-link">
          <Link to="/login">Volver al login</Link>
        </p>
      </section>
    </div>
  );
}
