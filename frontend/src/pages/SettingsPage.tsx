import { useMemo, useState } from "react";

import { useAuth } from "../hooks/useAuth";
import { BackofficePage } from "./BackofficePage";
import { BudgetsPage } from "./BudgetsPage";
import { CategoriesPage } from "./CategoriesPage";
import { ProfilePage } from "./ProfilePage";

type ConfigTab = "categorias" | "presupuestos" | "perfil";

export function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ConfigTab>("categorias");
  const [showBackoffice, setShowBackoffice] = useState(false);

  const content = useMemo(() => {
    if (activeTab === "categorias") return <CategoriesPage />;
    if (activeTab === "presupuestos") return <BudgetsPage />;
    return <ProfilePage />;
  }, [activeTab]);

  return (
    <div className="stack-page">
      <section className="card">
        <div className="section-head section-head-start">
          <div>
            <p className="eyebrow">Configuración</p>
            <h2>Centro de administración personal</h2>
            <p className="section-subtitle">Gestiona tus categorías, presupuestos y perfil desde un solo lugar.</p>
          </div>
        </div>

        <div className="dashboard-tabs settings-dashboard-tabs">
          <button
            type="button"
            className={`dashboard-tab ${activeTab === "categorias" ? "active" : ""}`}
            onClick={() => setActiveTab("categorias")}
          >
            Categorías
          </button>
          <button
            type="button"
            className={`dashboard-tab ${activeTab === "presupuestos" ? "active" : ""}`}
            onClick={() => setActiveTab("presupuestos")}
          >
            Presupuestos
          </button>
          <button
            type="button"
            className={`dashboard-tab ${activeTab === "perfil" ? "active" : ""}`}
            onClick={() => setActiveTab("perfil")}
          >
            Perfil
          </button>
        </div>

        <div className="dashboard-panel settings-dashboard-panel">
          <div className="dashboard-toolbar">
            <div>
              <p className="eyebrow">Administración personal</p>
              <h3>
                {activeTab === "categorias"
                  ? "Ordena y personaliza tus categorías"
                  : activeTab === "presupuestos"
                    ? "Define tus topes y rangos de control"
                    : "Ajusta tus datos financieros base"}
              </h3>
              <p className="section-subtitle">
                {activeTab === "categorias"
                  ? "Crea, reordena y da identidad visual a cada categoría."
                  : activeTab === "presupuestos"
                    ? "Mantén reglas claras para no perder de vista tus límites."
                    : "Centraliza tu ingreso estimado, meta de ahorro y contexto personal."}
              </p>
            </div>
          </div>

          <div className="settings-tab-panel">{content}</div>
        </div>
      </section>

      {user?.is_admin && (
        <section className="card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Backoffice</p>
              <h2>Administración avanzada</h2>
              <p className="section-subtitle">Visible solo para la cuenta administradora.</p>
            </div>
            <button className="ghost-button" type="button" onClick={() => setShowBackoffice((current) => !current)}>
              {showBackoffice ? "Ocultar backoffice" : "Mostrar backoffice"}
            </button>
          </div>

          {showBackoffice ? (
            <div className="settings-admin-panel">
              <BackofficePage />
            </div>
          ) : (
            <div className="empty-card">El backoffice está oculto. Puedes mostrarlo solo cuando lo necesites.</div>
          )}
        </section>
      )}
    </div>
  );
}
