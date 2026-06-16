import { FormEvent, useEffect, useState } from "react";

import { fetchProfile, saveProfile } from "../services/dashboard";
import type { FinancialProfile } from "../types";
import { formatCurrencyInput, parseCurrencyInput } from "../utils/currency";

export function ProfilePage() {
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const paymentDayOptions = Array.from({ length: 31 }, (_, index) => index + 1);

  useEffect(() => {
    fetchProfile().then(setProfile).catch(console.error);
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;
    const updated = await saveProfile(profile);
    setProfile(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profile) {
    return <div className="screen-center">Cargando perfil financiero...</div>;
  }

  return (
    <section className="card">
      <div className="section-head">
        <div>
          <p className="eyebrow">Perfil financiero</p>
          <h2>Configura tu contexto</h2>
        </div>
      </div>
      <form className="profile-grid" onSubmit={handleSubmit}>
        <label>
          Ingreso mensual estimado
          <input
            type="text"
            inputMode="numeric"
            value={formatCurrencyInput(profile.ingreso_mensual_estimado)}
            onChange={(e) =>
              setProfile({
                ...profile,
                ingreso_mensual_estimado: parseCurrencyInput(e.target.value),
              })
            }
          />
        </label>
        <label>
          Meta de ahorro mensual
          <input
            type="text"
            inputMode="numeric"
            value={formatCurrencyInput(profile.meta_ahorro_mensual)}
            onChange={(e) =>
              setProfile({
                ...profile,
                meta_ahorro_mensual: parseCurrencyInput(e.target.value),
              })
            }
          />
        </label>
        <label>
          Día de pago estimado
          <select
            value={profile.dia_pago_estimado ?? ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                dia_pago_estimado: e.target.value ? Number(e.target.value) : null,
              })
            }
          >
            <option value="">Selecciona un día</option>
            {paymentDayOptions.map((day) => (
              <option key={day} value={day}>
                Día {day}
              </option>
            ))}
          </select>
        </label>
        <label>
          Moneda
          <input value={profile.moneda} onChange={(e) => setProfile({ ...profile, moneda: e.target.value })} />
        </label>
        <label>
          País
          <input value={profile.pais} onChange={(e) => setProfile({ ...profile, pais: e.target.value })} />
        </label>
        <label className="full-span">
          Objetivo principal
          <select
            value={profile.objetivo_financiero_principal ?? ""}
            onChange={(e) => setProfile({ ...profile, objetivo_financiero_principal: e.target.value })}
          >
            <option value="ordenar gastos">Ordenar gastos</option>
            <option value="ahorrar">Ahorrar</option>
            <option value="salir de deudas">Salir de deudas</option>
            <option value="controlar gastos hormiga">Controlar gastos hormiga</option>
            <option value="preparar presupuesto familiar">Preparar presupuesto familiar</option>
          </select>
        </label>
        <button className="primary-button">Guardar perfil</button>
        {saved && <span className="success-inline">Perfil actualizado.</span>}
      </form>
    </section>
  );
}
