import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth";

export function AppShell() {
  const { user, logout } = useAuth();
  const today = new Intl.DateTimeFormat("es-CL", {
    dateStyle: "full",
  }).format(new Date());

  const navItems = [
    { to: "/", label: "Gastos" },
    { to: "/configuracion", label: "Ajustes" },
    { to: "/aprende", label: "Aprende" },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <Link to="/" className="brand">
            <span className="brand-mark">FC</span>
            <div>
              <h1>Finanzas Claras</h1>
              <p>Control simple para tu día a día</p>
            </div>
          </Link>
        </div>
        <div className="topbar-meta">
          <div>
            <strong>Hola, {user?.nombre}</strong>
            <p>{today}</p>
          </div>
          <button className="ghost-button" onClick={logout}>
            Salir
          </button>
        </div>
      </header>

      <nav className="main-nav">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.to === "/"}>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <main className="page-wrapper">
        <Outlet />
      </main>
    </div>
  );
}
